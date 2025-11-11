# API 配置指南

## 问题诊断

### ERR_CONNECTION_REFUSED

如果遇到错误：`POST http://localhost:8080/api/v1/auth/google/signin net::ERR_CONNECTION_REFUSED`

这通常是因为：

1. 后端服务器没有运行
2. API 地址配置不正确
3. 环境变量没有设置

### 404 Not Found

如果遇到 `404 page not found`：

- **对于 `/health` 端点**：这是正常的，健康检查端点可能不存在，不影响功能
- **对于 `/auth/google/signin` 端点**：说明 API 路径配置错误，需要检查：
  1. API 基础 URL 是否正确
  2. 端点路径是否正确（应该是 `/auth/google/signin`）
  3. 后端服务器路由配置是否正确

## 解决方案

### 方案 1：配置环境变量（推荐）

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下配置：

```env
# API 基础地址
NEXT_PUBLIC_API_BASE_URL=http://106.52.76.120:8080/api/v1

# 或者使用本地开发服务器
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

**注意**：

- 文件名为 `.env.local`（不是 `.env`）
- 必须以 `NEXT_PUBLIC_` 开头才能在客户端访问
- 修改后需要重启开发服务器

### 方案 2：使用默认配置

代码已经配置了默认的 API 地址：

- **开发环境**：`http://106.52.76.120:8080/api/v1`
- **生产环境**：`http://129.226.152.88:8080/api/v1`

如果后端服务器在这些地址运行，不需要额外配置。

### 方案 3：启动本地后端服务器

如果你有本地后端服务器，需要：

1. **启动后端服务器**（通常在 8080 端口）

2. **配置环境变量**：

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   ```

3. **重启 Next.js 开发服务器**：
   ```bash
   pnpm dev
   ```

## 配置优先级

API 客户端会按以下优先级选择 API 地址：

1. **环境变量** `NEXT_PUBLIC_API_BASE_URL`（最高优先级）
2. **ENV_CONFIG.API_BASE_URL**（从 `lib/constants.ts`）
3. **根据环境自动选择**：
   - 开发环境：`DEV_API_URL`（`http://106.52.76.120:8080/api/v1`）
   - 生产环境：`PROD_API_URL`（`http://129.226.152.88:8080/api/v1`）
4. **默认值**：`http://localhost:8080/api/v1`（最低优先级）

## 验证配置

### 1. 检查环境变量

在浏览器控制台运行：

```javascript
console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
```

或者在代码中：

```typescript
import { ENV_CONFIG } from "@/lib/constants";
console.log("API Base URL:", ENV_CONFIG.API_BASE_URL);
```

### 2. 测试 API 连接

在浏览器控制台运行（测试 Google 登录端点）：

```javascript
// 测试 Google 登录端点（会返回 401，但说明端点存在）
fetch("http://106.52.76.120:8080/api/v1/auth/google/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id_token: "test" }),
})
  .then((res) => {
    if (res.status === 401) {
      console.log("✅ API 连接成功！端点存在（401 是正常的，因为 token 无效）");
    } else {
      console.log("API 响应状态:", res.status);
    }
  })
  .catch((err) => console.error("❌ API 连接失败:", err));
```

**注意**：`/health` 端点可能不存在（返回 404），这不影响功能。重要的是认证端点存在。

### 3. 检查后端服务器状态

确保后端服务器正在运行：

```bash
# 检查端口是否被占用
lsof -i :8080

# 测试 Google 登录端点（会返回 401，但说明端点存在）
curl -X POST http://106.52.76.120:8080/api/v1/auth/google/signin \
  -H "Content-Type: application/json" \
  -d '{"id_token":"test"}'

# 如果返回 401 Unauthorized，说明端点存在且服务器正常运行
# 如果返回 404，说明端点路径不对
# 如果返回连接错误，说明服务器未运行
```

## 常见问题

### Q: 修改环境变量后仍然报错？

**A:**

1. 确保文件名为 `.env.local`（不是 `.env`）
2. 确保变量名以 `NEXT_PUBLIC_` 开头
3. **重启 Next.js 开发服务器**（重要！）
4. 清除浏览器缓存

### Q: 如何知道当前使用的 API 地址？

**A:** 在浏览器控制台查看网络请求，或者：

```typescript
// 在组件中
useEffect(() => {
  console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
}, []);
```

### Q: 开发和生产环境使用不同的 API 地址？

**A:** 可以：

1. **使用环境变量**（推荐）：

   ```env
   # .env.local (开发环境)
   NEXT_PUBLIC_API_BASE_URL=http://106.52.76.120:8080/api/v1

   # .env.production (生产环境)
   NEXT_PUBLIC_API_BASE_URL=http://129.226.152.88:8080/api/v1
   ```

2. **使用环境标识**：
   ```env
   NEXT_PUBLIC_MODE=development  # 或 production
   ```

### Q: 后端服务器在远程，如何配置？

**A:** 直接使用远程地址：

```env
NEXT_PUBLIC_API_BASE_URL=http://your-remote-server:8080/api/v1
```

**注意**：确保：

- 远程服务器允许跨域请求（CORS）
- 防火墙允许访问该端口
- 使用 HTTPS（生产环境）

## 相关文档

- [API 集成文档](./API_INTEGRATION.md)
- [登录系统文档](./LOGIN_SYSTEM_IMPLEMENTATION.md)
