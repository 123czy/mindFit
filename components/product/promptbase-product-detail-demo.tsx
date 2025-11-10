"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Lock, RotateCcw, X, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/utils/copy-to-clipboard"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { useTrack } from "@/lib/analytics/use-track"

// Mock 数据
const mockProduct = {
  id: "mock-product-1",
  name: "Free Figures In Editorial Setting",
  description: `A confident [woman/man style: e.g., blonde woman in a red cut-out dress with gold chain details]
standing on a [setting: e.g., seaside balcony at sunset, with ocean view and glowing orange sky]
during [weather or atmosphere: e.g., golden hour, soft rain, overcast haze, dramatic storm light].
The mood is cinematic and elegant. posing naturally, with gentle shadows and an evocative color palette. The scene is fashion-forward and emotionally ambient. Editorial-style photography with natural light, compositional grace, and emotional depth. --ar 6:7 --v 7 --profile p6y8asw`,
  price: 0, // 可以切换为 3.99 或 6.99
  isFree: true,
  author: {
    id: "author-1",
    username: "generationepge1971",
    avatar: "/placeholder-user.jpg",
  },
  exampleImages: [
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
  ],
  guidance: `Instructions for Template Usage (keep the profile for consistent quality)

[woman/man style]
Choose a subject description that evokes fashion and presence.
• Examples: "blonde woman in a red cut-out dress with gold chain details", "silver-haired man in a velvet jacket and tailored pants", "petite woman in a white silk slip dress", "man with dreadlocks wearing an open linen shirt"
• Aim for expressive attire, hairstyle, posture, and accessories.

[setting]
Select a compelling natural or built location that offers cinematic backdrop potential.
• Examples: "seaside balcony at sunset, with ocean view and glowing orange sky", "rooftop with city skyline at blue hour", "clifftop with rolling meadows below", "dock on a misty lake surrounded by reeds"

[weather or atmosphere]
Pick atmospheric conditions that enhance the mood and visual narrative.
• Examples: "golden hour", "soft rain", "overcast haze", "dramatic storm light"`,
  examplePrompts: [
    {
      imageUrl: "/placeholder.jpg",
      prompt: `A confident Middle Eastern woman in a flowing navy kaftan with gold accents and soft waves standing on a courtyard terrace with arched railings and distant dunes during twilight with a warm desert glow. The mood is cinematic and elegant. posing naturally, with gentle shadows and an evocative color palette. The scene is fashion-forward and emotionally ambient. Editorial-style photography with natural light, compositional grace, and emotional depth. --ar 6:7 --v 7 --profile p6y8asw`,
    },
    {
      imageUrl: "/placeholder.jpg",
      prompt: `A confident South Asian woman with long dark braid in a flowing crimson sari with golden embroidery standing on a stone path by a cliff temple facing the ocean during a bright overcast with soft breeze. The mood is cinematic and elegant. posing naturally, with gentle shadows and an evocative color palette. The scene is fashion-forward and emotionally ambient. Editorial-style photography with natural light, compositional grace, and emotional depth. --ar 6:7 --v 7 --profile p6y8asw`,
    },
    {
      imageUrl: "/placeholder.jpg",
      prompt: `A confident petite woman in a white silk slip dress and minimal gold jewelry standing on a wooden dock stretching into calm water surrounded by mist during light rain with glistening reflections. The mood is cinematic and elegant. posing naturally, with gentle shadows and an evocative color palette. The scene is fashion-forward and emotionally ambient. Editorial-style photography with natural light, compositional grace, and emotional depth. --ar 6:7 --v 7 --profile p6y8asw`,
    },
  ],
}

