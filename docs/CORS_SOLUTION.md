# Next.js 跨域问题解决方案

## 问题说明

当前端应用（`http://localhost:3000`）直接请求后端 API（`http://106.52.76.120:8080`）时，会遇到跨域（CORS）问题：

```
Access to fetch at 'http://106.52.76.120:8080/api/v1/auth/google/signin'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## 解决方案

Next.js 提供了多种方式解决跨域问题，推荐使用 **API 代理路由**。

### 方案 1：使用 API 代理路由（推荐）✅

**优点**：

- 完全控制请求和响应
- 可以添加认证、日志等中间件
- 隐藏后端地址
- 支持所有 HTTP 方法

**实现**：

已创建代理路由：`app/api/proxy/[...path]/route.ts`

**使用方式**：

修改 `lib/api/client.ts`，将 API 请求改为通过代理：

```typescript
// 原来的方式（直接请求后端）
const API_BASE_URL = "http://106.52.76.120:8080/api/v1";

// 改为通过 Next.js 代理
const API_BASE_URL = "/api/proxy";
```

**示例**：

```typescript
// 原来的请求
POST http://106.52.76.120:8080/api/v1/auth/google/signin

// 通过代理的请求
POST /api/proxy/auth/google/signin
```

### 方案 2：使用 Rewrites（简单但有限制）

在 `next.config.mjs` 中配置：

```javascript
async rewrites() {
  return [
    {
      source: "/api/backend/:path*",
      destination: "http://106.52.76.120:8080/api/v1/:path*",
    },
  ];
}
```

**使用方式**：

```typescript
// 请求会被自动重写到后端
fetch("/api/backend/auth/google/signin");
```

**限制**：

- 只能处理 GET 和 POST 请求
- 不能修改请求头
- 不能处理复杂的认证逻辑

### 方案 3：在后端配置 CORS（如果后端可控）

如果后端服务器是你控制的，可以在后端配置 CORS：

**Go 后端示例**：

```go
import (
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // 配置 CORS
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000", "https://yourdomain.com"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    // ... 其他路由
}
```

## 推荐实现：使用代理路由

### 1. 修改 API 客户端配置

更新 `lib/api/client.ts`：

```typescript
// 优先使用环境变量
const getApiBaseUrl = (): string => {
  // 1. 优先使用环境变量（如果设置了代理路径）
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 2. 开发环境使用代理（解决跨域）
  if (typeof window !== "undefined") {
    // 客户端：使用代理路由
    return "/api/proxy";
  }

  // 3. 服务端：直接请求后端（SSR 时）
  if (ENV_CONFIG.IS_DEV) {
    return `${ENV_CONFIG.DEV_API_URL}/api/v1`;
  }

  if (ENV_CONFIG.IS_PROD) {
    return `${ENV_CONFIG.PROD_API_URL}/api/v1`;
  }

  return "http://localhost:8080/api/v1";
};
```

### 2. 环境变量配置

在 `.env.local` 中：

```env
# 使用代理路由（推荐，解决跨域）
NEXT_PUBLIC_API_BASE_URL=/api/proxy

# 或者直接请求后端（需要后端配置 CORS）
# NEXT_PUBLIC_API_BASE_URL=http://106.52.76.120:8080/api/v1
```

### 3. 代理路由已创建

代理路由文件：`app/api/proxy/[...path]/route.ts`

功能：

- ✅ 自动转发所有请求到后端
- ✅ 处理 CORS 头
- ✅ 转发认证 token
- ✅ 支持 Cookie（用于 refresh token）
- ✅ 支持所有 HTTP 方法

## 使用示例

### 修改前（直接请求后端）

```typescript
// lib/api/auth.ts
export async function googleSignIn(payload: GoogleSignInRequest) {
  const response = await apiClient.post<AuthResponse>(
    "/auth/google/signin", // 直接请求后端
    payload
  );
  return response;
}
```

### 修改后（通过代理）

```typescript
// lib/api/auth.ts
export async function googleSignIn(payload: GoogleSignInRequest) {
  const response = await apiClient.post<AuthResponse>(
    "/auth/google/signin", // 通过 /api/proxy 转发
    payload
  );
  return response;
}
```

**注意**：如果 API 客户端配置了代理路径，路径会自动添加前缀。

## 验证配置

### 1. 测试代理路由

在浏览器控制台运行：

```javascript
// 测试代理路由
fetch("/api/proxy/auth/google/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id_token: "test" }),
})
  .then((res) => res.json())
  .then((data) => console.log("✅ 代理路由工作正常:", data))
  .catch((err) => console.error("❌ 代理路由失败:", err));
```

### 2. 检查网络请求

在浏览器开发者工具的 Network 标签中：

- 应该看到请求发送到 `/api/proxy/...`
- 不应该有 CORS 错误
- 响应应该正常返回

## 常见问题

### Q: 代理路由返回 404？

**A:** 检查：

1. 文件路径是否正确：`app/api/proxy/[...path]/route.ts`
2. 路径参数是否正确：`/api/proxy/auth/google/signin`
3. 重启开发服务器

### Q: 代理路由返回 500？

**A:** 检查：

1. 后端服务器是否运行
2. 后端地址配置是否正确
3. 查看服务器日志

### Q: 仍然有 CORS 错误？

**A:**

1. 确保使用代理路由（`/api/proxy`）而不是直接请求后端
2. 检查 `next.config.mjs` 中的 CORS 头配置
3. 清除浏览器缓存

### Q: 服务端渲染（SSR）时如何使用？

**A:** 在服务端，可以直接请求后端（不需要代理）：

```typescript
// 服务端代码
const API_BASE_URL = "http://106.52.76.120:8080/api/v1";

// 客户端代码
const API_BASE_URL = "/api/proxy";
```

代理路由会自动处理这个区别。

## 总结

**推荐方案**：使用 API 代理路由

1. ✅ 完全解决跨域问题
2. ✅ 可以添加中间件逻辑
3. ✅ 隐藏后端地址
4. ✅ 支持所有 HTTP 方法
5. ✅ 支持 Cookie 和认证

**快速开始**：

1. 代理路由已创建：`app/api/proxy/[...path]/route.ts`
2. 在 `.env.local` 中设置：`NEXT_PUBLIC_API_BASE_URL=/api/proxy`
3. 重启开发服务器
4. 测试 Google 登录

## 相关文档

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Rewrites](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites)
- [API 配置文档](./API_CONFIGURATION.md)
