# Spotlight 数据迁移指南

## 📋 概述

本文档说明如何将 Hero Swiper 组件中的 mock 数据迁移到 Supabase，并使用 API 接口获取数据。

## 🗄️ 数据库迁移

### 1. 添加 badge 字段

首先需要为 `posts` 表添加 `badge` 字段：

```sql
-- 运行迁移脚本
-- lib/supabase/migrations/add_badge_to_posts.sql
```

或者在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS badge TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_badge ON public.posts(badge) WHERE badge IS NOT NULL;
```

### 2. 运行数据迁移脚本

```bash
# 迁移 spotlight 项目数据到 Supabase
pnpm db:seed:spotlight
```

脚本会：

- 创建或更新用户（如果不存在）
- 创建或更新帖子（包含 badge 信息）
- 自动处理重复数据

## 📝 数据格式

### Posts 表结构

```sql
posts (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  images TEXT[],
  tags TEXT[],
  badge TEXT,  -- 新增字段：热门、精选、新作、推荐
  view_count INTEGER,
  like_count INTEGER,
  comment_count INTEGER,
  ...
)
```

### Badge 值

- `热门` - 热门内容
- `精选` - 精选内容
- `新作` - 最新作品
- `推荐` - 推荐内容

## 🔌 API 使用

### 1. 直接调用 API

```typescript
import { getSpotlightPosts } from "@/lib/supabase/api/spotlight";

const { data, error } = await getSpotlightPosts(6);
```

### 2. 使用 React Query Hook（推荐）

```typescript
import { useSpotlightPosts } from "@/lib/hooks/use-spotlight-posts";

function MyComponent() {
  const { data, isLoading, error } = useSpotlightPosts(6);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## 🎨 组件更新

`HeroSwiper` 组件已经更新为：

- ✅ 使用 `useSpotlightPosts` hook 获取数据
- ✅ 自动处理加载和错误状态
- ✅ 支持动态数据更新
- ✅ 保持原有的 UI 和交互效果

## 📊 数据查询逻辑

`getSpotlightPosts` 函数会：

1. 只获取有 `badge` 的帖子
2. 按 `view_count` 降序排序
3. 再按 `like_count` 降序排序
4. 限制返回数量（默认 6 条）

## 🔄 缓存策略

使用 React Query 自动缓存：

- **缓存时间**：2 分钟
- **垃圾回收时间**：5 分钟
- **自动刷新**：后台自动更新

## 🛠️ 维护

### 更新 Spotlight 帖子

1. 在 Supabase Dashboard 中编辑帖子
2. 设置 `badge` 字段值
3. 调整 `view_count` 和 `like_count` 影响排序

### 添加新的 Spotlight 帖子

```typescript
// 使用 API 创建帖子时设置 badge
await createPost({
  // ... 其他字段
  badge: "热门", // 或 "精选"、"新作"、"推荐"
});
```

或在 Supabase Dashboard 中直接编辑帖子的 `badge` 字段。

## 📚 相关文件

- `lib/supabase/api/spotlight.ts` - Spotlight API 函数
- `lib/hooks/use-spotlight-posts.ts` - React Query Hook
- `components/hero/hero-swiper.tsx` - Hero Swiper 组件
- `scripts/seed-spotlight-posts.ts` - 数据迁移脚本
- `lib/supabase/migrations/add_badge_to_posts.sql` - 数据库迁移脚本
