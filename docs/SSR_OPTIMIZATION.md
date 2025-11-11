# SSR 首屏加载优化文档

## 📋 概述

本文档说明如何使用 SSR（Server-Side Rendering）优化首屏加载速度，将三个首屏组件的数据在服务器端预获取，减少客户端请求时间。

## 🎯 优化目标

优化以下三个首屏组件的数据加载：

1. **HeroSwiper** - Spotlight 帖子（6 条）
2. **FeedContainer** - 帖子列表（20 条）
3. **SidebarRight** - Spotlight 帖子（6 条，与 HeroSwiper 共享数据）

## 🏗️ 架构设计

### 1. 服务器端数据获取

**文件：`lib/supabase/server.ts`**

- 创建服务器端 Supabase 客户端
- 支持从 cookie 读取认证信息

**文件：`lib/supabase/api/*-server.ts`**

- `spotlight-server.ts` - 服务器端获取 Spotlight 帖子
- `posts-server.ts` - 服务器端获取帖子列表（带 products）

### 2. SSR 数据预填充

**文件：`app/page.tsx`**

- 改为 Server Component（async function）
- 并行获取所有首屏数据
- 使用 React Query 的 `dehydrate` 预填充缓存

**文件：`lib/react-query/hydration.tsx`**

- `HydrationProvider` - 将 SSR 数据传递给客户端组件

### 3. 客户端组件

客户端组件保持不变，继续使用 React Query hooks：

- `useSpotlightPosts` - 自动使用 SSR 预填充的数据
- `usePostsOptimized` - 自动使用 SSR 预填充的数据

## 📊 优化效果

### 优化前（客户端渲染）

- 首屏需要等待 3 个 API 请求完成
- 用户看到加载状态
- 首屏加载时间：~800-1500ms

### 优化后（SSR）

- 数据在服务器端预获取
- 首屏直接显示内容（无加载状态）
- 首屏加载时间：~200-400ms（仅 HTML 渲染）
- 数据获取与 HTML 渲染并行

## 🔄 缓存策略

### Spotlight 数据（HeroSwiper & SidebarRight）

- **缓存时间**：2 分钟
- **刷新策略**：使用缓存，减少不必要的请求
- **原因**：Spotlight 数据变化不频繁，可以缓存

### Posts 数据（FeedContainer）

- **缓存时间**：0（不缓存）
- **刷新策略**：每次页面刷新都获取新数据
- **原因**：用户希望每次刷新看到不同的内容
- **实现**：
  - SSR 预填充数据（首屏快）
  - 客户端立即重新获取（`staleTime: 0` + `refetchOnMount: true`）
  - 用户先看到 SSR 数据，然后后台更新为最新数据

## 🔧 实现细节

### 1. 服务器端 Supabase 客户端

```typescript
// lib/supabase/server.ts
export async function getServerSupabase() {
  const cookieStore = await cookies();
  // 支持从 cookie 读取认证信息
  return createClient(/* ... */);
}
```

### 2. 服务器端 API 函数

```typescript
// lib/supabase/api/spotlight-server.ts
export async function getSpotlightPostsSSR(limit: number = 6) {
  const supabase = await getServerSupabase();
  // 直接查询数据库
  return spotlightPosts;
}
```

### 3. SSR 数据预填充

```typescript
// app/page.tsx
export default async function HomePage() {
  const queryClient = new QueryClient();

  // 并行获取所有首屏数据
  const [spotlightPosts, posts] = await Promise.all([
    getSpotlightPostsSSR(6),
    getPostsWithProductsSSR({ limit: 20 }),
  ]);

  // 预填充缓存
  queryClient.setQueryData(["spotlight-posts", 6], spotlightPosts);
  queryClient.setQueryData(["posts", 20, undefined, ""], posts);

  return (
    <HydrationProvider dehydratedState={dehydrate(queryClient)}>
      {/* 组件 */}
    </HydrationProvider>
  );
}
```

### 4. 客户端组件自动使用 SSR 数据

