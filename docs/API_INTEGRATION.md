# API 对接最佳实践文档

## 📋 概述

本文档说明如何在 Next.js 项目中对接 Go 后端 HTTP 接口，遵循最佳实践，确保最佳性能和用户体验。

## 🏗️ 架构设计

### 1. API 客户端 (`lib/api/client.ts`)

- **自动 token 刷新**：401 时自动使用 refresh token cookie 刷新 access token
- **统一错误处理**：统一的错误处理和类型定义
- **Cookie 支持**：自动包含 credentials，支持 refresh token cookie

### 2. 类型定义 (`lib/api/types.ts`)

- 基于 `doc.json` (Swagger 2.0) 自动生成的 TypeScript 类型
- 完整的类型安全支持

### 3. API 函数 (`lib/api/*.ts`)

- 按模块划分：auth, users, posts, prompts, salables, transactions
- 纯函数，无副作用
- 统一导出到 `lib/api/index.ts`

### 4. React Query Hooks (`lib/hooks/use-api-*.ts`)

- 自动缓存管理
- 智能数据刷新
- 自动缓存失效和更新

## 🚀 快速开始

### 1. 环境变量配置

在 `.env.local` 中配置：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. 基本使用

#### 使用 API 函数（直接调用）

```tsx
import { getPosts, createPost } from "@/lib/api";

// 获取帖子列表
const posts = await getPosts({ limit: 20, offset: 0 });

// 创建帖子
const newPost = await createPost({
  title: "My Post",
  body: "Content",
});
```

#### 使用 React Query Hooks（推荐）

```tsx
import { usePosts, useCreatePost } from "@/lib/hooks/use-api-posts";

function PostsPage() {
  const { data, isLoading, error } = usePosts({ limit: 20 });
  const createPost = useCreatePost();

  const handleCreate = async () => {
    await createPost.mutateAsync({
      title: "New Post",
      body: "Content",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## 📚 详细使用指南

### 认证相关

#### Google 登录

```tsx
import { useGoogleSignIn } from "@/lib/hooks/use-api-auth";

function LoginButton() {
  const { mutate: signIn, isPending } = useGoogleSignIn();

  const handleGoogleLogin = async () => {
    // 获取 Google ID token（使用 Google OAuth 客户端）
    const idToken = await getGoogleIdToken();

    signIn({ id_token: idToken });
  };

  return <button onClick={handleGoogleLogin}>Google 登录</button>;
}
```

#### 获取当前用户

```tsx
import { useCurrentUserQuery } from "@/lib/hooks/use-api-auth";

function UserProfile() {
  const { data: user, isLoading } = useCurrentUserQuery();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>Welcome, {user.displayName}!</div>;
}
```

### 帖子相关

#### 获取帖子列表

```tsx
import { usePosts } from "@/lib/hooks/use-api-posts";

