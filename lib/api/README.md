# API 对接使用指南

## 📦 快速开始

### 1. 环境变量配置

在 `.env.local` 中添加：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. 基本使用示例

#### 使用 React Query Hooks（推荐）

```tsx
"use client";

import { usePosts } from "@/lib/hooks/use-api-posts";
import { useCurrentUserQuery } from "@/lib/hooks/use-api-auth";

export default function PostsPage() {
  const { data: user } = useCurrentUserQuery();
  const { data, isLoading, error } = usePosts({ limit: 20 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Posts</h1>
      {data?.data.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}
```

#### 直接调用 API 函数

```tsx
import { getPosts, createPost } from "@/lib/api";

// 在 Server Component 或 API Route 中使用
async function getPostsData() {
  const response = await getPosts({ limit: 20, offset: 0 });
  return response.data;
}
```

## 🎯 核心特性

### ✅ 自动 Token 刷新

当 access token 过期时（401 错误），API 客户端会自动：

1. 使用 refresh token cookie 刷新 access token
2. 重试原请求
3. 如果刷新失败，清除 token

### ✅ 智能缓存管理

使用 React Query 自动管理缓存：

- **Posts 列表**：2 分钟缓存
- **Post 详情**：5 分钟缓存
- **User 信息**：10 分钟缓存

### ✅ 类型安全

所有 API 都有完整的 TypeScript 类型定义。

## 📚 可用 Hooks

### 认证

- `useGoogleSignIn()` - Google 登录
- `useCurrentUserQuery()` - 获取当前用户
- `useLogout()` - 退出登录

### 帖子

- `usePosts(params)` - 获取帖子列表
- `useInfinitePosts(params)` - 无限滚动列表
- `usePost(id)` - 获取单个帖子
- `useCreatePost()` - 创建帖子
- `useUpdatePost()` - 更新帖子
- `usePublishPost()` - 发布帖子

### 用户

- `useUser(id)` - 获取用户信息
- `useUpdateCurrentUser()` - 更新当前用户

### Prompts

- `usePrompt(id)` - 获取 Prompt 详情
- `useCreatePrompt()` - 创建 Prompt
- `useUpdatePrompt()` - 更新 Prompt
- `useAddPromptVersion()` - 添加 Prompt 版本

### Salables

- `useCreatedSalables(params)` - 获取创建的 Salables
- `usePurchasedSalables()` - 获取购买的 Salables
- `usePublishSalable()` - 发布 Salable

### Transactions

- `useCreateTransaction()` - 创建交易

## 🔗 相关文档

- [完整 API 文档](./docs/API_INTEGRATION.md)
- [API 类型定义](./types.ts)