export function PromptbaseProductDetailDemo() {
  const [viewMode, setViewMode] = useState<"free" | "paid">("free")
  const [hasPurchased, setHasPurchased] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { track } = useTrack()

  // 根据 viewMode 设置商品价格和状态
  const product = {
    ...mockProduct,
    price: viewMode === "free" ? 0 : 3.99,
    isFree: viewMode === "free",
  }

  // 从描述中提取变量
  const variables = useMemo(() => {
    const regex = /\[([^\]]+)\]/g
    const matches = Array.from(product.description.matchAll(regex))
    const uniqueTypes = Array.from(new Set(matches.map(match => match[1])))
    return uniqueTypes.map((type, index) => ({
      id: `${type}-${index}`,
      type: type,
    }))
  }, [product.description])

  // 生成填充后的 prompt（将变量替换为实际值）
  const filledPrompt = useMemo(() => {
    let result = product.description
    Object.entries(variableValues).forEach(([type, value]) => {
      if (value.trim()) {
        const regex = new RegExp(`\\[${type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g')
        result = result.replace(regex, value)
      }
    })
    return result
  }, [product.description, variableValues])

  // 收集所有图片到一个数组
  const allImages = useMemo(() => {
    const images: string[] = []
    // 添加 exampleImages
    images.push(...product.exampleImages)
    // 添加 examplePrompts 中的图片
    product.examplePrompts.forEach(example => {
      if (!images.includes(example.imageUrl)) {
        images.push(example.imageUrl)
      }
    })
    return images
  }, [product.exampleImages, product.examplePrompts])

  // 打开图片查看器
  const handleOpenImageViewer = (index: number) => {
    setCurrentImageIndex(index)
    setImageViewerOpen(true)
  }

  // 切换到上一张图片
  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
  }

  // 切换到下一张图片
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
  }

  // 下载图片
  const handleDownloadImage = async () => {
    const imageUrl = allImages[currentImageIndex]
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${currentImageIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("图片下载成功")
    } catch (error) {
      toast.error("图片下载失败")
    }
  }

  // 检查是否为免费商品
  const isFree = product.price === 0 || product.isFree

  // 是否可以查看完整内容
  const canViewFullContent = isFree || hasPurchased

  // 初始化变量值（从变量名中提取提示信息）
  useEffect(() => {
    if (showGenerator && variables.length > 0) {
      const initialValues: Record<string, string> = {}
      variables.forEach(({ type }) => {
        if (!variableValues[type]) {
          // 从类型中提取提示信息（如果有的话）
          const hintMatch = type.match(/:\s*(.+)$/)
          initialValues[type] = ""
        }
      })
      setVariableValues(prev => ({ ...prev, ...initialValues }))
    }
  }, [showGenerator, variables])

  // 键盘快捷键支持
  useEffect(() => {
    if (!imageViewerOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setImageViewerOpen(false)
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [imageViewerOpen, allImages.length])

  // 清除所有变量值
  const handleClearVariables = () => {
    setVariableValues({})
    toast.success("已清除所有变量值")
  }

  // 复制提示词模板（如果填充了变量，复制填充后的内容）
  const handleCopyTemplate = async () => {
    const hasFilledValues = Object.keys(variableValues).some(key => variableValues[key].trim())
    const textToCopy = hasFilledValues ? filledPrompt : product.description
    const success = await copyToClipboard(textToCopy)
    if (success) {
      setCopiedTemplate(true)
      toast.success("已复制到剪贴板")
      track({
        event_name: "copy",
        ap_name: "product_prompt_copy",
        refer: "product_detail",
        items: [
          {
            item_type: "product",
            item_value: product.id,
            item_meta: {
              view_mode: viewMode,
              variant: hasFilledValues ? "filled_template" : "base_template",
            },
          },
        ],
      })
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
      track({
        event_name: "copy",
        ap_name: "product_prompt_copy",
        refer: "product_detail",
        items: [
          {
            item_type: "product",
            item_value: product.id,
            item_meta: {
              view_mode: viewMode,
              variant: "example_prompt",
              example_index: index,
            },
          },
        ],
      })
      setTimeout(() => setCopiedIndex(null), 2000)
    } else {
      toast.error("复制失败")
    }
  }

  // 模拟购买成功
  const handlePurchaseSuccess = () => {
    setHasPurchased(true)
    toast.success("购买成功！")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 切换按钮 */}
        <div className="mb-6 flex justify-end">
          <Tabs
            value={viewMode}
            onValueChange={(v) => {
              const nextMode = v as "free" | "paid"
              setViewMode(nextMode)
              setHasPurchased(false) // 切换模式时重置购买状态
              track({
                event_name: "click",
                ap_name: "product_view_mode_tab",
                refer: "product_detail",
                items: [
                  {
                    item_type: "view_mode",
                    item_value: nextMode,
                  },
                ],
              })
            }}
          >
            <TabsList>
              <TabsTrigger value="free">免费商品</TabsTrigger>
              <TabsTrigger value="paid">付费商品</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* 左侧主要内容 */}
          <div className="space-y-8">
            {/* Generate images 和 Prompt template Card */}
            <Card className="relative">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* 顶部按钮区域 */}
                  <div className="flex items-center gap-2">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => {
                        const next = !showGenerator
                        setShowGenerator(next)
                        track({
                          event_name: "toggle",
                          ap_name: "product_generator_toggle",
                          refer: "product_detail",
                          items: [
                            {
                              item_type: "generator",
                              item_value: String(next),
                            },
                          ],
                        })
                      }}
                    >
                      {showGenerator ? "Close generator" : "Generate images"}
                    </Button>
                    {canViewFullContent && (
                      <Button
                        variant="outline"
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
                    )}
                  </div>

                  {/* 变量编辑表格（条件显示） */}
                  {showGenerator && variables.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Provide the exact prompts used to generate each example image. Type the template variable values for each example into the input boxes below.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearVariables}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          清除所有
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {variables.map((variable) => {
                          // 从变量类型中提取标签和提示信息
                          const typeParts = variable.type.split(":")
                          const label = typeParts[0].trim()
                          const hint = typeParts.length > 1 ? typeParts.slice(1).join(":").trim() : ""
                          
                          return (
                            <div key={variable.id} className="space-y-2">
                              <Label htmlFor={variable.id}>{label}</Label>
                              {hint && (
                                <p className="text-xs text-muted-foreground">{hint}</p>
                              )}
                              <Input
                                id={variable.id}
                                value={variableValues[variable.type] || ""}
                                onChange={(e) => {
                                  setVariableValues(prev => ({
                                    ...prev,
                                    [variable.type]: e.target.value
                                  }))
                                }}
                                placeholder={hint || `Enter ${label.toLowerCase()}`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Prompt template（始终显示） */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Prompt template</h2>
                    </div>
                    {canViewFullContent ? (
                      <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                        {Object.keys(variableValues).some(key => variableValues[key].trim()) 
                          ? filledPrompt 
                          : product.description}
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 高质量图片版本 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">High quality image versions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.exampleImages.map((imageUrl, index) => {
                    const imageIndex = allImages.indexOf(imageUrl)
                    return (
                      <div 
                        key={index} 
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleOpenImageViewer(imageIndex >= 0 ? imageIndex : index)}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Example ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 示例提示词 */}
            {product.examplePrompts.length > 0 && (
              <Card className="relative">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Example prompts</h2>
                  {canViewFullContent ? (
                    <div className="space-y-4">
                      {product.examplePrompts.map((example, index) => {
                        const imageIndex = allImages.indexOf(example.imageUrl)
                        return (
                          <div key={index} className="flex gap-4 items-start">
                            <div 
                              className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => handleOpenImageViewer(imageIndex >= 0 ? imageIndex : product.exampleImages.length + index)}
                            >
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
                        )
                      })}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="space-y-4 blur-sm select-none">
                        {product.examplePrompts.map((example, index) => (
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
            {product.guidance && (
              <Card className="relative">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Prompt instructions</h2>
                  {canViewFullContent ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm">{product.guidance}</div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="blur-sm select-none">
                        <div className="whitespace-pre-wrap text-sm">{product.guidance}</div>
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
                      {product.name}
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
                    <div className="space-y-2">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-lg font-semibold">${product.price}</p>
                      </div>
                      <Button
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={handlePurchaseSuccess}
                      >
                        购买商品
                      </Button>
                    </div>
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

      {/* 图片查看器 Dialog */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="w-full h-full max-w-full max-h-full p-0 bg-transparent border-none" showCloseButton={false}>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setImageViewerOpen(false)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white border-none rounded-full h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* 左箭头 - 在页面左侧 */}
            {allImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousImage}
                className="absolute left-0 z-50 bg-black/50 hover:bg-black/70 text-white border-none rounded-r-full h-12 w-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* 图片显示 */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {allImages[currentImageIndex] && (
                <div className="relative w-full h-full max-w-full max-h-full">
                  <Image
                    src={allImages[currentImageIndex]}
                    alt={`Image ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="100vw"
                  />
                </div>
              )}
            </div>

            {/* 右箭头 - 在页面右侧 */}
            {allImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextImage}
                className="absolute right-0 z-50 bg-black/50 hover:bg-black/70 text-white border-none rounded-l-full h-12 w-12"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            {/* 下载按钮 */}
            <Button
              variant="ghost"
              onClick={handleDownloadImage}
              className="absolute bottom-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white border-none rounded-lg px-4 py-2 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
