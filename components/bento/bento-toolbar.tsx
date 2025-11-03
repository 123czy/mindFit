"use client"

import { useState, useRef, useEffect } from "react"
import { Image, Link as LinkIcon, Type, Monitor, Smartphone, Heading, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { BentoElement } from "@/lib/types/bento"
import { cn } from "@/lib/utils"

// 平台配置
interface PlatformConfig {
  name: string
  icon: string
  patterns: RegExp[]
  color: string
}

const PLATFORMS: PlatformConfig[] = [
  {
    name: "抖音",
    icon: "🎵",
    patterns: [/douyin\.com/, /tiktok\.com/],
    color: "#000000"
  },
  {
    name: "微信",
    icon: "💬",
    patterns: [/weixin\.qq\.com/, /wx\.qq\.com/, /mp\.weixin\.qq\.com/],
    color: "#07C160"
  },
  {
    name: "小红书",
    icon: "📕",
    patterns: [/xiaohongshu\.com/, /xhslink\.com/],
    color: "#FF2442"
  },
  {
    name: "微博",
    icon: "🔴",
    patterns: [/weibo\.com/, /t\.cn/],
    color: "#E6162D"
  },
  {
    name: "B站",
    icon: "📺",
    patterns: [/bilibili\.com/, /b23\.tv/],
    color: "#00A1D6"
  },
  {
    name: "知乎",
    icon: "💡",
    patterns: [/zhihu\.com/, /zhuanlan\.zhihu\.com/],
    color: "#0084FF"
  },
  {
    name: "GitHub",
    icon: "💻",
    patterns: [/github\.com/, /github\.io/],
    color: "#181717"
  },
  {
    name: "Twitter",
    icon: "🐦",
    patterns: [/twitter\.com/, /x\.com/],
    color: "#1DA1F2"
  },
  {
    name: "Instagram",
    icon: "📷",
    patterns: [/instagram\.com/],
    color: "#E4405F"
  },
  {
    name: "YouTube",
    icon: "▶️",
    patterns: [/youtube\.com/, /youtu\.be/],
    color: "#FF0000"
  }
]

// 识别平台
function detectPlatform(url: string): { icon: string; name: string; color: string } {
  const lowerUrl = url.toLowerCase()
  
  for (const platform of PLATFORMS) {
    if (platform.patterns.some(pattern => pattern.test(lowerUrl))) {
      return {
        icon: platform.icon,
        name: platform.name,
        color: platform.color
      }
    }
  }
  
  // 默认链接图标
  return {
    icon: "🔗",
    name: "链接",
    color: "#6B7280"
  }
}

interface BentoToolbarProps {
  isEditing: boolean
  isMobileView: boolean
  onAddElement: (element: Omit<BentoElement, "id" | "position">) => void
  onToggleView: () => void
  onToggleEdit: () => void
}

type AddDialogType = "image" | "link" | "text" | "section" | null

export function BentoToolbar({
  isEditing,
  isMobileView,
  onAddElement,
  onToggleView,
  onToggleEdit,
}: BentoToolbarProps) {
  const [dialogType, setDialogType] = useState<AddDialogType>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [linkIcon, setLinkIcon] = useState("")
  const [textContent, setTextContent] = useState("")
  const [sectionTitle, setSectionTitle] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)
  const [detectedPlatform, setDetectedPlatform] = useState<{ icon: string; name: string; color: string } | null>(null)

  // 监听链接输入，自动检测平台
  useEffect(() => {
    if (linkUrl) {
      const platform = detectPlatform(linkUrl)
      setDetectedPlatform(platform)
      if (!linkTitle) {
        setLinkTitle(platform.name)
      }
    } else {
      setDetectedPlatform(null)
    }
  }, [linkUrl])

  // 当打开链接输入框时自动 focus
  useEffect(() => {
    if (dialogType === "link" && linkInputRef.current) {
      setTimeout(() => {
        linkInputRef.current?.focus()
      }, 100)
    }
  }, [dialogType])

  const resetForm = () => {
    setImageUrl("")
    setLinkUrl("")
    setLinkTitle("")
    setLinkIcon("")
    setTextContent("")
    setSectionTitle("")
  }

  const handleAddImage = () => {
    if (!imageUrl.trim()) return

    onAddElement({
      type: "image",
      shape: "square-2x2",
      src: imageUrl,
      alt: "Bento image",
    } as Omit<BentoElement, "id" | "position">)

    resetForm()
    setDialogType(null)
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 创建本地 URL
    const localUrl = URL.createObjectURL(file)
    
    onAddElement({
      type: "image",
      shape: "square-2x2",
      src: localUrl,
      alt: file.name,
    } as Omit<BentoElement, "id" | "position">)

    // 重置 file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 直接添加文本元素
  const handleAddTextDirect = () => {
    onAddElement({
      type: "text",
      shape: "square-2x2",
      content: "点击编辑文本...",
      fontSize: "md",
    } as Omit<BentoElement, "id" | "position">)
  }

  const handleAddLink = () => {
    if (!linkUrl.trim()) return

    const platform = detectPlatform(linkUrl)
    const title = linkTitle.trim() || platform.name

    onAddElement({
      type: "link",
      shape: "rect-1x2",
      url: linkUrl,
      title: title,
      icon: platform.icon,
      color: platform.color,
    } as Omit<BentoElement, "id" | "position">)

    resetForm()
    setDialogType(null)
    setDetectedPlatform(null)
  }

  // 处理粘贴
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setLinkUrl(text)
        // 自动提交
        setTimeout(() => {
          const platform = detectPlatform(text)
          onAddElement({
            type: "link",
            shape: "rect-1x2",
            url: text,
            title: platform.name,
            icon: platform.icon,
            color: platform.color,
          } as Omit<BentoElement, "id" | "position">)
          resetForm()
          setDialogType(null)
          setDetectedPlatform(null)
        }, 300)
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err)
    }
  }

  const handleAddText = () => {
    if (!textContent.trim()) return

    onAddElement({
      type: "text",
      shape: "square-2x2",
      content: textContent,
      fontSize: "md",
    } as Omit<BentoElement, "id" | "position">)

    resetForm()
    setDialogType(null)
  }

  const handleAddSection = () => {
    if (!sectionTitle.trim()) return

    onAddElement({
      type: "section",
      shape: "wide-1x3",
      title: sectionTitle,
    } as Omit<BentoElement, "id" | "position">)

    resetForm()
    setDialogType(null)
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border">
          {/* 编辑模式切换 */}
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={onToggleEdit}
            className="rounded-xl"
          >
            {isEditing ? "完成编辑" : "编辑"}
          </Button>

          {isEditing && (
            <>
              <div className="h-6 w-px bg-border" />

              {/* 添加元素按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl"
              >
                <Image className="h-4 w-4 mr-1" />
                图片
              </Button>

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogType("link")}
                className="rounded-xl"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                链接
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddTextDirect}
                className="rounded-xl"
              >
                <Type className="h-4 w-4 mr-1" />
                文本
              </Button>

              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogType("section")}
                className="rounded-xl"
              >
                <Heading className="h-4 w-4 mr-1" />
                标题
              </Button> */}

              <div className="h-6 w-px bg-border" />
            </>
          )}

          {/* 视图切换 */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={!isMobileView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => !isMobileView || onToggleView()}
              className={cn("h-7 w-7 p-0", !isMobileView && "bg-white dark:bg-gray-800")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={isMobileView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => isMobileView || onToggleView()}
              className={cn("h-7 w-7 p-0", isMobileView && "bg-white dark:bg-gray-800")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 添加图片对话框 - 保留用于URL方式添加（可选） */}
      {/* <Dialog open={dialogType === "image"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加图片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">图片 URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleAddImage} className="w-full">
              添加
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}

      {/* 添加链接输入框 - 在工具栏上方显示 */}
      {dialogType === "link" && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {detectedPlatform && (
                  <span className="text-2xl">{detectedPlatform.icon}</span>
                )}
                <h3 className="text-sm font-semibold">
                  {detectedPlatform ? `添加${detectedPlatform.name}链接` : "添加链接"}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setDialogType(null)
                  resetForm()
                  setDetectedPlatform(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Input
                ref={linkInputRef}
                type="text"
                placeholder="Enter Link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && linkUrl.trim()) {
                    handleAddLink()
                  } else if (e.key === "Escape") {
                    setDialogType(null)
                    resetForm()
                    setDetectedPlatform(null)
                  }
                }}
                className="pr-20 h-11"
              />
              <Button
                onClick={handlePaste}
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-4 text-sm font-semibold"
              >
                Paste
              </Button>
            </div>

            {/* 平台指示器 */}
            {detectedPlatform && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: detectedPlatform.color }}
                />
                <span>自动识别为 {detectedPlatform.name}</span>
              </div>
            )}

            {/* 可选：自定义标题 */}
            {linkUrl && (
              <div className="pt-2 border-t">
                <Input
                  type="text"
                  placeholder="自定义标题（可选）"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            )}

            
          </div>
        </div>
      )}

      {/* 添加文本对话框 - 已移除，改为直接添加并inline编辑 */}
      {/* <Dialog open={dialogType === "text"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加文本</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-content">内容</Label>
              <Textarea
                id="text-content"
                placeholder="输入文本内容..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleAddText} className="w-full">
              添加
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}

      {/* 添加 Section 标题对话框 */}
      <Dialog open={dialogType === "section"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加分组标题</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-title">标题</Label>
              <Input
                id="section-title"
                placeholder="例如：社交媒体"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
              />
            </div>
            <Button onClick={handleAddSection} className="w-full">
              添加
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

