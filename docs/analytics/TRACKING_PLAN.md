# MindFit 前端埋点方案

> 目标：为 Web 端构建一套统一、可扩展的数据采集体系，保证所有关键业务（登录、搜索、创作、购买、互动）都有完整的链路数据，并与服务端/Supabase 打通。

---

## 1. 体系概览

| 层级 | 说明 | 产出 |
| --- | --- | --- |
| 客户端采集 | `AnalyticsProvider` 注入全局上下文，暴露 `useTrack`、`trackExposure` 等 Hook；组件在交互点调用即可 | 统一事件对象、自动补齐公共字段 |
| 传输管道 | 浏览器端使用发送队列 + `navigator.sendBeacon`，失败兜底 `fetch`；离线时写入 `localStorage` 等待重发 | 提升兼容性，避免页面跳转丢数据 |
| API 层 | `app/api/track/route.ts` 校验入参（zod），批量写入数据库或消息队列 | 保障数据质量、可追踪异常 |
| 存储/分析 | Supabase 新增 `analytics_events` 表，JSONB 落地 `items` 和扩展字段；可直接基于 SQL / BI 取数 | 事件查询、漏斗、看板 |

数据流：组件触发 `track` → Provider 组装公共字段 → 入队列 / flush → `/api/track` → Supabase.

---

## 2. 客户端设计

### 2.1 Provider 与 Hook

1. `AnalyticsProvider`（挂载在 `app/providers.tsx`）
   - 初始化 `device_id`、`platform`、`version`、`user_id`
   - 监听 `next/navigation` 的 `usePathname` 触发 `page_view`
   - 提供 `track(event)`、`trackExposure(ref, payload)`、`flush()` 等方法
2. `AnalyticsContext` 统一公共字段，自动补齐 `refer`（来自 `pathname`）和时间戳。
3. `useTrack()` Hook 供组件调用；`trackExposure` 内部使用 `IntersectionObserver`，在元素露出 50% 时触发一次 `exposure`。

### 2.2 发送策略

- 队列：最大 10 条或 3 秒触发一次 `flush`。
- 发送：优先 `navigator.sendBeacon("/api/track", blob)`；不支持或失败时回退 `fetch`.
- 失败处理：写入 `localStorage.analytics_queue`，在 `visibilitychange` 回来或下一次 flush 时重试。

### 2.3 设备标识

- 首次访问生成 `device_id = crypto.randomUUID()`，写入 `localStorage` 与 `document.cookie`（便于 SSR）。
- `user_id` 缺失时填 `0`，但仍保留 `device_id`，后续登录后可在服务端做绑定。

---

## 3. 数据结构

### 3.1 事件对象

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `event_name` | `click` \| `page_view` \| `submit` \| `copy` \| `swipe` \| `toggle` \| `exposure` | 交互方式 |
| `ap_name` | string | action point，`页面_模块_动作`，保证唯一 |
| `refer` | `home` \| `post_detail` \| `product_detail` \| `publish` \| `notifications` \| `profile` \| `search` | 页面来源，基于路由映射 |
| `action_type` | enum | 仅关键动作使用（`login_success`, `login_failed`, `create_post`, `comment_post`, `pay_success`, `pay_failed`, `purchase_submit`） |
| `user_id` | string | 登录用户 ID，匿名填 `0` |
| `platform` | `web` / `wechat_app` | 当前端 |
| `version` | string | 读取 `NEXT_PUBLIC_APP_VERSION`，无则回退 `package.json` |
| `device_id` | string | 设备唯一 ID |
| `time` | number | `Date.now()` 毫秒 |
| `items` | `Array<{ item_type: string; item_value: string; item_meta?: Record<string, unknown> }>` | 事件载荷，见 3.2 |

### 3.2 `items` 规范

- `item_type`：业务实体（`post` / `product` / `cta` / `filter` / `search` 等）
- `item_value`：实体 ID 或关键值
- `item_meta`：补充信息（如价格、排序方式、标签、父评论 ID）

示例：

```ts
track({
  event_name: "click",
  ap_name: "home_feed_post_card",
  refer: "home",
  items: [
    {
      item_type: "post",
      item_value: post.id,
      item_meta: { price: price ?? 0, tag: tags?.[0] ?? null },
    },
  ],
})
```

---

## 4. API 与存储

### 4.1 `/api/track`

1. 接收 `POST`，body 为 `{ events: AnalyticsEvent[] }`
2. 使用 `zod` 校验字段，剔除不合法事件（并在日志中记录）
3. 将事件批量写入 Supabase：`supabaseServerClient.from("analytics_events").insert(...)`
4. 失败重试：返回 503，前端保留队列待重试

