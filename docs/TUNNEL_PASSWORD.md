# Localtunnel 密码获取指南

当你使用 localtunnel 进行内网穿透时，第一次访问会要求输入 **Tunnel Password**（隧道密码）。

## 🔑 重要：密码就是你的公网 IP 地址

**localtunnel 的密码不会在终端显示，它实际上是你的公网 IP 地址。**

## 🔍 如何获取密码

### 方法一：使用脚本自动获取（推荐）

```bash
./scripts/show-tunnel-info.sh
```

输出示例：

```
✅ Localtunnel 正在运行

📋 Tunnel URL: https://late-ghosts-sit.loca.lt
🔑 Tunnel Password: 155.117.84.73

📝 分享给访问者的信息：
   URL:      https://late-ghosts-sit.loca.lt
   Password: 155.117.84.73
```

或使用 npm 脚本：

```bash
pnpm tunnel:info
```

### 方法二：手动获取公网 IP

```bash
# 方式一：通过 localtunnel 官方 API
curl https://loca.lt/mytunnelpassword

# 方式二：通过其他 IP 查询服务
curl ifconfig.me
# 或
curl icanhazip.com
```

## 📋 访问流程

1. **启动开发服务器**：

   ```bash
   pnpm dev
   ```

2. **启动隧道**：

   ```bash
   pnpm tunnel
   ```

3. **获取 URL 和密码**：

   - 从终端输出中复制 URL（如 `https://xxx.loca.lt`）
   - 从终端输出中复制密码（在 `password:` 后面）

4. **分享给访问者**：

   - 将 URL 发送给访问者
   - 将密码也发送给访问者（第一次访问时需要）

5. **访问者操作**：
   - 在浏览器打开 URL
   - 在密码输入页面输入密码
   - 之后可以正常访问

## ⚠️ 注意事项

- **密码每次启动都会变化**：每次重启隧道时，密码都会重新生成
- **密码只在第一次访问时需要**：输入一次密码后，浏览器会记住，之后不需要再输入
- **如果找不到密码**：可以重启隧道，新密码会在输出中显示

## 💡 替代方案

如果你不想使用密码，可以考虑：

1. **使用 Ngrok**（需要注册账号，但无需密码）：

   ```bash
   ngrok http 3000
   ```

2. **使用局域网访问**（如果访问者在同一网络）：
   - 修改 `package.json` 中的 dev 脚本：
     ```json
     "dev": "next dev -H 0.0.0.0"
     ```
   - 然后通过 `http://你的IP:3000` 访问

## 🔗 相关文档

- [README.md](../README.md) - 完整的内网穿透说明
- [scripts/start-tunnel.sh](../scripts/start-tunnel.sh) - 隧道启动脚本
