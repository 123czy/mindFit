"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { ImageUploader } from "../publish/image-uploader";
import Stepper, { Step } from "../Stepper";
import { X } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    generationType: "", // 图文 | 长文
    modelType: "", // gpt | deepseek | claude code
    name: "",
    description: "",
    price: "", // Free | 3.99 | 6.99
    currency: "mUSDT",
    imageUrl: "", // 兼容保留：用于提交时取第一张
    exampleImages: [] as string[],
    guidance: "", // 商品使用指导
    fileUrl: "",
    category: "",
    stock: "",
  });
  const { address, isConnected } = useAccount()
  const { listWork, isPending, isConfirming } = useListWork()
  const { purchase, isPending: isPurchasingWork, isConfirming: isConfirmingWork } = usePurchaseWork()
  const [variables, setVariables] = useState<Array<{id: string, type: string, value: string}>>([])
  // 每张示例图对应的变量输入值（按变量类型存储）
  const [exampleInputs, setExampleInputs] = useState<Array<Record<string, string>>>([])

  // 验证步骤1：基本信息
  const validateStep1 = (): boolean => {
    if (!formData.generationType) {
      toast.error("请选择生成类型");
      return false;
    }
    if (!formData.modelType) {
      toast.error("请选择大模型类型");
      return false;
    }
    if (!formData.name.trim()) {
      toast.error("请输入商品标题");
      return false;
    }
    if (formData.name.trim().length > 30) {
      toast.error("商品标题最多30个字");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("请输入商品描述");
      return false;
    }
    if (formData.description.trim().length > 500) {
      toast.error("商品描述最多500个字");
      return false;
    }
    if (!formData.price) {
      toast.error("请选择价格");
      return false;
    }
    return true;
  };

  // 验证步骤2：商品展示
  const validateStep2 = (): boolean => {
    if (!formData.guidance.trim()) {
      toast.error("请填写商品使用指导");
      return false;
    }
    // 如果有变量，检查所有变量是否已填写
    if (variables.length > 0) {
      // 校验每个示例（每张图）是否填写完对应变量
      const types = variables.map(v => v.type)
      for (let i = 0; i < formData.exampleImages.length; i++) {
        const vals = exampleInputs[i] || {}
        const missing = types.some(t => !vals[t] || !vals[t].trim())
        if (missing) {
          toast.error(`请完善第${i + 1}个 Example prompt 的变量值`)
          return false
        }
      }
    }
    return true;
  };

  // 验证步骤3：创建成功展示（无需校验）
  const validateStep3 = (): boolean => {
    return true;
  };

  // 处理步骤变化
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // 处理下一步按钮点击
  const handleNext = (currentStep: number) => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
    }
    // 验证通过，Stepper 会自动进入下一步
  };
  const handleSubmit = async (): Promise<boolean> => {
    // 1. 验证钱包连接
    if (!isConnected || !address) {
      toast.error("请先连接钱包")
      return false
    }
    if (!isAuthenticated || !user) {
      toast.error("请先连接钱包");
      return false;
    }

    // 2. 验证所有步骤
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return false;
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
      setIsSubmitting(false);
      return false
    }

    try {
      // 构建 examplePrompts：将每个 exampleImage 对应的变量值替换到描述中
      const examplePrompts = formData.exampleImages.map((imageUrl, index) => {
        let prompt = formData.description
        const inputs = exampleInputs[index] || {}
        
        // 替换所有变量
        Object.entries(inputs).forEach(([type, value]) => {
          const regex = new RegExp(`\\[${type}\\]`, 'g')
          prompt = prompt.replace(regex, value || `[${type}]`)
        })
        
        return {
          imageUrl,
          prompt
        }
      })

      const { data, error } = await createProduct({
        userId: user.id,
        walletAddress: user.wallet_address,
        postId: postId || '0fcfeb9a-13ee-49dc-beb8-b9b646bb1967',
        name: formData.name,
        description: formData.description,
        price: formData.price === "Free" ? 0 : parseFloat(formData.price),
        currency: formData.currency,
        imageUrl: (formData.exampleImages[0] || formData.imageUrl || undefined) as string | undefined,
        fileUrl: formData.fileUrl || undefined,
        category: formData.category || 'text',
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        chain_product_id: (Date.now() % 86) + 15,
        work_id: workId,
        contentData: {
          exampleImages: formData.exampleImages,
          guidance: formData.guidance,
          examplePrompts: examplePrompts,
        },
      });

      if (error) {
        throw error;
      }

      toast.success("商品创建成功！");
      console.log("[CreateProduct] Product created:", data);

      // Reset form
      setFormData({
        generationType: "",
        modelType: "",
        name: "",
        description: "",
        price: "",
        currency: "mUSDT",
        imageUrl: "",
        exampleImages: [],
        guidance: "",
        fileUrl: "",
        category: "",
        stock: "",
      });

      setCurrentStep(1);
      setVariables([]);
      if (data) {
        onSuccess?.(data as Product);
      }
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("[CreateProduct] Error:", error);
      toast.error("创建商品失败，请重试");
      setIsSubmitting(false);
      return false;
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
        generationType: "",
        modelType: "",
        name: "",
        description: "",
        price: "",
        currency: "mUSDT",
        imageUrl: "",
        exampleImages: [],
        guidance: "",
        fileUrl: "",
        category: "",
        stock: "",
      });
      setCurrentStep(1);
      setVariables([]);
      setExampleInputs([])
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

  // 同步示例输入与图片数量/变量类型
  useEffect(() => {
    const types = variables.map(v => v.type)
    setExampleInputs(prev => {
      const next: Array<Record<string, string>> = formData.exampleImages.map((_, idx) => {
        const existed = prev[idx] || {}
        const values: Record<string, string> = {}
        types.forEach(t => {
          values[t] = existed[t] ?? ""
        })
        return values
      })
      return next
    })
  }, [formData.exampleImages, variables])

  // 处理最后一步完成（步骤3是成功展示，不需要提交）
  const handleFinalStepCompleted = () => {
    // 步骤3只是展示成功，不需要提交
  };

  // 验证当前步骤，在进入下一步之前调用
  const handleBeforeNext = async (step: number): Promise<boolean> => {
    if (step === 1) {
      return validateStep1();
    } else if (step === 2) {
      // 步骤2完成后，验证通过后提交，然后进入步骤3显示成功
      if (!validateStep2()) {
        return false;
      }
      // 验证通过，提交表单
      const success = await handleSubmit();
      return success; // 只有提交成功才进入下一步
    } else if (step === 3) {
      return validateStep3();
    }
    return true;
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} >
      <DrawerContent className="flex flex-col overflow-y-hidden h-[100vh] ">
        <DrawerClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="z-50 rounded-full absolute top-2 right-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </DrawerClose>
        <div className="mx-auto w-full max-w-4xl flex flex-col overflow-y-hidden">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>创建新商品</DrawerTitle>
          </DrawerHeader>
          <Stepper
            initialStep={1}
            onStepChange={handleStepChange}
            onFinalStepCompleted={handleFinalStepCompleted}
            onBeforeNext={handleBeforeNext}
            nextButtonText="下一步"
            backButtonText="上一步"
            finalButtonText="创建商品"
            hideFinalStepButtons={true}
            nextButtonProps={{
              disabled: isSubmitting,
            }}
            contentClassName="flex-1 overflow-y-auto px-8"
          >
            {/* 步骤1：基本信息 */}
            <Step>
              <div className="space-y-4">
                {/* 生成类型 */}
                <div className="space-y-2">
                  <Label>生成类型 *</Label>
                  <Select
                    value={formData.generationType}
                    onValueChange={(value) => setFormData({ ...formData, generationType: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择生成类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="图文">图文</SelectItem>
                      <SelectItem value="长文">长文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 大模型类型 */}
                <div className="space-y-2">
                  <Label>大模型类型 *</Label>
                  <Select
                    value={formData.modelType}
                    onValueChange={(value) => setFormData({ ...formData, modelType: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择大模型类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt">GPT</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="claude code">Claude Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 商品名称 */}
                <div className="space-y-2">
                  <Label htmlFor="name">商品名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="输入商品名称（最多30个字）"
                    maxLength={30}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.name.length} / 30
                  </p>
                </div>

                {/* 商品描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">商品描述 *</Label>
                  <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-apple grid grid-cols-1">
                    <div className="overflow-y-auto max-h-[250px] pr-4">
                      <Textarea
                        placeholder="分享你的创作灵感、使用技巧..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={8}
                        maxLength={500}
                        required
                        className="min-h-[150px] border border-border/40 px-2 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/60"
                      />
                      <p className="text-xs text-muted-foreground text-right mt-2">
                        {formData.description.length} / 500
                      </p>
                    </div>
                  </div>
                </div>

                {/* 价格 */}
                <div className="space-y-2">
                  <Label>价格 *</Label>
                  <Select
                    value={formData.price}
                    onValueChange={(value) => setFormData({ ...formData, price: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择价格" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="3.99">$3.99</SelectItem>
                      <SelectItem value="6.99">$6.99</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Step>

            {/* 步骤2：商品展示 */}
            <Step>
              <div className="space-y-4">
                {/* 商品描述展示 */}
                <div className="space-y-2">
                  <Label htmlFor="description">商品描述</Label>
                  <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-apple grid grid-cols-1">
                    <div className="overflow-y-auto max-h-[250px] pr-4">
                      <Textarea
                        placeholder="分享你的创作灵感、使用技巧..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={8}
                        maxLength={500}
                        required
                        className="min-h-[150px] border border-border/40 px-2 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/60"
                      />
                      <p className="text-xs text-muted-foreground text-right mt-2">
                        {formData.description.length} / 500
                      </p>

                      {variables && variables.length > 0 && (
                        <div className="mt-2 text-muted-foreground">
                          <Label htmlFor="variables">
                            当前共有{variables.length}个变量:{" "}
                            {variables.map((variable) => (
                              <span key={variable.id} className="text-blue-500">
                                {variable.type}{" "}
                              </span>
                            ))}
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 商品效果图 */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">商品效果图</Label>
                  <ImageUploader
                    type="horizontal"
                    images={formData.exampleImages}
                    onChange={(images) =>
                      setFormData({ ...formData, exampleImages: images, imageUrl: images[0] || formData.imageUrl })
                    }
                  />
                </div>

                {/* Example prompts（按图片数量渲染） */}
                {formData.exampleImages.length > 0 && (
                  <div className="space-y-3">
                    <Label>Example prompts</Label>
                    <div className="space-y-4">
                      {formData.exampleImages.map((img, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="relative w-28 h-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={`example-${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-2 text-sm text-foreground/90">
                            {/* 将描述中的 [变量] 替换为输入框 */}
                            <div className="flex flex-wrap gap-2 items-center">
                              {(() => {
                                const parts: Array<React.ReactNode> = []
                                const regex = /\[([^\]]+)\]/g
                                let lastIndex = 0
                                const template = formData.description || ""
                                let match
                                while ((match = regex.exec(template)) !== null) {
                                  const before = template.slice(lastIndex, match.index)
                                  if (before) parts.push(<span key={`txt-${idx}-${lastIndex}`}>{before}</span>)
                                  const type = match[1]
                                  const value = exampleInputs[idx]?.[type] ?? ""
                                  parts.push(
                                    <Input
                                      key={`inp-${idx}-${type}-${match.index}`}
                                      value={value}
                                      placeholder={type}
                                      className="h-8 w-32"
                                      onChange={(e) => {
                                        setExampleInputs(prev => {
                                          const clone = [...prev]
                                          const map = { ...(clone[idx] || {}) }
                                          map[type] = e.target.value
                                          clone[idx] = map
                                          return clone
                                        })
                                      }}
                                      required
                                    />
                                  )
                                  lastIndex = match.index + match[0].length
                                }
                                const tail = template.slice(lastIndex)
                                if (tail) parts.push(<span key={`tail-${idx}`}>{tail}</span>)
                                return parts
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 商品使用指导 */}
                <div className="space-y-2">
                  <Label htmlFor="guidance">商品使用指导 *</Label>
                  <Textarea
                    id="guidance"
                    placeholder="请填写商品的使用指导说明..."
                    value={formData.guidance}
                    onChange={(e) =>
                      setFormData({ ...formData, guidance: e.target.value })
                    }
                    rows={6}
                    required
                    className="min-h-[120px] border border-border/40 px-2 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/60"
                  />
                </div>

              </div>
            </Step>

            {/* 步骤3：创建成功 */}
            <Step>
              <div className="space-y-4 flex flex-col items-center justify-center min-h-[300px]">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-semibold">创建成功！</h3>
                  <p className="text-muted-foreground">
                    您的商品已成功创建，可以开始使用了。
                  </p>
                </div>
              </div>
            </Step>
          </Stepper>
 
        </div>
      </DrawerContent>
    </Drawer>
  );
}

