# 快速开始指南

本指南帮助你快速设置和运行项目。

## 前置要求

- Node.js 18+
- pnpm (推荐) 或 npm
- MetaMask 或其他 Web3 钱包
- Supabase 账号

## 1. 克隆并安装依赖

```bash
# 克隆项目
git clone <your-repo-url>
cd new_mindFit

# 安装依赖
pnpm install
```

## 2. 设置 Supabase

### 创建项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 等待项目初始化完成

### 创建数据库表

1. 打开 Supabase Dashboard
2. 进入 **SQL Editor**
3. 复制 `lib/supabase/schema.sql` 的内容
4. 粘贴并执行

### 获取 API 密钥

1. 进入 **Settings** → **API**
2. 复制 **Project URL**
3. 复制 **anon/public key**

## 3. 配置环境变量

创建 `.env.local` 文件：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# WalletConnect Project ID (可选)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=8a0a74dcefe143678779a52a48240372
```

## 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 5. 连接钱包

1. 点击"登录"按钮
2. 连接 MetaMask
3. 切换到 Sepolia 测试网
4. 系统会自动创建你的用户账户

## 6. 领取测试代币

1. 连接钱包后，左侧边栏会显示代币余额
2. 如果余额低于 10，会显示"领取"按钮
3. 点击领取获得 1000 mUSDT

## 7. 发布第一篇帖子

1. 点击导航栏的"发布"
2. 填写标题和内容
3. 上传至少一张图片
4. 可选：添加标签
5. 可选：设置为付费内容
6. 点击"发布"

## 8. 创建商品

### 方法 1：在发布帖子时添加

1. 在发布编辑器中
2. 使用 ProductManager 组件添加商品
3. 随帖子一起发布

### 方法 2：独立创建

```typescript
// 使用 CreateProductForm 组件
<CreateProductForm
  open={true}
  onOpenChange={setOpen}
  onSuccess={() => console.log("Product created!")}
/>
```

## 9. 购买商品

1. 浏览帖子或商品列表
2. 找到想购买的商品
3. 点击"购买"按钮
4. 确认钱包交易
5. 等待交易确认
6. 购买成功！

## 常见问题

### Q: 无法连接钱包

**A**: 确保安装了 MetaMask 并且切换到 Sepolia 测试网。

### Q: 领取测试代币失败

**A**: 检查钱包是否正确连接，刷新页面重试。

### Q: 发布帖子失败

**A**: 检查：

- Supabase 配置是否正确
- 环境变量是否设置
- 数据库表是否创建
- 浏览器控制台错误信息

### Q: 购买商品交易失败

**A**:

- 确保有足够的测试代币
- 确保有足够的 Sepolia ETH 支付 Gas
- 检查卖家钱包地址是否正确

### Q: 在哪里获取 Sepolia ETH？

**A**: 访问以下水龙头：

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

## 项目结构

```
new_mindFit/
├── app/                    # Next.js 应用路由
├── components/             # React 组件
│   ├── product/           # 商品相关组件
│   ├── publish/           # 发布相关组件
│   ├── layout/            # 布局组件
│   └── ui/                # UI 基础组件
├── lib/
│   ├── supabase/          # Supabase 配置和 API
│   │   ├── client.ts      # Supabase 客户端
│   │   ├── types.ts       # 数据库类型
│   │   ├── schema.sql     # 数据库表结构
│   │   └── api/           # API 函数
│   ├── contracts/         # 智能合约相关
│   │   ├── abis.ts        # 合约 ABI
│   │   ├── addresses.ts   # 合约地址
│   │   └── hooks/         # 合约交互 Hooks
│   └── hooks/             # 自定义 Hooks
├── docs/                  # 文档
└── public/                # 静态资源
```

## 开发工作流

### 1. 创建新功能

```bash
# 创建新分支
git checkout -b feature/new-feature

# 开发...

# 提交
git commit -m "Add new feature"
git push origin feature/new-feature
```

### 2. 更新数据库

如果需要修改数据库结构：

1. 更新 `lib/supabase/schema.sql`
2. 更新 `lib/supabase/types.ts`
3. 在 Supabase Dashboard 执行新的 SQL
4. 测试 API 函数

### 3. 测试

```bash
# 运行开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入项目
4. 配置环境变量
5. 部署

### 环境变量设置

在 Vercel 项目设置中添加：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## 下一步

- 阅读 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) 了解完整实现
- 阅读 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 了解数据库详情
- 查看 [CONTRACT_INTEGRATION.md](./CONTRACT_INTEGRATION.md) 了解智能合约集成

## 获取帮助

- 查看 [Supabase 文档](https://supabase.com/docs)
- 查看 [wagmi 文档](https://wagmi.sh/)
- 查看 [Next.js 文档](https://nextjs.org/docs)

祝你开发愉快！🚀
