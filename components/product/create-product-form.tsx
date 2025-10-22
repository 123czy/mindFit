"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { createProduct } from "@/lib/supabase/api";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useListWork , generateWorkId, usePurchaseWork } from "@/lib/contracts/hooks/use-marketplace-v2";

interface CreateProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  onSuccess?: () => void;
}

export function CreateProductForm({
  open,
  onOpenChange,
  postId,
  onSuccess,
}: CreateProductFormProps) {
  const { user, isAuthenticated } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "mUSDT",
    imageUrl: "",
    fileUrl: "",
    category: "",
    stock: "",
  });
  const { address, isConnected } = useAccount()
  const { listWork, isPending, isConfirming } = useListWork()
  const { purchase, isPending: isPurchasingWork, isConfirming: isConfirmingWork } = usePurchaseWork()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      // 1. 验证钱包连接
    if (!isConnected || !address) {
        toast.error("请先连接钱包")
        return
    }
    if (!isAuthenticated || !user) {
      toast.error("请先连接钱包");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("请输入商品名称");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("请输入商品描述");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("请输入有效的价格");
      return;
    }

    setIsSubmitting(true);
    
    let workId = ''
    try {
      // 3. 生成链上商品 ID (workId)
      // 使用时间戳作为 nonce 来生成唯一的 workId
      const nonce = BigInt(Date.now())
      workId = generateWorkId(address, nonce)
      
      // 4. 转换价格为 wei（mUSDT 使用 6 decimals）
      const priceInWei = parseUnits("10", 6)

      // 5. 调用智能合约上架商品
      await listWork(workId,priceInWei)

      await purchase(workId)
    } catch (error) {
      toast.error("商品上链失败")
      return
    }

    try {
      const { data, error } = await createProduct({
        userId: user.id,
        walletAddress: user.wallet_address,
        postId: postId || '0fcfeb9a-13ee-49dc-beb8-b9b646bb1967',
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        imageUrl: formData.imageUrl || undefined,
        fileUrl: formData.fileUrl || undefined,
        category: formData.category || 'text',
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        chain_product_id: (Date.now() % 86) + 15,
        work_id: workId,
      });

      if (error) {
        throw error;
      }

      toast.success("商品创建成功！");
      console.log("[CreateProduct] Product created:", data);

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        currency: "mUSDT",
        imageUrl: "",
        fileUrl: "",
        category: "",
        stock: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("[CreateProduct] Error:", error);
      toast.error("创建商品失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建新商品</DialogTitle>
          <DialogDescription>
            填写商品信息。商品将{postId ? "关联到当前帖子" : "独立发布"}。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">商品名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="输入商品名称"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">商品描述 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="描述商品的特点和优势"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">价格 *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">货币</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                placeholder="mUSDT"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">商品图片 URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">下载文件 URL（数字商品）</Label>
            <Input
              id="fileUrl"
              type="url"
              value={formData.fileUrl}
              onChange={(e) =>
                setFormData({ ...formData, fileUrl: e.target.value })
              }
              placeholder="https://example.com/file.zip"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="数字产品/服务等"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">库存（可选）</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="无限"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "创建中..." : "创建商品"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

