# 登录弹窗系统实现总结

## 已完成的功能

### 1. 认证系统重构 ✅

- **移除 Web3 钱包登录**：不再使用 Web3 钱包作为主要认证方式
- **基于 Supabase Auth**：完全使用 Supabase Auth 进行用户认证
- **创建 AuthContext**：`lib/auth/auth-context.tsx` - 管理全局认证状态
- **更新 useCurrentUser**：改为基于 Supabase Auth 的 wrapper

### 2. 登录弹窗组件 ✅

- **主弹窗组件**：`components/auth/login-dialog.tsx`

  - 左右分栏布局
  - 左侧：微信扫码登录
  - 右侧：Google 登录和邮箱验证码登录

- **微信扫码登录**：`components/auth/wechat-qr-login.tsx`

  - 二维码显示
  - 轮询扫码状态
  - Mock 实现（需要配置微信开放平台）

- **Google 登录**：`components/auth/google-login.tsx`

  - 使用 Supabase Auth 的 Google Provider
  - OAuth 2.0 集成

- **邮箱验证码登录**：`components/auth/email-code-login.tsx`
  - 邮箱输入
  - 验证码发送（60 秒倒计时）
  - 验证码验证
  - 用户协议复选框

### 3. 登录状态管理 ✅

- **useLoginDialog Hook**：`lib/auth/use-login-dialog.ts`

  - 全局弹窗状态管理
  - 待执行操作队列
  - 登录后自动执行回调

- **useRequireAuth Hook**：`lib/auth/use-require-auth.ts`
  - 受保护功能检查
  - 未登录时自动打开登录弹窗

### 4. 后端 API 路由 ✅

- **微信登录 API**：

  - `app/api/auth/wechat/qrcode/route.ts` - 获取二维码
  - `app/api/auth/wechat/status/route.ts` - 检查扫码状态
  - 当前为 Mock 实现，需要配置微信开放平台

- **邮箱验证码 API**：

  - `app/api/auth/email/send-code/route.ts` - 发送验证码
  - `app/api/auth/email/verify/route.ts` - 验证验证码
  - 使用 Supabase Auth 的 OTP 功能（需要完善）

- **Google OAuth 回调**：
  - `app/auth/callback/route.ts` - 处理 OAuth 回调

### 5. 受保护功能拦截 ✅

- **发布内容**：`components/publish/publish-editor.tsx`

  - 添加登录检查
  - 未登录时提示"请先登录"

- **评论功能**：`components/comment/comment-input.tsx`

  - 使用 useRequireAuth Hook
  - 未登录时打开登录弹窗

- **购买商品**：`components/product/purchase-product-button.tsx`

  - 添加登录检查
  - 移除 Web3 钱包地址检查（可选）

- **查看通知**：`app/notifications/page.tsx`
  - 未登录时自动打开登录弹窗

### 6. UI 更新 ✅

- **Navbar**：`components/layout/navbar.tsx`

  - 登录按钮（未登录时）
  - 用户菜单（已登录时）
  - 通知按钮（受保护功能）

- **Providers**：`app/providers.tsx`
  - 添加 AuthProvider
  - 添加 LoginDialog 组件

### 7. 数据库 Schema 更新 ⚠️

- **迁移文件**：`lib/supabase/migrations/add-auth-fields.sql`
  - 添加`email`字段
  - 添加`wechat_unionid`字段
  - 添加`google_id`字段
  - 添加`auth_user_id`字段（关联 Supabase Auth 用户）

**注意**：需要在 Supabase 中执行此迁移文件

## 待完成的工作

### 1. 数据库迁移

需要执行 `lib/supabase/migrations/add-auth-fields.sql` 文件：

1. 在 Supabase Dashboard 打开 SQL Editor
2. 复制迁移文件内容
3. 执行 SQL 语句

### 2. 配置环境变量

在 `.env.local` 中添加：

```env
# Google OAuth (可选，如果使用Supabase Auth的Google Provider)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# 微信开放平台 (Mock，需要实际配置)
NEXT_PUBLIC_WECHAT_APPID=mock_appid
NEXT_PUBLIC_WECHAT_APPSECRET=mock_secret

# 邮件服务 (如果需要自定义邮件服务)
EMAIL_SERVICE_API_KEY=your_email_service_key
```

### 3. Supabase 配置

1. 在 Supabase Dashboard 启用 Google Provider
2. 配置 OAuth 回调 URL：`https://your-domain.com/auth/callback`
3. 配置邮件服务（如果需要自定义验证码）

### 4. 完善功能

- **邮箱验证码**：当前使用 Supabase OTP，需要完善自定义验证码逻辑
- **微信登录**：需要配置微信开放平台，实现真实的二维码生成和状态检查
- **用户创建**：完善 AuthContext 中的用户创建逻辑，处理各种登录方式

## 使用说明

### 打开登录弹窗

```typescript
import { useLoginDialog } from "@/lib/auth/use-login-dialog";

const { openDialog } = useLoginDialog();
openDialog(); // 打开登录弹窗
```

### 受保护功能

```typescript
import { useRequireAuth } from "@/lib/auth/use-require-auth";

const { requireAuth } = useRequireAuth();

// 在需要登录的功能中
requireAuth(
  () => {
    // 执行需要登录的操作
  },
  "action_type", // 操作类型
  {
    /* 参数 */
  }
);
```

### 获取当前用户

```typescript
import { useAuth } from "@/lib/auth/auth-context";
// 或
import { useCurrentUser } from "@/lib/hooks/use-current-user";

const { user, isAuthenticated, isLoading } = useAuth();
// 或
const { user, isAuthenticated, isLoading } = useCurrentUser();
```

## 注意事项

1. **Web3 钱包功能**：虽然移除了 Web3 钱包登录，但 Wagmi 配置仍然保留，如果未来需要 Web3 功能（如购买商品时使用钱包），可以保留相关代码

2. **邮箱验证码**：当前实现使用 Supabase OTP，如果需要自定义验证码（6 位数字），需要：

   - 实现验证码存储（Redis 或数据库）
   - 实现邮件发送服务
   - 更新验证逻辑

3. **微信登录**：当前为 Mock 实现，需要：

   - 配置微信开放平台
   - 实现真实的二维码生成
   - 实现扫码状态检查
   - 处理用户信息获取和创建

4. **用户数据同步**：确保 Supabase Auth 用户和 users 表数据同步，当前在 AuthContext 中自动创建用户记录
