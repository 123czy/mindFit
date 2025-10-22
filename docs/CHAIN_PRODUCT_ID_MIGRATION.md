# 链上商品 ID 迁移指南

## 问题说明

数据库中的商品 ID 使用的是 UUID 格式（例如：`775972ab-97dc-4a8a-8c66-5de0871e730a`），但智能合约中的商品 ID 需要是 `BigInt` 数字类型。为了支持链上购买功能，我们需要为每个商品添加一个 `chain_product_id` 字段。

## 解决方案

### 1. 执行数据库迁移

打开 [Supabase Dashboard](https://app.supabase.com)，进入你的项目，然后：

1. 点击左侧菜单的 **SQL Editor**
2. 点击 **New Query**
3. 复制并粘贴以下 SQL：

```sql
-- 添加 chain_product_id 字段到 products 表
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS chain_product_id BIGINT UNIQUE;

-- 为现有商品分配链上 ID（从1开始递增）
WITH numbered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.products
  WHERE chain_product_id IS NULL
)
UPDATE public.products p
SET chain_product_id = np.row_num
FROM numbered_products np
WHERE p.id = np.id;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_products_chain_product_id ON public.products(chain_product_id);

-- 添加注释
COMMENT ON COLUMN public.products.chain_product_id IS '链上商品ID（用于智能合约交互）';
```

4. 点击 **Run** 执行 SQL

### 2. 验证迁移

在 SQL Editor 中运行以下查询验证：

```sql
SELECT id, name, chain_product_id
FROM public.products
ORDER BY chain_product_id;
```

你应该看到所有商品都有了 `chain_product_id`，从 1 开始递增。

### 3. 更新智能合约（可选）

如果你的智能合约中已经创建了商品，你需要确保数据库中的 `chain_product_id` 与链上的商品 ID 一致。

你可以手动更新特定商品的链上 ID：

```sql
UPDATE public.products
SET chain_product_id = 实际的链上ID
WHERE id = '商品的UUID';
```

## 新商品创建流程

从现在开始，创建新商品时：

1. **先在智能合约中创建商品**，获得链上的 `productId`
2. **在数据库中创建商品记录**，同时设置 `chain_product_id` 为链上的 ID

示例代码：

```typescript
// 1. 在智能合约中创建商品
const tx = await marketplace.createProduct(price, stock);
const receipt = await tx.wait();
const chainProductId = /* 从事件中提取 productId */;

// 2. 在数据库中创建商品
await createProduct({
  userId: user.id,
  walletAddress: user.wallet,
  name: "商品名称",
  description: "商品描述",
  price: 10.0,
  chainProductId: chainProductId.toString(), // 关联链上ID
});
```

## 前端变化

### Product 类型

```typescript
export interface Product {
  // ... 其他字段
  chainProductId?: bigint; // 新增：链上商品ID
}
```

### 购买按钮行为

- ✅ 如果商品有 `chainProductId`：正常显示购买按钮，可以通过智能合约购买
- ⚠️ 如果商品没有 `chainProductId`：显示"暂不可购买"，提示该商品尚未上链

## 常见问题

### Q: 为什么需要两个 ID？

A:

- `id` (UUID)：数据库主键，用于关联数据库中的其他表
- `chain_product_id` (BIGINT)：链上 ID，用于与智能合约交互

### Q: 旧的商品如何处理？

A: 迁移脚本会自动为所有现有商品分配从 1 开始的链上 ID。你可以根据需要手动调整。

### Q: 新建商品时必须提供 chain_product_id 吗？

A: 不是必须的，但如果不提供，该商品将无法通过智能合约购买。建议先在链上创建商品，然后在数据库中记录对应的 `chain_product_id`。

## 相关文件

- SQL 迁移脚本：`lib/supabase/migrations/add_chain_product_id.sql`
- 类型定义：`lib/types.ts`
- 商品卡片组件：`components/product/product-card-in-post.tsx`
