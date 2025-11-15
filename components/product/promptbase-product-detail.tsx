"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, Lock } from "lucide-react"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/utils/copy-to-clipboard"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import type { Product } from "@/lib/types"
import { ProductPurchase } from "../contract/product-purchase"
import { apiGet } from "@/lib/utils/api-client"

interface PromptbaseProductDetailProps {
  product: Product & {
    author?: {
      id: string
      username: string
      avatar: string
    }
    exampleImages?: string[]
    guidance?: string
    examplePrompts?: Array<{
      imageUrl: string
      prompt: string
    }>
  }
}

export function PromptbaseProductDetail({ product }: PromptbaseProductDetailProps) {
  const { user } = useCurrentUser()
  const [hasPurchased, setHasPurchased] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState(false)

  // 从 contentData 中提取数据，如果没有则使用默认值
  const exampleImages = product.exampleImages || (product.contentData?.exampleImages as string[]) || []
  const guidance = product.guidance || product.contentData?.guidance as string || ""
  const examplePrompts = product.examplePrompts || (product.contentData?.examplePrompts as Array<{ imageUrl: string; prompt: string }>) || []

  // 检查是否为免费商品
  const isFree = product.price === 0 || product.isFree

  // 检查用户是否已购买
  useEffect(() => {
    const checkPurchase = async () => {
      if (isFree || !user) {
        setHasPurchased(isFree)
        return
      }

      // try {
      //   const response = await apiGet<{ data: { hasPurchased: boolean } }>(
      //     `/api/purchases/status?buyerId=${user.id}&productId=${product.id}`
      //   )
      //   setHasPurchased(response.data?.hasPurchased ?? false)
      // } catch (error) {
      //   console.error("Failed to load purchase status", error)
      //   setHasPurchased(false)
      // }
    }

    void checkPurchase()
  }, [user, product.id, isFree])

  // 是否可以查看完整内容
  const canViewFullContent = isFree || hasPurchased

  // 复制提示词模板
  const handleCopyTemplate = async () => {
    const success = await copyToClipboard(product.description)
    if (success) {
      setCopiedTemplate(true)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedTemplate(false), 2000)
    } else {
      toast.error("复制失败")
    }
  }

  // 复制示例提示词
  const handleCopyExample = async (prompt: string, index: number) => {
    const success = await copyToClipboard(prompt)
    if (success) {
      setCopiedIndex(index)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedIndex(null), 2000)
    } else {
      toast.error("复制失败")
    }
  }

  // 从描述中提取变量
  const extractVariables = (text: string) => {
    const regex = /\[([^\]]+)\]/g
    const matches = Array.from(text.matchAll(regex))
    return matches.map(match => match[1])
  }

  // 将描述中的变量替换为实际值（用于示例提示词）
  const replaceVariables = (template: string, values: Record<string, string>) => {
    let result = template
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
    })
    return result
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* 左侧主要内容 */}
          <div className="space-y-8">
            {/* 生成图片按钮 */}
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              Generate images
            </Button>

            {/* 提示词模板 */}
            <Card className="relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Prompt template</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyTemplate}
                    className="flex items-center gap-2"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="h-4 w-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy prompt
                      </>
                    )}
                  </Button>
                </div>
                {canViewFullContent ? (
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                    {product.description}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap blur-sm select-none">
                      {product.description}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                      <div className="text-center space-y-2">
                        <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">购买后查看完整提示词</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 高质量图片版本 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">High quality image versions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {exampleImages.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={imageUrl}
                        alt={`Example ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 示例提示词 */}
            {examplePrompts.length > 0 && (
              <Card className="relative">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Example prompts</h2>
                  {canViewFullContent ? (
                    <div className="space-y-4">
                      {examplePrompts.map((example, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                            <Image
                              src={example.imageUrl}
                              alt={`Example ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="bg-muted rounded-lg p-3 font-mono text-sm whitespace-pre-wrap">
                              {example.prompt}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyExample(example.prompt, index)}
                              className="flex items-center gap-2"
                            >
                              {copiedIndex === index ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  已复制
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="space-y-4 blur-sm select-none">
                        {examplePrompts.map((example, index) => (
                          <div key={index} className="flex gap-4 items-start">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                              <Image
                                src={example.imageUrl}
                                alt={`Example ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="bg-muted rounded-lg p-3 font-mono text-sm whitespace-pre-wrap">
                                {example.prompt}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                        <div className="text-center space-y-2">
                          <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">购买后查看示例提示词</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 商品使用指导 */}
            {guidance && (
              <Card className="relative">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Prompt instructions</h2>
                  {canViewFullContent ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm">{guidance}</div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="blur-sm select-none">
                        <div className="whitespace-pre-wrap text-sm">{guidance}</div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                        <div className="text-center space-y-2">
                          <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">购买后查看使用指导</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧商品信息 */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      {product.name || product.title}
                      {isFree && <span className="ml-2 text-sm font-normal text-muted-foreground">(Free)</span>}
                    </h1>
                    {product.author && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={product.author.avatar}
                            alt={product.author.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">@{product.author.username}</span>
                        <Button variant="outline" size="sm">
                          Subscribe
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isFree && !hasPurchased && (
                    <ProductPurchase
                      productId={product.id}
                      productName={product.name || product.title || "商品"}
                      price={product.price}
                      onPurchaseSuccess={() => {
                        setHasPurchased(true)
                        toast.success("购买成功！")
                      }}
                    />
                  )}

                  {!isFree && hasPurchased && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-600">✓ 您已购买此商品</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
