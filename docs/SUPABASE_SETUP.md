# Supabase 设置指南

本项目使用 Supabase 作为后端数据库和 API 服务。

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并创建账号
2. 创建新项目
3. 等待项目初始化完成

## 2. 配置数据库

在 Supabase Dashboard 的 SQL Editor 中执行 `/lib/supabase/schema.sql` 文件的内容，创建所有必需的表和策略。

### 数据库表结构

项目包含以下表：

- `users` - 用户信息
- `posts` - 帖子内容
- `products` - 商品信息
- `purchases` - 购买记录
- `post_purchases` - 付费帖子购买记录
- `comments` - 评论
- `likes` - 点赞

## 3. 获取 API 密钥

1. 在 Supabase Dashboard 进入 **Settings** -> **API**
2. 复制以下信息：
   - Project URL
   - anon/public key

## 4. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 5. API 使用示例

### 创建用户

```typescript
import { getOrCreateUser } from "@/lib/supabase/api";

const { data: user, error } = await getOrCreateUser(walletAddress);
```

### 创建帖子

```typescript
import { createPost } from "@/lib/supabase/api";

const { data: post, error } = await createPost({
  userId: user.id,
  walletAddress: user.wallet_address,
  title: "My First Post",
  content: "Hello World!",
  tags: ["tech", "web3"],
  isPaid: false,
});
```

### 创建商品

```typescript
import { createProduct } from "@/lib/supabase/api";

const { data: product, error } = await createProduct({
  userId: user.id,
  walletAddress: user.wallet_address,
  name: "My Product",
  description: "Product description",
  price: 100,
  currency: "mUSDT",
  category: "digital",
});
```

### 购买商品

```typescript
import { createPurchase, completePurchase } from "@/lib/supabase/api";

// 创建购买记录
const { data: purchase, error } = await createPurchase({
  buyerId: buyer.id,
  buyerWallet: buyer.wallet_address,
  productId: product.id,
  sellerId: seller.id,
  sellerWallet: seller.wallet_address,
  amount: product.price,
  currency: "mUSDT",
});

// 完成支付后更新状态
await completePurchase(purchase.id, txHash);
```

## 6. Row Level Security (RLS)

所有表都启用了 RLS。当前策略允许：

- 所有用户可以查看公开内容
- 用户可以创建、更新和删除自己的内容
- 购买记录只对买家和卖家可见

根据实际需求，你可能需要在 Supabase Dashboard 中调整 RLS 策略。

## 7. 存储配置（可选）

如果需要上传图片和文件：

1. 在 Supabase Dashboard 进入 **Storage**
2. 创建以下 buckets：

   - `avatars` - 用户头像
   - `post-images` - 帖子图片
   - `product-images` - 商品图片
   - `product-files` - 商品文件

3. 配置 bucket 策略，允许用户上传和读取文件

## 8. 实时订阅（可选）

Supabase 支持实时数据订阅：

```typescript
import { supabase } from "@/lib/supabase/client";

const subscription = supabase
  .channel("posts_channel")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "posts" },
    (payload) => {
      console.log("New post!", payload);
    }
  )
  .subscribe();
```

## 故障排除

### 连接错误

确保 `.env.local` 文件中的 URL 和密钥正确。

### RLS 策略错误

如果遇到权限错误，检查 Supabase Dashboard 中的 RLS 策略配置。

### 数据库错误

使用 Supabase Dashboard 的 SQL Editor 检查表结构和数据。
