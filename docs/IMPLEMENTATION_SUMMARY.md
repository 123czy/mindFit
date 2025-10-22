# Supabase 集成实现总结

本文档总结了项目中 Supabase 数据库和 API 的完整实现。

## 已完成的功能

### 1. Supabase 基础设施 ✅

#### 安装和配置

- ✅ 安装 `@supabase/supabase-js@2.75.1`
- ✅ 创建 Supabase 客户端配置 (`lib/supabase/client.ts`)
- ✅ 定义完整的数据库类型 (`lib/supabase/types.ts`)
- ✅ 创建数据库表结构 SQL (`lib/supabase/schema.sql`)

#### 数据库表

创建了以下 7 个表：

1. **users** - 用户信息（wallet_address, username, avatar_url 等）
2. **posts** - 帖子内容（支持付费内容）
3. **products** - 商品信息
4. **purchases** - 商品购买记录
5. **post_purchases** - 付费帖子购买记录
6. **comments** - 评论
7. **likes** - 点赞

### 2. API 工具函数 ✅

创建了完整的 CRUD API，位于 `lib/supabase/api/` 目录：

#### Users API (`users.ts`)

- `getOrCreateUser(walletAddress)` - 获取或创建用户
- `getUserById(userId)` - 通过 ID 获取用户
- `getUserByWallet(walletAddress)` - 通过钱包地址获取用户
- `updateUserProfile(userId, updates)` - 更新用户资料
- `checkUsernameAvailable(username)` - 检查用户名可用性

#### Posts API (`posts.ts`)

- `createPost(params)` - 创建新帖子
- `getPosts(options)` - 分页获取帖子列表
- `getPostById(postId)` - 获取帖子详情
- `updatePost(postId, updates)` - 更新帖子
- `deletePost(postId)` - 删除帖子
- `incrementViewCount(postId)` - 增加浏览次数
- `hasUserPurchasedPost(userId, postId)` - 检查是否购买了付费帖子
- `recordPostPurchase(params)` - 记录付费帖子购买

#### Products API (`products.ts`)

- `createProduct(params)` - 创建新商品
- `getProducts(options)` - 分页获取商品列表
- `getProductById(productId)` - 获取商品详情
- `getProductsByPostId(postId)` - 获取帖子关联的商品
- `updateProduct(productId, updates)` - 更新商品
- `deleteProduct(productId)` - 删除商品
- `incrementSalesCount(productId)` - 增加销量
- `updateProductStock(productId, quantityChange)` - 更新库存

#### Purchases API (`purchases.ts`)

- `createPurchase(params)` - 创建购买记录
- `completePurchase(purchaseId, txHash)` - 完成购买（更新状态）
- `failPurchase(purchaseId, reason)` - 标记购买失败
- `getPurchasesByBuyer(buyerId, options)` - 获取买家的购买记录
- `getPurchasesBySeller(sellerId, options)` - 获取卖家的销售记录
- `getPurchaseById(purchaseId)` - 获取购买详情
- `hasUserPurchasedProduct(buyerId, productId)` - 检查是否购买了商品
- `getUserPurchaseStats(userId)` - 获取用户购买统计

### 3. React Hooks ✅

#### `useCurrentUser` (`lib/hooks/use-current-user.ts`)

自动管理当前登录用户状态的 Hook：

- 自动根据钱包连接状态获取/创建用户
- 提供 `user`, `isLoading`, `error`, `isAuthenticated` 状态
- 与 wagmi 的 `useAccount` 集成

### 4. UI 组件 ✅

#### 发布编辑器 (`components/publish/publish-editor.tsx`)

- ✅ 集成 `useCurrentUser` hook
- ✅ 调用 `createPost` API 创建帖子
- ✅ 支持付费内容（价格、付费内容）
- ✅ 错误处理和 Toast 通知
- ✅ 创建成功后跳转到首页

#### 商品创建表单 (`components/product/create-product-form.tsx`)