### 4.2 Supabase 表结构

```sql
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  ap_name text not null,
  refer text not null,
  action_type text,
  user_id text not null,
  device_id text not null,
  platform text not null,
  version text not null,
  time timestamptz not null,
  items jsonb not null,
  extra jsonb,
  inserted_at timestamptz not null default now()
);

create index analytics_events_ap_time_idx on analytics_events (ap_name, inserted_at desc);
create index analytics_events_user_idx on analytics_events (user_id);
```

---

## 5. 事件矩阵

> `路径` 列给出需要插桩的组件文件，方便定位。

### 5.1 全局 & 基础

| refer | ap_name | event_name | action_type | 场景 | items 示例 | 路径 |
| --- | --- | --- | --- | --- | --- | --- |
| `home`/`post_detail` 等 | `<page>_page` | `page_view` | - | 每次路由变更 | `[{"item_type":"page","item_value":refer}]` | `app/providers.tsx` |
| `*` | `require_auth_gate` | `block` | - | 未登录被 `useRequireAuth` 拦截 | `[{"item_type":"pending_action","item_value":actionType,"item_meta":params}]` | `lib/auth/use-require-auth.ts` |
| `home` | `navbar_login_btn` | `click` | - | 登录按钮点击 | `[{"item_type":"cta","item_value":"login"}]` | `components/layout/navbar.tsx` |
| `home` | `login_dialog_google` | `submit` | `login_success` / `login_failed` | Google 登录结果 | `[{"item_type":"login_provider","item_value":"google"}]` | `components/auth/google-login-button.tsx` |
| `home`/`search` | `navbar_search_submit` | `submit` | - | 搜索提交 | `[{"item_type":"search","item_value":query,"item_meta":{"search_type":searchType}}]` | `components/layout/navbar.tsx` |

### 5.2 首页（Feed）

| refer | ap_name | event_name | 场景 | items | 路径 |
| --- | --- | --- | --- | --- | --- |
| `home` | `home_feed_filter_tab` | `click` | 切换分类 | `[{"item_type":"filter","item_value":category,"item_meta":{"sort":activeSort}}]` | `components/feed/filter-tabs.tsx` |
| `home` | `home_feed_sort_toggle` | `toggle` | 热度/最新切换 | `[{"item_type":"sort","item_value":newSort}]` | 同上 |
| `home` | `home_feed_post_card` | `exposure` + `click` | 卡片曝光/点击 | `[{"item_type":"post","item_value":post.id,"item_meta":{"price":price,"tag":post.tags?.[0]}}]` | `components/post/post-card.tsx` |
| `home` | `home_hero_swiper` | `swipe` | Hero 轮播切换 | `[{"item_type":"slide","item_value":index}]` | `components/hero/hero-swiper.tsx` |

### 5.3 帖子详情

| refer | ap_name | event_name | action_type | 场景 | items | 路径 |
| --- | --- | --- | --- | --- | --- | --- |
| `post_detail` | `post_image_carousel` | `swipe` | - | 图集切换 | `[{"item_type":"post","item_value":post.id,"item_meta":{"total_images":images.length}}]` | `components/post/post-image-carousel.tsx` |
| `post_detail` | `post_paid_section_copy` | `copy` | - | 复制付费内容或提示词 | `[{"item_type":"product","item_value":product.id}]` | `components/post/paid-content-section.tsx` |
| `post_detail` | `post_comment_btn` | `submit` | `comment_post` | 评论发布成功 | `[{"item_type":"post","item_value":postId,"item_meta":{"parent_comment_id":parentCommentId}}]` | `components/comment/comment-input.tsx` |
| `post_detail` | `post_purchase_btn` | `submit` | `purchase_submit` | 点击购买 | `[{"item_type":"product","item_value":productId,"item_meta":{"price":price,"currency":currency}}]` | `components/product/purchase-product-button.tsx` |
| `post_detail` | `post_purchase_btn` | `submit` | `pay_success` / `pay_failed` | 区块链交易结果 | 同上 | 同上 |

### 5.4 发布流程

