# Google OAuth 配置指南

## 错误：origins don't match

如果遇到错误：`origins don't match https://accounts.google.com http://localhost:3000`

这是因为 Google Cloud Console 中的 OAuth 2.0 客户端配置没有包含 `http://localhost:3000` 作为授权的 JavaScript 来源。

## 解决步骤

### 1. 打开 Google Cloud Console

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择或创建你的项目
3. 确保已启用 **Google+ API** 或 **Google Identity Services API**

### 2. 配置 OAuth 2.0 客户端

1. 在左侧菜单中，导航到 **API 和服务** > **凭据**
2. 找到你的 OAuth 2.0 客户端 ID（或创建一个新的）
3. 点击客户端 ID 进行编辑

### 3. 添加授权的 JavaScript 来源

在 **授权的 JavaScript 来源** 部分，添加以下 URL：

```
http://localhost:3000
https://localhost:3000  (如果需要 HTTPS)
```

**重要提示**：

- 不要包含尾部斜杠 `/`
- 不要包含路径，只包含协议、域名和端口
- 开发环境必须包含 `http://localhost:3000`
- 生产环境需要添加你的生产域名（如 `https://yourdomain.com`）

### 4. 添加授权的重定向 URI（如果需要）

如果你使用 OAuth 重定向流程（而不是 One Tap），在 **授权的重定向 URI** 部分添加：

```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

**注意**：当前项目使用 Google Identity Services 的 One Tap 登录，不需要重定向 URI。但如果你计划使用 OAuth 重定向流程，需要添加。

### 5. 保存配置

1. 点击 **保存**
2. 等待几分钟让配置生效（通常立即生效，但有时需要等待 1-5 分钟）

### 6. 验证配置

配置完成后，刷新你的应用页面，Google 登录应该可以正常工作。

## 完整配置示例

### 授权的 JavaScript 来源

```
http://localhost:3000
https://localhost:3000
https://yourdomain.com
https://www.yourdomain.com
```

### 授权的重定向 URI（可选，如果使用 OAuth 重定向）

```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

## 环境变量配置

确保你的 `.env.local` 文件包含正确的 Google Client ID：

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**注意**：Client ID 应该以 `.apps.googleusercontent.com` 结尾。

## 常见问题

### Q: 配置后仍然报错？

**A:**

1. 确保配置已保存
2. 清除浏览器缓存和 Cookie
3. 等待几分钟后重试（配置可能需要时间生效）
4. 检查 Client ID 是否正确

### Q: 生产环境需要配置什么？

**A:**

1. 添加生产域名到 **授权的 JavaScript 来源**（如 `https://yourdomain.com`）
2. 如果使用 OAuth 重定向，添加生产重定向 URI
3. 确保生产环境的环境变量包含正确的 Client ID

### Q: 可以使用同一个 Client ID 用于开发和生产吗？

**A:** 可以，但建议：

- 开发环境：使用一个 Client ID，只配置 `http://localhost:3000`
- 生产环境：使用另一个 Client ID，只配置生产域名
- 这样可以更好地管理权限和安全

### Q: 为什么不需要重定向 URI？

**A:** 当前项目使用 Google Identity Services 的 **One Tap** 登录方式，这是一种无重定向的登录方式。用户点击按钮后，Google 会直接返回 JWT Token，不需要重定向。

如果你需要使用传统的 OAuth 重定向流程，需要：

1. 添加重定向 URI
2. 修改代码使用 OAuth 重定向流程

## 相关文档

- [Google Identity Services 文档](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 配置指南](https://developers.google.com/identity/protocols/oauth2/web-server)
- [项目登录系统文档](./LOGIN_SYSTEM_IMPLEMENTATION.md)