- ✅ Dialog 模式的商品创建表单
- ✅ 完整的表单验证
- ✅ 支持所有商品字段（名称、描述、价格、图片、文件等）
- ✅ 可关联到帖子或独立发布
- ✅ 调用 `createProduct` API

#### 购买商品按钮 (`components/product/purchase-product-button.tsx`)

- ✅ 整合智能合约调用和数据库记录
- ✅ 两步购买流程：
  1. 创建数据库购买记录
  2. 执行区块链转账
- ✅ 交易确认后更新购买状态
- ✅ 完整的加载状态和错误处理
- ✅ 自动更新商品销量和库存

### 5. 测试代币功能 ✅

#### TestToken Hook (`lib/contracts/hooks/use-test-token.ts`)

- ✅ 读取代币余额
- ✅ 手动领取测试代币
- ✅ 监听交易状态
- ✅ 使用 `MOCK_ERC20_ABI` (包含 mint 函数)

#### SidebarLeft 组件更新

- ✅ 显示实时代币余额
- ✅ 余额不足时显示"领取"按钮
- ✅ 加载状态和处理中状态显示

## 数据流程

### 发布帖子流程

```
用户填写表单
  → PublishEditor 验证
  → createPost(Supabase)
  → 数据库插入
  → 返回帖子数据
  → 更新本地状态
  → 跳转首页
```

### 创建商品流程

```
点击创建商品
  → CreateProductForm 打开
  → 用户填写表单
  → createProduct(Supabase)
  → 数据库插入
  → 返回商品数据
  → 关闭表单
```

### 购买商品流程

```
点击购买按钮
  → PurchaseProductButton 处理
  → createPurchase(Supabase) - 创建购买记录(pending)
  → transfer(智能合约) - 转账代币给卖家
  → 等待交易确认
  → completePurchase(Supabase) - 更新状态(completed)
  → 增加销量、减少库存
  → 显示成功提示
```

## 环境变量配置

需要在 `.env.local` 中配置：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 数据库设置步骤

1. 访问 [Supabase](https://supabase.com/) 创建项目
2. 在 SQL Editor 中执行 `lib/supabase/schema.sql`
3. 获取 Project URL 和 anon key
4. 配置环境变量

## Row Level Security (RLS) 策略

所有表都启用了 RLS，当前策略：

- **查看**：所有内容公开可见
- **创建**：已登录用户可创建
- **更新**：只能更新自己的内容
- **删除**：只能删除自己的内容

特殊规则：

- 购买记录只对买家和卖家可见
- 付费帖子的 `paid_content` 字段只对购买者可见（需要应用层控制）

## 后续优化建议

### 性能优化

1. 添加数据缓存（React Query）
2. 实现虚拟滚动加载更多数据
3. 添加搜索索引优化

### 功能增强

1. 实现文件上传到 Supabase Storage
2. 添加实时订阅（WebSocket）
3. 实现评论和点赞功能
4. 添加用户关注功能
5. 实现通知系统

### 安全加固

1. 细化 RLS 策略
2. 添加速率限制
3. 实现敏感操作的二次确认
4. 添加内容审核机制

### 用户体验

1. 添加骨架屏加载状态
2. 实现乐观更新
3. 添加离线支持
4. 改进错误提示

## 相关文档

- [Supabase 设置指南](./SUPABASE_SETUP.md)
- [合约集成文档](./CONTRACT_INTEGRATION.md)
- [声誉系统集成计划](./REPUTATION_SYSTEM_INTEGRATION_PLAN.md)

## 技术栈

- **数据库**: Supabase (PostgreSQL)
- **前端框架**: Next.js 14 + React 19
- **状态管理**: React Context + React Query(待集成)
- **Web3**: wagmi + viem
- **UI 组件**: shadcn/ui + Tailwind CSS
- **类型安全**: TypeScript

## 联系方式

如有问题，请查阅文档或提交 Issue。
