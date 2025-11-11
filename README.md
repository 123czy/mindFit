# 炒词 (MindFit) - AIGC 创作者平台

一个面向 AIGC 创作者的内容创作和交易平台，整合 Supabase 数据库和社区互动功能（原 Web3 模块已下线）。

## ✨ 特性

- 🎨 **内容发布** - 支持图文、付费内容发布
- 🛍️ **商品交易** - 创建和购买数字商品（Prompt、模板、教程等）
- 💰 **区块链支付** - 基于智能合约的代币交易
- 🏆 **声誉系统** - EIP-4973/5114 标准的身份和徽章系统
- 🔐 **多方式登录** - 支持邮箱/第三方账号
- 💾 **数据持久化** - Supabase PostgreSQL 数据库

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. 初始化数据库

```bash
# 在 Supabase Dashboard 的 SQL Editor 中执行
# 或使用命令行（需要 psql）
pnpm db:init
```

### 4. 导入测试数据（可选）

```bash
pnpm db:seed
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 6. 分享本地开发环境（内网穿透）

如果需要让其他人访问你的本地开发环境，可以使用内网穿透工具：

#### 使用 LocalTunnel（推荐，无需注册）

```bash
# 方式一：使用便捷脚本（推荐）
pnpm tunnel

# 方式二：手动启动
lt --port 3000 --print-requests
```

运行后会显示类似这样的信息：

```
your url is: https://late-ghosts-sit.loca.lt
```

**🔑 重要提示 - Tunnel Password（隧道密码）：**

- ⚠️ **第一次访问时会要求输入密码**
- 💡 **密码就是你的公网 IP 地址**（localtunnel 不会在终端显示）
- 🔍 **快速获取 URL 和密码：**

  ```bash
  # 使用脚本自动获取
  pnpm tunnel:info
  # 或
  ./scripts/show-tunnel-info.sh
  ```

  输出示例：

  ```
  📋 Tunnel URL: https://late-ghosts-sit.loca.lt
  🔑 Tunnel Password: 155.117.84.73
  ```

**访问流程：**

1. **获取信息**：运行 `pnpm tunnel:info` 获取 URL 和密码
2. **分享**：将 URL 和密码都发送给访问者
3. **访问者操作**：
   - 在浏览器打开 URL
   - 第一次访问时输入密码（你的公网 IP）
   - 之后可以正常访问

**注意事项：**

- 确保开发服务器正在运行（`pnpm dev`）
- URL 在每次启动时可能会变化
- 密码是你的公网 IP，通常不会频繁变化
- 关闭终端后隧道会断开

#### 使用 Ngrok（更稳定，需要注册）

1. 注册账号（免费）：https://dashboard.ngrok.com/signup
2. 获取 authtoken：https://dashboard.ngrok.com/get-started/your-authtoken
3. 配置 authtoken：
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
4. 启动隧道：
   ```bash
   ngrok http 3000
   ```

**快速查看隧道状态：**

```bash
pnpm tunnel:info
```

这会显示当前的 URL、密码和访问说明，方便分享给访问者。

## 📚 完整文档

- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - 完整设置清单
- [docs/QUICK_START.md](./docs/QUICK_START.md) - 快速开始指南
- [docs/DATABASE_INITIALIZATION.md](./docs/DATABASE_INITIALIZATION.md) - 数据库初始化
- [docs/DATA_MIGRATION.md](./docs/DATA_MIGRATION.md) - 数据迁移指南
- [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) - Supabase 详细配置
- [docs/IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md) - 实现总结

## 🛠️ 技术栈

- **前端**: Next.js 14, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **数据库**: Supabase (PostgreSQL)

## 📝 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器

# 数据库
pnpm db:init          # 初始化数据库表结构
pnpm db:seed          # 导入测试数据

# 构建
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # 运行 ESLint
```

## 📦 项目结构

```
├── app/                    # Next.js 应用路由
├── components/             # React 组件
│   ├── auth/              # 认证组件
│   ├── contract/          # 智能合约交互
│   ├── post/              # 帖子组件
│   ├── product/           # 商品组件
│   └── ...
├── lib/
│   ├── supabase/          # Supabase 配置和 API
│   ├── contracts/         # 智能合约 ABI 和地址
│   └── hooks/             # 自定义 Hooks
├── scripts/               # 工具脚本
├── docs/                  # 文档
└── public/                # 静态资源
```

## 🔗 智能合约地址 (Sepolia Testnet)

- **Identity Token**: `0x147ad4d8f943bb1b46234bc24fd68909196eadf7`
- **Reputation Badge**: `0x887b1ad4de371f659b707026f3f956b6afb217a4`
- **Badge Rule Registry**: `0xb1c68409e6053578478e370619cd9ae40eb71d3f`
- **Marketplace V2**: `0xfe04ed54ed4115009731e25c7479720356c962f7`
- **Reputation Data Feed**: `0x980fa645d44e1d358cefba73e9c3164612bb9951`
- **Test Token (mUSDT)**: `0x0d08e351b6d82829e53e125b41a033f30ab64077`

## 🎯 主要功能

### 用户功能

- 钱包登录（MetaMask 等）
- 自动创建用户账户
- 个人资料管理

### 内容功能

- 发布图文内容
- 创建付费内容
- 浏览和搜索帖子
- 评论和点赞

### 商品功能

- 创建数字商品
- 设置价格和库存
- 商品展示和搜索

### 交易功能

- 购买数字商品
- 代币支付
- 交易记录查询

### 声誉系统

- 身份 NFT (EIP-4973)
- 成就徽章 (EIP-5114)
- 自动徽章发放

## 🧪 测试

### 获取测试代币

1. 连接 Sepolia 测试网
2. 在应用中点击"领取"按钮获取 mUSDT

### 获取 Sepolia ETH

访问以下水龙头：

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## Deployment

Your project is live at:

**[https://vercel.com/123czys-projects/v0-design-specification](https://vercel.com/123czys-projects/v0-design-specification)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/COfrqq1Bg0i](https://v0.app/chat/projects/COfrqq1Bg0i)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
