# Next.js 13+ App Router: 服务端组件 vs 客户端组件

## 常见错误

### 错误信息

```
Error: Attempted to call useQuery() from the server but useQuery is on the client.
It's not possible to invoke a client function from the server, it can only be
rendered as a Component or passed to props of a Client Component.
```

### 错误原因

在 Next.js 13+ App Router 中：

- **默认情况下，所有组件都是服务端组件（Server Components）**
- 服务端组件**不能使用**客户端 hooks，如：
  - `useState`
  - `useEffect`
  - `useQuery` (React Query)
  - `useRouter` (Next.js 客户端路由)
  - 任何自定义 hook（如果它内部使用了上述 hooks）

---

## 解决方案

### 方案 1：将组件标记为客户端组件（最简单）

在文件顶部添加 `"use client"` 指令：

```tsx
"use client";

import { useCurrentUserInfo } from "@/lib/hooks/use-api-auth";

export default function ProfilePage() {
  const { data: currentUser, isLoading } = useCurrentUserInfo(); // ✅ 现在可以使用了

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return <div>{currentUser?.name}</div>;
}
```

**优点**：

- 简单直接
- 适合需要大量交互的页面

**缺点**：

- 失去服务端渲染的优势
- 增加客户端 bundle 大小

---

### 方案 2：拆分为服务端 + 客户端组件（推荐）

保持页面为服务端组件，将需要客户端逻辑的部分提取到单独的客户端组件：

**app/profile/[username]/page.tsx** (服务端组件)

```tsx
import { ProfileContent } from "./profile-content";

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  // 这里可以做服务端数据获取
  // 或者直接渲染客户端组件
  return <ProfileContent username={params.username} />;
}
```

**app/profile/[username]/profile-content.tsx** (客户端组件)

```tsx
"use client";

import { useCurrentUserInfo } from "@/lib/hooks/use-api-auth";

export function ProfileContent({ username }: { username: string }) {
  const { data: currentUser, isLoading } = useCurrentUserInfo();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return <div>{currentUser?.name}</div>;
}
```

**优点**：

- 保持页面为服务端组件
- 只在需要的地方使用客户端组件
- 更好的性能和 SEO

**缺点**：

- 需要额外的文件和抽象

---

### 方案 3：服务端数据获取（最佳 SEO）

在服务端直接获取数据，不使用客户端 hooks：

```tsx
import { getCurrentUser } from "@/lib/api/users";

export default async function ProfilePage() {
  // 服务端直接调用 API
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    notFound();
  }

  return <div>{currentUser.name}</div>;
}
```

**优点**：

- 完全的服务端渲染
- 最佳 SEO
- 更快的首屏加载

**缺点**：

- 不适合需要频繁更新的数据
- 失去 React Query 的缓存和状态管理能力

---

## 如何选择？

### 使用客户端组件（"use client"）当：

✅ 需要使用浏览器 API（如 `window`, `localStorage`）
✅ 需要使用事件处理器（`onClick`, `onChange`）
✅ 需要使用 React hooks（`useState`, `useEffect`, `useQuery`）
✅ 需要使用交互式功能（动画、表单、实时更新）
✅ 使用需要客户端上下文的库（如 React Query）

### 使用服务端组件（默认）当：

✅ 只需要渲染静态内容
✅ 需要直接访问后端资源（数据库、文件系统）
✅ 需要保护敏感信息（API 密钥、token）
✅ 想要减少客户端 bundle 大小
✅ 想要更好的 SEO

---

## 实际案例

### 案例 1：个人资料页面（当前修复）

**问题**：

```tsx
// ❌ 错误：服务端组件使用客户端 hook
export default async function ProfilePage() {
  const { data: currentUser } = useCurrentUserInfo(); // Error!
  return <div>{currentUser?.name}</div>;
}
```

**解决**：

```tsx
// ✅ 正确：标记为客户端组件
"use client";

export default function ProfilePage() {
  const { data: currentUser, isLoading } = useCurrentUserInfo();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return <div>{currentUser?.name}</div>;
}
```

---

### 案例 2：带有用户认证的页面

**推荐方案**：拆分组件

```tsx
// app/dashboard/page.tsx (服务端组件)
import { DashboardContent } from "./dashboard-content";

export default function DashboardPage() {
  return <DashboardContent />;
}

// app/dashboard/dashboard-content.tsx (客户端组件)
("use client");

import { useCurrentUserInfo } from "@/lib/hooks/use-api-auth";

export function DashboardContent() {
  const { data: user, isLoading } = useCurrentUserInfo();

  if (isLoading) return <div>加载中...</div>;
  if (!user) return <div>请先登录</div>;

  return <div>欢迎，{user.name}!</div>;
}
```

