"use client"

import { useState } from "react"
import { Image, Link as LinkIcon, Type, Monitor, Smartphone, Heading } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { BentoElement } from "@/lib/types/bento"
import { cn } from "@/lib/utils"

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
    })

    resetForm()
    setDialogType(null)
  }

  const handleAddLink = () => {
    if (!linkUrl.trim() || !linkTitle.trim()) return

    onAddElement({
      type: "link",
      shape: "rect-1x2",
      url: linkUrl,
      title: linkTitle,
      icon: linkIcon || "🔗",
    })

    resetForm()
    setDialogType(null)
  }

  const handleAddText = () => {
    if (!textContent.trim()) return

    onAddElement({
      type: "text",
      shape: "square-2x2",
      content: textContent,
      fontSize: "md",
    })

    resetForm()
    setDialogType(null)
  }

  const handleAddSection = () => {
    if (!sectionTitle.trim()) return

    onAddElement({
      type: "section",
      shape: "wide-1x3",
      title: sectionTitle,
    })

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
                onClick={() => setDialogType("image")}
                className="rounded-xl"
              >
                <Image className="h-4 w-4 mr-1" />
                图片
              </Button>

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
                onClick={() => setDialogType("text")}
                className="rounded-xl"
              >
                <Type className="h-4 w-4 mr-1" />
                文本
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogType("section")}
                className="rounded-xl"
              >
                <Heading className="h-4 w-4 mr-1" />
                标题
              </Button>

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

      {/* 添加图片对话框 */}
      <Dialog open={dialogType === "image"} onOpenChange={() => setDialogType(null)}>
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
      </Dialog>

      {/* 添加链接对话框 */}
      <Dialog open={dialogType === "link"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加链接</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-title">标题</Label>
              <Input
                id="link-title"
                placeholder="我的网站"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="link-icon">图标 (可选)</Label>
              <Input
                id="link-icon"
                placeholder="🔗"
                value={linkIcon}
                onChange={(e) => setLinkIcon(e.target.value)}
              />
            </div>
            <Button onClick={handleAddLink} className="w-full">
              添加
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加文本对话框 */}
      <Dialog open={dialogType === "text"} onOpenChange={() => setDialogType(null)}>
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
      </Dialog>

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

