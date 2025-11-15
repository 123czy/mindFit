# 🚀 内网穿透快速指南

## 立即开始

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 启动隧道

```bash
pnpm tunnel
```

### 3. 获取访问信息

```bash
pnpm tunnel:info
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

### 4. 分享给访问者

将上面显示的 **URL** 和 **Password** 都发送给访问者。

## 🔑 关键信息

- **Tunnel Password 就是你的公网 IP 地址**
- 密码不会在 `pnpm tunnel` 的输出中显示
- 必须使用 `pnpm tunnel:info` 来获取密码
- 访问者第一次访问时需要输入密码

## 📋 常用命令

```bash
# 启动隧道
pnpm tunnel

# 查看隧道信息（URL + 密码）
pnpm tunnel:info

# 停止隧道
pkill -f "lt --port"

# 重启隧道
pkill -f "lt --port" && pnpm tunnel
```

## ⚠️ 常见问题

### Q: 访问页面提示需要 Tunnel Password？

**A:** 运行 `pnpm tunnel:info` 获取密码（你的公网 IP）

### Q: 为什么终端没有显示密码？

**A:** Localtunnel 不会在启动时显示密码，密码就是你的公网 IP。使用 `pnpm tunnel:info` 自动获取。

### Q: 密码会变吗？

**A:** 密码是你的公网 IP，通常不会频繁变化。但 URL 每次启动可能会变。

### Q: 不想使用密码？

**A:** 可以改用 Ngrok：

```bash
ngrok http 3000
```

## 📖 完整文档

- [README.md](./README.md) - 完整的项目文档
- [docs/TUNNEL_PASSWORD.md](./docs/TUNNEL_PASSWORD.md) - 密码详细说明