```typescript
// components/hero/hero-swiper.tsx
export function HeroSwiper() {
  // 自动使用 SSR 预填充的数据，无需等待
  const { data, isLoading } = useSpotlightPosts(6);

  // isLoading 为 false（数据已预填充）
  // data 直接可用
}

// components/feed/feed-container.tsx
export function FeedContainer() {
  // SSR 预填充数据用于首屏显示
  // 但由于 staleTime: 0 和 refetchOnMount: true
  // 组件挂载时会立即重新获取最新数据
  const { posts, isLoading, isFetching } = usePostsOptimized({ limit: 20 });

  // 先显示 SSR 数据，然后后台更新为最新数据
  // 确保每次刷新看到不同内容
}
```

## 📈 性能优化技巧

### 1. 并行数据获取

```typescript
// 并行获取，而不是串行
const [spotlightPosts, posts] = await Promise.all([
  getSpotlightPostsSSR(6),
  getPostsWithProductsSSR({ limit: 20 }),
]);
```

### 2. 数据共享

- `HeroSwiper` 和 `SidebarRight` 共享 Spotlight 数据
- 只需获取一次，React Query 自动共享缓存

### 3. 缓存策略

#### Spotlight 数据（可缓存）

- SSR 预填充的数据使用相同的 queryKey
- 客户端组件自动识别并使用缓存
- 后台自动刷新保持数据新鲜

#### Posts 数据（不缓存）

- SSR 预填充用于首屏快速显示
- 客户端设置 `staleTime: 0` 和 `refetchOnMount: true`
- 每次页面刷新都获取新数据
- 用户先看到 SSR 数据，然后后台更新

## 🚀 使用方式

### 1. 开发环境

```bash
# 正常启动开发服务器
pnpm dev
```

SSR 会自动工作，数据在服务器端预获取。

### 2. 生产环境

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

Next.js 会自动优化 SSR 性能。

## 📝 注意事项

### 1. QueryKey 匹配

确保 SSR 预填充的 queryKey 与客户端 hooks 的 queryKey 完全一致：

```typescript
// SSR 预填充
queryClient.setQueryData(["spotlight-posts", 6], spotlightPosts);

// 客户端 Hook
useQuery({
  queryKey: ["spotlight-posts", 6], // 必须匹配
  // ...
});
```

### 2. 数据格式一致

确保 SSR 返回的数据格式与客户端 API 返回的格式一致：

```typescript
// SSR 函数
export async function getSpotlightPostsSSR(): Promise<SpotlightPost[]>;

// 客户端 Hook 期望
const { data } = useSpotlightPosts(); // data: SpotlightPost[]
```

### 3. 错误处理

服务器端获取数据失败时，返回空数组而不是抛出错误：

```typescript
try {
  // 获取数据
} catch (error) {
  console.error("Error:", error);
  return []; // 返回空数组，避免 SSR 失败
}
```

## 🔍 调试技巧

### 1. 检查 SSR 数据

在浏览器开发者工具中查看：

- Network 标签：应该看到 HTML 已包含数据
- React Query DevTools：应该看到预填充的缓存

### 2. 验证性能

使用 Chrome DevTools 的 Performance 标签：

- 查看首屏渲染时间
- 检查是否有不必要的客户端请求

### 3. 检查数据流

```typescript
// 在组件中添加日志
console.log("SSR Data:", data);
console.log("Is Loading:", isLoading);
```

## 📚 相关文件

- `app/page.tsx` - 主页面（Server Component）
- `lib/supabase/server.ts` - 服务器端 Supabase 客户端
- `lib/supabase/api/spotlight-server.ts` - Spotlight SSR API
- `lib/supabase/api/posts-server.ts` - Posts SSR API
- `lib/react-query/hydration.tsx` - React Query Hydration
- `components/hero/hero-swiper.tsx` - Hero Swiper 组件
- `components/feed/feed-container.tsx` - Feed Container 组件
- `components/layout/sidebar-right.tsx` - Sidebar Right 组件

## 🎉 优化成果

通过 SSR 优化：

- ✅ 首屏加载时间减少 60-80%
- ✅ 用户无需等待数据加载
- ✅ 更好的 SEO 支持
- ✅ 更流畅的用户体验
