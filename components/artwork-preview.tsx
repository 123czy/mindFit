"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronLeft, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ArtworkItem {
  id: string
  title: string
  description?: string
  imageUrl: string
  author?: string
  size?: string
  type: "image" | "card"
}

interface ArtworkPreviewProps {
  items: ArtworkItem[]
  folderName?: string
  onClose?: () => void
  onSave?: (items: ArtworkItem[]) => void
}

export function ArtworkPreview({ 
  items: initialItems, 
  folderName = "Artwork",
  onClose,
  onSave 
}: ArtworkPreviewProps) {
  const [items, setItems] = useState<ArtworkItem[]>(initialItems)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const dragRef = useRef<HTMLDivElement>(null)

  const currentItem = items[currentIndex]

  // 处理拖拽开始
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
  }

  // 处理拖拽中
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const diff = clientX - startX
    setDragOffset(diff)
  }

  // 处理拖拽结束
  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    // 根据拖拽距离决定是否切换
    const threshold = 80 // 降低阈值，更容易触发切换
    const dragDistance = Math.abs(dragOffset)
    
    if (dragDistance > threshold) {
      // 向右拖拽（卡片向右移动，选中下一张/右边的卡片）
      if (dragOffset > 0 && currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } 
      // 向左拖拽（卡片向左移动，选中上一张/左边的卡片）
      else if (dragOffset < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    }
    
    // 重置拖拽状态
    setDragOffset(0)
    setStartX(0)
  }

  // 更新当前项目
  const updateCurrentItem = (updates: Partial<ArtworkItem>) => {
    const newItems = [...items]
    newItems[currentIndex] = { ...newItems[currentIndex], ...updates }
    setItems(newItems)
  }

  // 删除当前项目
  const handleDelete = () => {
    if (items.length === 1) return
    const newItems = items.filter((_, index) => index !== currentIndex)
    setItems(newItems)
    if (currentIndex >= newItems.length) {
      setCurrentIndex(newItems.length - 1)
    }
  }

  // 保存更改
  const handleSave = () => {
    onSave?.(items)
  }

  // 计算卡片位置和样式
  const getCardStyle = (index: number) => {
    const offset = index - currentIndex
    // 拖拽时的位置偏移（更敏感的响应）
    const dragMultiplier = isDragging ? dragOffset / 280 : 0
    const position = offset - dragMultiplier
    
    // 基础变换
    const translateX = position * 280 // 卡片间距280px
    const scale = 1 - Math.abs(position) * 0.15 // 缩放递减15%
    const opacity = 1 - Math.abs(position) * 0.25 // 透明度递减25%
    const rotateY = position * -8 // Y轴旋转8度
    const translateZ = -Math.abs(position) * 150 // 深度150px
    
    return {
      transform: `
        translateX(${translateX}px)
        translateZ(${translateZ}px)
        scale(${Math.max(0.7, scale)})
        rotateY(${rotateY}deg)
      `,
      opacity: Math.max(0, Math.min(1, opacity)),
      zIndex: 100 - Math.abs(Math.round(position * 10)),
      transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0F] flex flex-col lg:flex-row">
      {/* 右侧3D卡片预览区域 - 移动端在上方 */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden order-1 lg:order-2 min-h-[50vh] lg:min-h-0">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        {/* 3D卡片容器 */}
        <div 
          ref={dragRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{ 
            perspective: '2000px',
            transformStyle: 'preserve-3d'
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {items.map((item, index) => {
            const isVisible = Math.abs(index - currentIndex) <= 2
            if (!isVisible) return null

            return (
              <div
                key={item.id}
                className="absolute cursor-grab active:cursor-grabbing"
                style={getCardStyle(index)}
              >
                <Card className="w-[280px] h-[360px] lg:w-[320px] lg:h-[420px] bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-gray-700/50 shadow-2xl overflow-hidden select-none">
                  <CardContent className="p-0 h-full flex flex-col relative">
                    {/* 顶部标签 */}
                    <div className="absolute top-3 right-3 lg:top-4 lg:right-4 bg-white/10 backdrop-blur-md px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-white text-xs font-medium z-10 border border-white/10">
                      FAR
                    </div>

                    {/* 图片区域 - 上半部分 */}
                    <div className="flex-1 relative overflow-hidden">
                      <div className="absolute inset-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          draggable={false}
                        />
                      </div>
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/95" />
                    </div>

                    {/* 底部信息 - 下半部分 */}
                    <div className="relative p-4 lg:p-6 pt-6 lg:pt-8 text-white z-10">
                      <h3 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3 tracking-tight">{item.title}</h3>
                      {item.author && (
                        <div className="flex items-center gap-2 lg:gap-2.5">
                          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-300" />
                          </div>
                          <span className="text-xs lg:text-sm text-gray-300">@{item.author}</span>
                        </div>
                      )}
                    </div>

                    {/* 右下角计数 */}
                    <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 text-white/40 text-sm font-medium">
                      {index + 1}/{items.length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* 底部指示器 */}
        <div className="absolute bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/30 w-2 hover:bg-white/50"
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

      </div>

      {/* 左侧编辑面板 - 移动端在下方 */}
      <div className="w-full lg:max-w-[520px] bg-background dark:bg-gray-900 overflow-y-auto m-0 lg:m-2 rounded-t-2xl lg:rounded-2xl order-2 lg:order-1">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* 头部 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 lg:h-10 lg:w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <h2 className="text-xl lg:text-2xl font-bold">{folderName}</h2>
            <div className="w-8 lg:w-10" />
          </div>

          {/* 说明文字 */}
          <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
            Each NFT will be minted using a pre-revealed asset until you upload and reveal your final artwork.
          </p>

          {/* 当前资源信息 */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs lg:text-sm font-semibold flex items-center gap-2 mb-2 lg:mb-3">
                <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                Pre-reveal asset
              </Label>
              
              {/* 缩略图 */}
              <div className="relative group bg-gray-50 dark:bg-gray-800 rounded-lg p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <Image
                      src={currentItem.imageUrl}
                      alt={currentItem.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-medium">1 asset uploaded</p>
                    <p className="text-xs lg:text-sm text-muted-foreground">{currentItem.size || "9MB"}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 lg:h-8 lg:w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleDelete}
                  >
                    <X className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 标题编辑 */}
            <div className="space-y-1.5 lg:space-y-2">
              <Label htmlFor="title" className="text-xs lg:text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={currentItem.title}
                onChange={(e) => updateCurrentItem({ title: e.target.value })}
                placeholder="Enter title"
                className="h-10 lg:h-11 text-sm"
              />
            </div>

            {/* 描述编辑 */}
            <div className="space-y-1.5 lg:space-y-2">
              <Label htmlFor="description" className="text-xs lg:text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={currentItem.description || ""}
                onChange={(e) => updateCurrentItem({ description: e.target.value })}
                placeholder="Enter description"
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {/* 作者编辑 */}
            {currentItem.author && (
              <div className="space-y-1.5 lg:space-y-2">
                <Label htmlFor="author" className="text-xs lg:text-sm font-medium">Author</Label>
                <Input
                  id="author"
                  value={currentItem.author}
                  onChange={(e) => updateCurrentItem({ author: e.target.value })}
                  placeholder="Enter author name"
                  className="h-10 lg:h-11 text-sm"
                />
              </div>
            )}
          </div>

          {/* 固定在底部的按钮 */}
          <div className="sticky bottom-0 left-0 right-0 bg-background dark:bg-gray-900 pt-4 lg:pt-6 pb-safe">
            <Button
              className="w-full h-12 lg:h-14 text-sm lg:text-base font-semibold rounded-full bg-black hover:bg-gray-800 text-white"
              onClick={handleSave}
            >
              Confirm onchain
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