| refer | ap_name | event_name | action_type | 场景 | items | 路径 |
| --- | --- | --- | --- | --- | --- | --- |
| `publish` | `publish_editor_open` | `page_view` | - | 进入发布页 | `[{"item_type":"page","item_value":"publish"}]` | `app/publish/page.tsx` |
| `publish` | `publish_cover_select` | `click` | - | 选择封面 | `[{"item_type":"cover","item_value":coverId}]` | `components/publish/cover-selector.tsx` |
| `publish` | `publish_preview_modal` | `click` | - | 打开预览 | `[{"item_type":"post_draft","item_value":tempId}]` | `components/publish/preview-modal.tsx` |
| `publish` | `publish_submit_btn` | `submit` | `create_post` | 提交成功/失败 | `[{"item_type":"post_draft","item_value":tempId,"item_meta":{"has_images":images.length>0,"has_products":selectedProducts.length>0}}]` | `components/publish/publish-editor.tsx` |

### 5.5 商品详情 / Prompt 生成

| refer | ap_name | event_name | 场景 | items | 路径 |
| --- | --- | --- | --- | --- | --- |
| `product_detail` | `product_view_mode_tab` | `click` | 免费/付费切换 | `[{"item_type":"view_mode","item_value":viewMode}]` | `components/product/promptbase-product-detail-demo.tsx` |
| `product_detail` | `product_prompt_copy` | `copy` | 复制模板/示例 | `[{"item_type":"product","item_value":product.id,"item_meta":{"view_mode":viewMode,"template":"base/prefilled"}}]` | 同上 |
| `product_detail` | `product_generator_toggle` | `toggle` | 打开/关闭变量表单 | `[{"item_type":"generator","item_value":showGenerator}]` | 同上 |

### 5.6 通知 & 个人主页

| refer | ap_name | event_name | 场景 | items | 路径 |
| --- | --- | --- | --- | --- | --- |
| `notifications` | `notification_tab` | `click` | 切换通知类型 | `[{"item_type":"notification_tab","item_value":activeTab}]` | `app/notifications/page.tsx` |
| `notifications` | `notification_card` | `click` | 查看某条通知 | `[{"item_type":"notification","item_value":notification.id,"item_meta":{"type":notification.type}}]` | 同上 |
| `profile` | `profile_edit_toggle` | `toggle` | 进入/退出编辑模式 | `[{"item_type":"profile","item_value":user.id,"item_meta":{"is_editing":isEditing}}]` | `components/bento/bento-profile-page.tsx` |
| `profile` | `profile_add_block` | `click` | 新增 Bento 元素 | `[{"item_type":"bento_block","item_value":newElement.type,"item_meta":{"shape":newElement.shape}}]` | 同上 |

---

## 6. 实施步骤

1. **基础设施**
   - 新建 `lib/analytics` 目录：`types.ts`（zod + TypeScript 类型）、`client.ts`（队列与发送逻辑）、`context.tsx`（Provider）。
   - 修改 `app/providers.tsx`，在 `Providers` 外层包裹 `AnalyticsProvider`。
   - 创建 `app/api/track/route.ts`，实现批量写库（先写入 Supabase，再视情况推送到日志）。
2. **共用工具**
   - 在 `lib/hooks/use-track.ts` 内导出 Hook。
   - 构建 `useExposure`/`useTrackOnMount` 等辅助函数。
   - 在 `lib/auth/use-require-auth.ts` 中注入 `track`，采集拦截事件。
3. **优先埋点（第 1 批）**
   - 登录、搜索、页面 PV、Feed 卡片曝光/点击、购买按钮、发布提交（即上文关键链路）。
   - 验证接口写入成功，确认 Supabase 表有数据。
4. **扩展埋点（第 2 批）**
   - Prompt Generator、Notify Tab、Profile 编辑、Hero 轮播等。
   - 针对 `items` 保持结构一致，补充 `item_meta`。
5. **验证 & 监控**
   - 在 `/api/track` 内打印失败事件，设置告警阈值（错误率 > 1% 告警）。
   - 每日校验事件量与 PV、支付成功数是否合理。

---

## 7. 测试与质量保证

- **本地调试**：在开发环境中设置 `NEXT_PUBLIC_ANALYTICS_DEBUG=true` 时，将事件打印到控制台并阻止真实发送。
- **回归脚本**：编写简单的 E2E（Playwright）脚本验证登录、购买流程是否产生对应事件（可通过 API mock）。
- **字段校验**：`zod` schema 需与本文档保持一致，每次新增字段必须同步更新文档和 schema。
- **版本管理**: 在 `docs/analytics/TRACKING_PLAN.md` 维护版本号；埋点新需求需说明变更原因和上线时间。

---

该文档即为当前 MindFit Web 端埋点实施的唯一依据；后续如需扩展小程序或服务端埋点，可在此基础上复用公共字段与事件命名规范。***
