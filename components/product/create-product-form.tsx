"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { createProduct } from "@/lib/supabase/api";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useListWork , generateWorkId, usePurchaseWork } from "@/lib/contracts/hooks/use-marketplace-v2";
import type { Product  } from "@/lib/types";
import { VariableForm } from "../publish/variable-form";
interface CreateProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  onSuccess?: (product: Product) => void;
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
  const [variables, setVariables] = useState<Array<{id: string, type: string, value: string}>>([])
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
      onSuccess?.(data as Product);
    } catch (error) {
      console.error("[CreateProduct] Error:", error);
      toast.error("创建商品失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if(formData.name || formData.description || formData.price) {
      if (!confirm("确定要关闭吗？未保存的修改将会丢失。")) {
        return
      }
    }
    if (!open) {
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
    }
    onOpenChange(open);
  }

    // 提取body中的变量
    useEffect(() => {
      const regex = /\[([^\]]+)\]/g
      const matches = Array.from(formData.description.matchAll(regex))
      const extractedTypes = matches.map(match => match[1])
      
      // 保留已有变量的值，只更新新增的变量
      setVariables(prevVariables => {
        // 为每个类型创建一个队列，记录所有可能的变量值
        const typeToValuesMap = new Map<string, string[]>()
        
        // 从之前的状态构建一个队列
        prevVariables.forEach(v => {
          if (!typeToValuesMap.has(v.type)) {
            typeToValuesMap.set(v.type, [])
          }
          typeToValuesMap.get(v.type)!.push(v.value)
        })
        
        // 构建新的变量列表
        const newVariables: Array<{id: string, type: string, value: string}> = []
        
        extractedTypes.forEach((type, index) => {
          const id = `${type}-${Date.now()}-${index}`
          
          // 从队列中获取值
          const values = typeToValuesMap.get(type) || []
          const value = values.length > 0 ? values.shift()! : ''
          
          newVariables.push({
            id,
            type,
            value
          })
        })
        
        return newVariables
      })
    }, [formData.description])

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full p-0 max-w-sm sm:p-6 lg:max-w-4xl ">
        <DrawerHeader >
          <DrawerTitle>创建新商品</DrawerTitle>
          <DrawerDescription>
            填写商品信息。商品将关联到当前帖子。
          </DrawerDescription> 
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">商品标题 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="输入商品标题"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">商品描述 *</Label>
            <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-apple grid grid-cols-1 md:flex">
              <div className="overflow-y-auto h-[240px] md:w-2/3 pr-4">
              <Textarea
                placeholder="分享你的创作灵感、使用技巧..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={10}
                maxLength={1000}
                required
                className="min-h-[200px] border border-border/40 px-2 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/60"
              />
              <p className="text-xs text-muted-foreground text-right mt-2">{formData.description.length} / 1000</p>
              </div>

              <div className="overflow-y-auto h-[240px] md:w-1/3">
              {/* Variables Form */}
              {variables.length > 0 && (
                <div className="">
                  <VariableForm 
                    variables={variables}
                    onChange={setVariables}
                    initialBody={formData.description}
                  />
                </div>
              )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            {/* <div className="space-y-2">
              <Label htmlFor="currency">货币</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                placeholder="mUSDT"
              />
            </div> */}
          </div>


          <DrawerFooter className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DrawerClose asChild>
            <Button variant="outline">取消</Button>
           </DrawerClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "创建中..." : "创建商品"}
            </Button>
          </DrawerFooter>
        </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

