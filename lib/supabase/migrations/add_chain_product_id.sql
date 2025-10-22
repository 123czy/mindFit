-- 添加 chain_product_id 字段到 products 表
-- 这个字段用于关联链上的商品 ID（智能合约中的 productId）

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS chain_product_id BIGINT UNIQUE;

-- 为现有商品分配链上 ID（从1开始递增）
-- 注意：在生产环境中，应该根据实际的链上商品 ID 来更新
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

