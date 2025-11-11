"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUploader } from "@/components/publish/image-uploader"
import { toast } from "sonner"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import type { Product } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiGet, apiPost } from "@/lib/utils/api-client"

interface CreateProductFormProps {
  postId?: string
  onSuccess?: (product: Product) => void
}

export function CreateProductForm({ postId, onSuccess }: CreateProductFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editProductId = searchParams?.get("productId") || undefined

  const { user, isAuthenticated } = useCurrentUser()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(
    Boolean(editProductId)
  )
  const [formData, setFormData] = useState({
    generationType: "",
    modelType: "",
    name: "",
    description: "",
    price: "",
    currency: "mUSDT",
    imageUrl: "",
    exampleImages: [] as string[],
    guidance: "",
    fileUrl: "",
    category: "",
    stock: "",
  })
  const [variables, setVariables] = useState<
    Array<{ id: string; type: string; value: string }>
  >([])
  const [exampleInputs, setExampleInputs] = useState<
    Array<Record<string, string>>
  >([])

  const isEditMode = Boolean(editProductId)

  const resetForm = () => {
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
    })
    setVariables([])
    setExampleInputs([])
  }

  const validateBasicInfo = () => {
    if (!formData.generationType) {
      toast.error("请选择生成类型")
      return false
    }
    if (!formData.modelType) {
      toast.error("请选择大模型类型")
      return false
    }
    if (!formData.name.trim()) {
      toast.error("请输入商品标题")
      return false
    }
    if (formData.name.trim().length > 30) {
      toast.error("商品标题最多30个字")
      return false
    }
    if (!formData.description.trim()) {
      toast.error("请输入商品描述")
      return false
    }
    if (formData.description.trim().length > 500) {
      toast.error("商品描述最多500个字")
      return false
    }
    if (!formData.price) {
      toast.error("请选择价格")
      return false
    }
    return true
  }

  const validateDisplayInfo = () => {
    if (!formData.guidance.trim()) {
      toast.error("请填写商品使用指导")
      return false
    }

    if (variables.length > 0) {
      const types = variables.map((v) => v.type)
      for (let i = 0; i < formData.exampleImages.length; i += 1) {
        const vals = exampleInputs[i] || {}
        const missing = types.some((t) => !vals[t] || !vals[t].trim())
        if (missing) {
          toast.error(`请完善第${i + 1}个 Example prompt 的变量值`)
          return false
        }
      }
    }
    return true
  }

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (!isAuthenticated || !user) {
      toast.error("请先登录")
      return
    }

    if (!validateBasicInfo() || !validateDisplayInfo()) {
      return
    }

    setIsSubmitting(true)

    try {
      const examplePrompts = formData.exampleImages.map((imageUrl, index) => {
        let prompt = formData.description
        const inputs = exampleInputs[index] || {}

        Object.entries(inputs).forEach(([type, value]) => {
          const regex = new RegExp(`\\[${type}\\]`, "g")
          prompt = prompt.replace(regex, value || `[${type}]`)
        })

        return {
          imageUrl,
          prompt,
        }
      })

      const { data } = await apiPost<{ data: Product | null }>(
        "/api/products",
        {
          userId: user.id,
          walletAddress: user.wallet_address || "",
          postId: postId || null,
          name: formData.name,
          description: formData.description,
          price: formData.price === "Free" ? 0 : parseFloat(formData.price),
          currency: formData.currency,
          imageUrl:
            (formData.exampleImages[0] ||
              formData.imageUrl ||
              undefined) as string | undefined,
          fileUrl: formData.fileUrl || undefined,
          category: formData.category || "text",
          stock: formData.stock ? parseInt(formData.stock) : undefined,
          chain_product_id: (Date.now() % 86) + 15,
          work_id: null,
          contentData: {
            exampleImages: formData.exampleImages,
            guidance: formData.guidance,
            examplePrompts,
          },
        }
      )

      toast.success("商品创建成功！")
      resetForm()

      if (data) {
        onSuccess?.(data as Product)
        if (!onSuccess) {
          if (user?.username) {
            router.push(`/profile/${user.username}?tab=products`)
          } else {
            router.push("/profile?tab=products")
          }
        }
      }
    } catch (error) {
      console.error("[CreateProduct] Error:", error)
      toast.error("创建商品失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!editProductId) {
      setIsLoadingProduct(false)
      return
    }

    const loadProduct = async () => {
      setIsLoadingProduct(true)
      try {
        const { data } = await apiGet<{ data: any }>(`/api/products/${editProductId}`)
        if (!data) {
          throw new Error("Product not found")
        }

        setFormData({
          generationType: data.category || "",
          modelType: "",
          name: data.name,
          description: data.description,
          price: data.price === 0 ? "Free" : data.price.toString(),
          currency: data.currency || "mUSDT",
          imageUrl: data.image_url || "",
          exampleImages: data.content_data?.exampleImages || [],
          guidance: data.content_data?.guidance || "",
          fileUrl: data.file_url || "",
          category: data.category || "",
          stock: data.stock?.toString() || "",
        })
      } catch (error) {
        console.error("[CreateProduct] Failed to load product", error)
        toast.error("加载商品信息失败")
      } finally {
        setIsLoadingProduct(false)
      }
    }

    void loadProduct()
  }, [editProductId])

  useEffect(() => {
    const regex = /\[([^\]]+)\]/g
    const matches = Array.from(formData.description.matchAll(regex))
    const extractedTypes = matches.map((match) => match[1])

    setVariables((prevVariables) => {
      const typeToValuesMap = new Map<string, string[]>()
      prevVariables.forEach((v) => {
        if (!typeToValuesMap.has(v.type)) {
          typeToValuesMap.set(v.type, [])
        }
        typeToValuesMap.get(v.type)!.push(v.value)
      })

      const newVariables: Array<{ id: string; type: string; value: string }> =
        []

      extractedTypes.forEach((type, index) => {
        const id = `${type}-${index}`
        const values = typeToValuesMap.get(type) || []
        const value = values.length > 0 ? values.shift()! : ""

        newVariables.push({
          id,
          type,
          value,
        })
      })

      return newVariables
    })
  }, [formData.description])

  useEffect(() => {
    const types = variables.map((v) => v.type)
    setExampleInputs((prev) => {
      const next: Array<Record<string, string>> = formData.exampleImages.map(
        (_, idx) => {
          const existed = prev[idx] || {}
          const values: Record<string, string> = {}
          types.forEach((t) => {
            values[t] = existed[t] ?? ""
          })
          return values
        }
      )
      return next
    })
  }, [formData.exampleImages, variables])

  const renderExamplePrompts = useMemo(() => {
    if (formData.exampleImages.length === 0) return null

    return (
      <div className="space-y-3">
        <Label>Example Prompts</Label>
        <div className="space-y-4">
          {formData.exampleImages.map((img, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="relative w-28 h-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`example-${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2 text-sm text-foreground/90">
                <div className="flex flex-wrap gap-2 items-center">
                  {(() => {
                    const parts: Array<React.ReactNode> = []
                    const regex = /\[([^\]]+)\]/g
                    const template = formData.description || ""
                    let lastIndex = 0
                    let match: RegExpExecArray | null
                    while ((match = regex.exec(template)) !== null) {
                      const before = template.slice(lastIndex, match.index)
                      if (before) {
                        parts.push(
                          <span key={`txt-${idx}-${lastIndex}`}>{before}</span>
                        )
                      }
                      const type = match[1]
                      const value = exampleInputs[idx]?.[type] ?? ""
                      parts.push(
                        <Input
                          key={`inp-${idx}-${type}-${match.index}`}
                          value={value}
                          placeholder={type}
                          className="h-8 w-32"
                          onChange={(e) => {
                            setExampleInputs((prev) => {
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
                    if (tail) {
                      parts.push(<span key={`tail-${idx}`}>{tail}</span>)
                    }
                    return parts
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }, [exampleInputs, formData.description, formData.exampleImages])

  if (isLoadingProduct) {
    return (
      <Card className="rounded-3xl border border-border/40 p-8 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-12 w-2/3" />
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="rounded-3xl border border-border/40 p-8 shadow-apple space-y-6">
        <div>
          <h2 className="text-xl font-semibold">基本信息</h2>
          <p className="text-sm text-muted-foreground mt-1">
            描述商品的核心信息，方便买家理解价值
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>生成类型 *</Label>
              <Select
                value={formData.generationType}
                onValueChange={(value) =>
                  setFormData({ ...formData, generationType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择生成类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="图文">图文</SelectItem>
                  <SelectItem value="长文">长文</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>大模型类型 *</Label>
              <Select
                value={formData.modelType}
                onValueChange={(value) =>
                  setFormData({ ...formData, modelType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择大模型类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt">GPT</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="claude code">Claude Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="description">商品描述 *</Label>
            <Textarea
              id="description"
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
            <p className="text-xs text-muted-foreground text-right">
              {formData.description.length} / 500
            </p>
            {variables.length > 0 && (
            <div className="text-sm text-muted-foreground">
              当前有 {variables.length} 个变量：
              {variables.map((variable) => (
                <span key={variable.id} className="text-primary ml-1">
                  [{variable.type}]
                </span>
              ))}
            </div>
          )}
          </div>

          <div className="space-y-2">
            <Label>价格 *</Label>
            <Select
              value={formData.price}
              onValueChange={(value) =>
                setFormData({ ...formData, price: value })
              }
            >
              <SelectTrigger>
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
      </Card>

      <Card className="rounded-3xl border border-border/40 p-8 shadow-apple space-y-6">
        <div>
          <h2 className="text-xl font-semibold">展示与示例</h2>
          <p className="text-sm text-muted-foreground mt-1">
            上传示例图片并配置对应的变量及提示词
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">商品效果图</Label>
            <ImageUploader
              type="horizontal"
              images={formData.exampleImages}
              onChange={(images) =>
                setFormData({
                  ...formData,
                  exampleImages: images,
                  imageUrl: images[0] || formData.imageUrl,
                })
              }
            />
          </div>

          {renderExamplePrompts}

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
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          取消
        </Button>
        <Button type="submit" className="px-8" disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : isEditMode ? "保存商品" : "创建商品"}
        </Button>
      </div>
    </form>
  )
}