function PostList() {
  const { data, isLoading, error } = usePosts({
    limit: 20,
    offset: 0,
    tag_id: ["tag1", "tag2"],
    keyword: "search term",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### 无限滚动列表

```tsx
import { useInfinitePosts } from "@/lib/hooks/use-api-posts";

function InfinitePostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfinitePosts({ limit: 20 });

  return (
    <div>
      {data?.pages.map((page) =>
        page.data.map((post) => <PostCard key={post.id} post={post} />)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

#### 创建帖子

```tsx
import { useCreatePost } from "@/lib/hooks/use-api-posts";

function CreatePostForm() {
  const createPost = useCreatePost();

  const handleSubmit = async (data: CreatePostRequest) => {
    try {
      await createPost.mutateAsync(data);
      // 成功后会自动刷新列表
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 用户相关

#### 获取用户信息

```tsx
import { useUser } from "@/lib/hooks/use-api-users";

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.displayName}</div>;
}
```

#### 更新用户信息

```tsx
import { useUpdateCurrentUser } from "@/lib/hooks/use-api-users";

function EditProfile() {
  const updateUser = useUpdateCurrentUser();

  const handleUpdate = async (data: UpdateMeRequest) => {
    await updateUser.mutateAsync(data);
    // 成功后会自动更新缓存
  };

  return <form onSubmit={handleUpdate}>...</form>;
}
```

## 🎯 最佳实践

### 1. 优先使用 React Query Hooks

- ✅ 自动缓存管理
- ✅ 后台数据刷新
- ✅ 错误重试
- ✅ 加载状态管理

### 2. 合理使用缓存策略

不同类型的查询使用不同的缓存时间：

- **Posts 列表**：2 分钟缓存
- **Post 详情**：5 分钟缓存
- **User 信息**：10 分钟缓存
- **实时数据**：不缓存

### 3. 自动 token 刷新

API 客户端会自动处理 token 刷新：

- 401 错误时自动使用 refresh token cookie 刷新
- 刷新成功后自动重试原请求
- 刷新失败时清除 token 并跳转登录

### 4. 错误处理

```tsx
import { ApiClientError } from "@/lib/api";

try {
  const data = await getPosts();
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      // 未授权，跳转登录
      router.push("/login");
    } else if (error.status === 404) {
      // 未找到
      console.error("Not found");
    } else {
      // 其他错误
      console.error("Error:", error.message);
    }
  }
}
```

### 5. 类型安全

所有 API 函数都有完整的类型定义：

```tsx
import type { PostResource, CreatePostRequest } from "@/lib/api/types";

const post: PostResource = await getPostById("123");
const newPost = await createPost({
  title: "Title", // TypeScript 会检查类型
  body: "Body",
});
```

## 🔧 高级用法

### 自定义查询选项

```tsx
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/lib/api/posts";

function CustomPosts() {
  const { data } = useQuery({
    queryKey: ["posts", "custom"],
    queryFn: () => getPosts({ limit: 10 }),
    staleTime: 5 * 60 * 1000, // 自定义缓存时间
    refetchInterval: 30 * 1000, // 每 30 秒自动刷新
  });

  return <div>{/* ... */}</div>;
}
```

### 手动缓存管理

```tsx
import { useQueryClient } from "@tanstack/react-query";

function MyComponent() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // 刷新特定查询
    queryClient.invalidateQueries({ queryKey: ["posts"] });

    // 更新特定查询数据
    queryClient.setQueryData(["posts", "123"], newPostData);
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

## 📝 API 端点列表

### 认证

- `POST /auth/google/signin` - Google 登录
- `POST /auth/refresh` - 刷新 token

### 用户

- `GET /me` - 获取当前用户
- `PUT /me` - 更新当前用户
- `GET /users/{id}` - 获取用户信息

### 帖子

- `GET /posts` - 获取帖子列表
- `GET /posts/{id}` - 获取帖子详情
- `POST /posts` - 创建帖子
- `PUT /posts/{id}` - 更新帖子
- `POST /posts/{id}/publish` - 发布帖子

### Prompts

- `POST /prompts` - 创建 Prompt
- `GET /prompts/{id}` - 获取 Prompt 详情
- `PUT /prompts/{id}` - 更新 Prompt
- `POST /prompts/{id}/versions` - 添加 Prompt 版本

### Salables

- `GET /salables/created` - 获取创建的 Salables
- `GET /salables/purchased` - 获取购买的 Salables
- `POST /salables/{id}/publish` - 发布 Salable

### Transactions

- `POST /transactions` - 创建交易

## 🐛 故障排查

### 1. Token 刷新失败

检查：

- Cookie 是否正确设置
- API base URL 是否正确
- 后端 refresh token 是否有效

### 2. CORS 错误

确保后端配置了正确的 CORS 设置：

- 允许 credentials
- 允许前端域名

### 3. 类型错误

确保使用正确的类型：

```tsx
import type { PostResource } from "@/lib/api/types";
```

## 📚 相关文档

- [React Query 文档](https://tanstack.com/query/latest)
- [Swagger 2.0 规范](https://swagger.io/specification/v2/)
- [API 客户端实现](./lib/api/client.ts)
