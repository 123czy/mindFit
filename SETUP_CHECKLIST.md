# 🚀 项目设置检查清单

按照顺序完成以下步骤来设置项目。

## ✅ 步骤 1: 克隆项目

```bash
git clone <your-repo>
cd new_mindFit
pnpm install
```

## ✅ 步骤 2: 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目信息
4. 等待 2 分钟初始化

## ✅ 步骤 3: 初始化数据库

### 最简单的方法：

1. 打开 Supabase Dashboard
2. 点击左侧 **SQL Editor** (</> 图标)
3. 点击 **New Query**
4. 打开本地文件 `lib/supabase/schema.sql`
5. 复制全部内容，粘贴到 SQL Editor
6. 点击 **Run** (或按 Cmd/Ctrl + Enter)
7. 看到 "Success" ✅

### 验证：

点击 **Table Editor**，应该看到 7 个表：

- users
- posts
- products
- purchases
- post_purchases
- comments
- likes

## ✅ 步骤 4: 获取 API 密钥

1. 在 Supabase Dashboard
2. 点击 **Settings** → **API**
3. 复制 **Project URL**
4. 复制 **anon public** key

## ✅ 步骤 5: 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...你的密钥
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=8a0a74dcefe143678779a52a48240372
```

## ✅ 步骤 6: 启动项目

```bash
pnpm dev
```

打开 http://localhost:3000

## ✅ 步骤 7: 连接钱包

1. 点击"登录"
2. 连接 MetaMask
3. 切换到 Sepolia 测试网
4. 完成！自动创建用户

## ✅ 步骤 8: 领取测试代币

1. 在左侧边栏查看余额
2. 点击"领取"按钮
3. 确认钱包交易
4. 获得 1000 mUSDT

## ✅ 步骤 9: 测试功能

- [ ] 发布一篇帖子
- [ ] 创建一个商品
- [ ] 购买一个商品
- [ ] 查看交易记录

---

## 🆘 遇到问题？

### 数据库连接失败

→ 检查 `.env.local` 中的 URL 和密钥

### 表创建失败

→ 查看 [docs/DATABASE_INITIALIZATION.md](docs/DATABASE_INITIALIZATION.md)

### 钱包连接失败

→ 确保安装 MetaMask 并切换到 Sepolia

### 其他问题

→ 查看 [docs/QUICK_START.md](docs/QUICK_START.md)

---

## 📚 相关文档

- [DATABASE_INITIALIZATION.md](docs/DATABASE_INITIALIZATION.md) - 数据库初始化详细指南
- [QUICK_START.md](docs/QUICK_START.md) - 快速开始
- [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - Supabase 详细配置
- [IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md) - 实现总结

---

## ✨ 完成！

恭喜！你的项目已经设置完成，可以开始开发了！🎉
