"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Link2, Maximize, Minimize } from "lucide-react"
import type { BentoElement, BentoShape } from "@/lib/types/bento"
import { shapeConfig } from "@/lib/types/bento"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FallbackImage } from "@/components/ui/fallback-image"
import { ColorPicker } from "@/components/ui/color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface BentoElementProps {
  element: BentoElement
  isEditing: boolean
  onDelete?: () => void
  onShapeChange?: (shape: BentoShape) => void
  onAddLink?: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export function BentoElementComponent({
  element,
  isEditing,
  onDelete,
  onShapeChange,
  onAddLink,
  onDragStart,
  onDragEnd,
}: BentoElementProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showShapeMenu, setShowShapeMenu] = useState(false)
  const [color, setColor] = useState("#3B82F6")
  // 使用 element.shape 作为 key 来强制重新计算
  const config = shapeConfig[element.shape]
  const gridColumnSpan = config.width
  const gridRowSpan = config.height

  
  // 所有可用的形状（5种最常用的）
  const getAvailableShapes = (): BentoShape[] => {
    // 任何元素都可以变成这5种形状
    return ["square-1x1", "square-2x2", "rect-1x2", "rect-2x1", "rect-2x3"]
  }
  
  const renderContent = () => {
    switch (element.type) {
      case "section":
        return (
          <div className="w-full h-full flex items-center px-4 rounded-2xl bg-transparent">
            <h3 className="text-lg font-semibold text-foreground">
              {element.title}
            </h3>
          </div>
        )
      
      case "image":
        return (
          <div className="relative w-full h-full overflow-hidden rounded-2xl">
            <FallbackImage
              src={element.src || "/placeholder.svg"}
              alt={element.alt || "Bento image"}
              fill
              className="object-cover"
            />
          </div>
        )
      
      case "link":
        return (
          <a
            href={element.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex flex-col justify-between w-full h-full p-4 rounded-2xl transition-all",
              "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
              "text-white cursor-pointer"
            )}
            onClick={(e) => isEditing && e.preventDefault()}
          >
            <div className="flex items-start justify-between">
              {element.icon && (
                <span className="text-2xl">{element.icon}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base break-words">
                {element.title}
              </p>
              <p className="text-xs opacity-80 mt-1 truncate">
                {element.url}
              </p>
            </div>
          </a>
        )
      
      case "text":
        return (
          <div
            className={cn(
              "flex items-center justify-center w-full h-full p-4 rounded-2xl",
              "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
              element.color || ""
            )}
          >
            <p
              className={cn(
                "text-center break-words",
                element.fontSize === "sm" && "text-sm",
                element.fontSize === "md" && "text-base",
                element.fontSize === "lg" && "text-lg font-semibold",
                !element.fontSize && "text-base"
              )}
            >
              {element.content}
            </p>
          </div>
        )
    }
  }

  // 渲染形状图标（更直观的形状展示）
const ShapePreview = ({ shape }: { shape: BentoShape }) => {
   const config = shapeConfig[shape]
    
     return (
      <div className="flex items-center justify-center p-1">
        <div
          className={cn(
            "bg-gray-300 dark:bg-gray-600 rounded",
            element.shape === shape && "bg-blue-500"
          )}
          style={{
            width: `${config.width * 8}px`,
            height: `${config.height * 8}px`,
          }}
        />
      </div>
    )
  }


  const renderShapeMenu = () => {
    return (
        <>
    {element.type === "image" && (
                <div className="mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-border z-9999">
                    <div className="flex gap-2">
                    <Popover>
      <PopoverTrigger asChild>
          <div className="w-full flex items-center gap-2 cursor-pointer  hover:scale-110 transition-transform">
          <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddLink?.()
              }}
            >
              <Link2 className="h-3 w-3" />
            </Button>
            </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="w-full flex items-center gap-2 cursor-pointer  hover:scale-110 transition-transform">
            add your link
        </div>
        </PopoverContent>
        </Popover>
                    </div>
                </div>
            )}
            {
            element.type === "text" && (
            <div className="flex items-center gap-2 p-2 border-l-1 border-l-blue-500 dark:bg-gray-800 z-9999 cursor-pointer">
               <Popover>
      <PopoverTrigger asChild>
          <div className="w-full flex items-center gap-2 cursor-pointer  hover:scale-110 transition-transform">
          <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddLink?.()
              }}
            >
              <Link2 className="h-3 w-3" />
            </Button>
            </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="w-full flex items-center gap-2 cursor-pointer  hover:scale-110 transition-transform">
            add your link
        </div>
        </PopoverContent>
        </Popover>
            <ColorPicker 
              value={color}
              onChange={setColor}
            />
            </div>
            )}
        </>
    )
  }

  return (
    <div
      className={`relative group transition-all`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowShapeMenu(false)
      }}
    >
      <div
        className={cn(`w-[${gridColumnSpan * 100}px] h-[${gridRowSpan * 100}px]`,isEditing && "cursor-move")}
        draggable={isEditing}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {renderContent()}
      </div>

      {/* 编辑模式下的控制按钮 */}
      {isEditing && isHovered && (
        <>
          {/* 删除按钮 */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -left-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete?.()
            }}
          >
            <X className="h-3 w-3" />
          </Button>


          {/* 形状切换按钮 */}
          {element.type !== "section" && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full shadow-lg relative z-20"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowShapeMenu(!showShapeMenu)
                }}
              >
                <Maximize className="h-3 w-3" />
              </Button>

              {/* 形状选择菜单 - 更直观的展示 */}
              {showShapeMenu && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-border z-9999">
                  <div className="flex gap-2">
                    {getAvailableShapes().map((shape) => (
                      <button
                        key={shape}
                        type="button"
                        className={cn(
                          "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative z-9999",
                          element.shape === shape && "bg-blue-100 dark:bg-blue-900"
                        )}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onShapeChange?.(shape)
                          setShowShapeMenu(false)
                        }}
                        title={shapeConfig[shape].label}
                      >
                        <ShapePreview shape={shape} />
                      </button>
                    ))}
                    {renderShapeMenu()}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