---

### 案例 3：混合使用

```tsx
// app/blog/[id]/page.tsx (服务端组件)
import { getBlogPost } from "@/lib/api/blog";
import { CommentSection } from "./comment-section"; // 客户端组件

export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  // 服务端获取博客内容（静态，SEO 友好）
  const post = await getBlogPost(params.id);

  return (
    <article>
      {/* 服务端渲染的静态内容 */}
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* 客户端组件处理交互 */}
      <CommentSection postId={params.id} />
    </article>
  );
}

// app/blog/[id]/comment-section.tsx (客户端组件)
("use client");

import { useState } from "react";
import { useComments } from "@/lib/hooks/use-comments";

export function CommentSection({ postId }: { postId: string }) {
  const [newComment, setNewComment] = useState("");
  const { data: comments } = useComments(postId);

  return (
    <div>
      {/* 交互式评论功能 */}
      <input
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      {/* ... */}
    </div>
  );
}
```

---

## 调试技巧

### 如何判断组件是服务端还是客户端？

1. **检查文件顶部**：

   - 有 `"use client"` → 客户端组件
   - 没有 → 服务端组件（默认）

2. **在组件中添加日志**：

   ```tsx
   console.log(
     "我在哪里？",
     typeof window === "undefined" ? "服务端" : "客户端"
   );
   ```

3. **查看错误信息**：
   - "cannot be used in Server Components" → 你在服务端组件中使用了客户端功能

### 常见错误和解决方法

| 错误信息                                   | 原因                             | 解决方法                                                   |
| ------------------------------------------ | -------------------------------- | ---------------------------------------------------------- |
| `useQuery is on the client`                | 在服务端使用 React Query         | 添加 `"use client"`                                        |
| `useState only works in Client Components` | 在服务端使用 useState            | 添加 `"use client"`                                        |
| `window is not defined`                    | 在服务端访问浏览器 API           | 添加 `"use client"` 或检查 `typeof window !== "undefined"` |
| `async/await is not valid in page router`  | 在旧版 Pages Router 使用异步组件 | 使用 `getServerSideProps` 或迁移到 App Router              |

---

## 性能最佳实践

### 1. 尽可能使用服务端组件

```tsx
// ✅ 好：大部分是服务端组件
export default async function ProductPage() {
  const product = await getProduct();

  return (
    <div>
      <ProductInfo product={product} /> {/* 服务端 */}
      <ProductImages images={product.images} /> {/* 服务端 */}
      <AddToCartButton productId={product.id} /> {/* 客户端 */}
    </div>
  );
}
```

### 2. 客户端组件应该尽可能小

```tsx
// ❌ 不好：整个页面都是客户端组件
"use client";
export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  return (
    <div>
      <ProductInfo /> {/* 不需要是客户端 */}
      <ProductImages /> {/* 不需要是客户端 */}
      <QuantitySelector value={quantity} onChange={setQuantity} />
    </div>
  );
}

// ✅ 好：只有需要交互的部分是客户端
export default async function ProductPage() {
  return (
    <div>
      <ProductInfo /> {/* 服务端 */}
      <ProductImages /> {/* 服务端 */}
      <QuantitySelector /> {/* 客户端 */}
    </div>
  );
}
```

### 3. 使用 React Query 时的考虑

```tsx
// 方案 A：完全客户端（简单但失去 SSR）
"use client";
export default function PostsPage() {
  const { data: posts } = usePosts();
  return <PostList posts={posts} />;
}

// 方案 B：服务端预获取 + 客户端 hydrate（推荐）
// app/posts/page.tsx
import { getPosts } from "@/lib/api/posts";
import { PostsClient } from "./posts-client";

export default async function PostsPage() {
  const initialPosts = await getPosts();
  return <PostsClient initialData={initialPosts} />;
}

// app/posts/posts-client.tsx
("use client");
export function PostsClient({ initialData }) {
  const { data: posts } = usePosts({ initialData });
  return <PostList posts={posts} />;
}
```

---

## 总结

✅ **默认使用服务端组件**，享受更好的性能和 SEO
✅ **只在需要时使用客户端组件**（交互、hooks、浏览器 API）
✅ **将客户端组件尽可能推到组件树的叶子节点**
✅ **使用 "use client" 指令明确标记客户端组件**
✅ **遇到错误时，检查组件类型和 hook 使用位置**

记住：**"use client" 是一个边界，而不是一个禁令**。它标记了从哪里开始，所有子组件都会成为客户端 bundle 的一部分。


