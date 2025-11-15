# CORS 问题调试指南

## 问题现象

1. **CORS 错误**：`Access to fetch at 'http://106.52.76.120:8080/auth/google/signin' from origin 'http://localhost:3000' has been blocked by CORS policy`
2. **网络错误**：`Google login failed: ApiClientError: Failed to fetch`

## 问题分析

从错误信息看，请求仍然直接发送到后端服务器 `http://106.52.76.120:8080/auth/google/signin`，而不是通过代理路由 `/api/proxy/auth/google/signin`。

**可能的原因**：

1. API 客户端没有使用代理路由
2. 环境变量覆盖了默认配置
3. `buildUrl` 函数没有正确处理相对路径

## 解决步骤

### 1. 检查 API 基础 URL

在浏览器控制台运行：

```javascript
// 检查当前使用的 API 基础 URL
console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
```

或者在代码中添加日志（已添加）：

```typescript
// lib/api/client.ts 中已添加调试日志
// 在浏览器控制台应该看到：[API Client] API Base URL: /api/proxy
```

### 2. 检查环境变量

检查 `.env.local` 文件（如果存在）：

```bash
cat .env.local
```

**如果存在且设置了 `NEXT_PUBLIC_API_BASE_URL`**：

- 确保值为 `/api/proxy`（使用代理）
- 或者删除该变量，让代码使用默认配置

### 3. 验证代理路由

在浏览器控制台测试代理路由：

```javascript
// 测试代理路由是否工作
fetch("/api/proxy/auth/google/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id_token: "test" }),
})
  .then((res) => {
    console.log("✅ 代理路由状态:", res.status);
    return res.json();
  })
  .then((data) => console.log("✅ 代理路由响应:", data))
  .catch((err) => console.error("❌ 代理路由失败:", err));
```

### 4. 检查网络请求

在浏览器开发者工具的 Network 标签中：

1. 打开 Network 标签
2. 尝试 Google 登录
3. 查看请求 URL：
   - ✅ **正确**：`http://localhost:3000/api/proxy/auth/google/signin`
   - ❌ **错误**：`http://106.52.76.120:8080/auth/google/signin`

### 5. 重启开发服务器

修改代码后，必须重启开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
pnpm dev
```

## 修复方案

### 方案 1：确保使用代理路由（推荐）

1. **删除或修改 `.env.local`**：

```bash
# 如果存在 .env.local，确保没有设置 NEXT_PUBLIC_API_BASE_URL
# 或者设置为：
NEXT_PUBLIC_API_BASE_URL=/api/proxy
```

2. **重启开发服务器**：

```bash
pnpm dev
```

3. **验证**：

在浏览器控制台应该看到：

```
[API Client] API Base URL: /api/proxy
```

### 方案 2：手动设置环境变量

在 `.env.local` 中明确设置：

```env
NEXT_PUBLIC_API_BASE_URL=/api/proxy
```

然后重启开发服务器。

### 方案 3：检查代码逻辑

确保 `lib/api/client.ts` 中的 `getApiBaseUrl` 函数正确：

```typescript
// 客户端应该返回 "/api/proxy"
if (typeof window !== "undefined") {
  return "/api/proxy";
}
```

## 验证修复

修复后，在浏览器控制台应该看到：

1. **API 基础 URL**：

   ```
   [API Client] API Base URL: /api/proxy
   ```

2. **网络请求**：

   - URL: `http://localhost:3000/api/proxy/auth/google/signin`
   - 状态: 200 或 401（401 是正常的，因为 token 无效）

3. **代理日志**（服务器控制台）：
   ```
   [Proxy] Forwarding request: {
     method: 'POST',
     path: 'auth/google/signin',
     from: '/api/proxy/auth/google/signin',
     to: 'http://106.52.76.120:8080/api/v1/auth/google/signin'
   }
   ```

## 常见问题

### Q: 仍然看到直接请求后端？

**A:**

1. 检查环境变量是否覆盖了默认配置
2. 确保重启了开发服务器
3. 清除浏览器缓存

### Q: 代理路由返回 404？

**A:**

1. 检查文件路径：`app/api/proxy/[...path]/route.ts`
2. 确保文件存在且正确
3. 重启开发服务器

### Q: 代理路由返回 500？

**A:**

1. 检查后端服务器是否运行
2. 查看服务器控制台日志
3. 检查后端地址配置是否正确

## 总结

**关键点**：

1. ✅ 客户端必须使用 `/api/proxy` 作为 API 基础 URL
2. ✅ 代理路由会自动转发到后端服务器
3. ✅ 所有请求都通过同源代理，避免 CORS 问题
4. ✅ 修改配置后必须重启开发服务器


