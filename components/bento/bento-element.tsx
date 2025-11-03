"use client"

import { ReactNode, useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Link2, Maximize, Minimize ,ExternalLink} from "lucide-react"
import type { BentoElement, BentoShape } from "@/lib/types/bento"
import { shapeConfig } from "@/lib/types/bento"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FallbackImage } from "@/components/ui/fallback-image"
import { ColorPicker } from "@/components/ui/color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Stack from "../Stack"
import Folder from "../Folder"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const images = [
    {
        id: "1",
        img: "https://picsum.photos/id/1015/600/900?grayscale",
        url: "https://example.com/one",
        height: 400,
      },
      {
        id: "2",
        img: "https://picsum.photos/id/1011/600/750?grayscale",
        url: "https://example.com/two",
        height: 250,
      },
      {
        id: "3",
        img: "https://picsum.photos/id/1020/600/800?grayscale",
        url: "https://example.com/three",
        height: 600,
      },
]

const posts = [
    {
        id: "1",
        title: "Post 1hghjsdgfhsdf",
        content: "Content 1",
        image: "https://picsum.photos/id/1015/600/600?grayscale",
        url: "https://example.com/one",
    },
    {
        id: "2",
        title: "Post 2dsfdsfsdfds",
        content: "Content 2",
        image: "https://picsum.photos/id/1011/600/600?grayscale",
        url: "https://example.com/two",
    },
    {
        id: "3",
        title: "Post 3werewerewrew",
        content: "Content 3",
        image: "https://picsum.photos/id/1020/600/600?grayscale",
        url: "https://example.com/three",
    },
]
const cards = [
    {
        id: "1",
        name: "Card 1rerwrwrwrwrewr",
        bio: "Content 1",
        avatar: "https://picsum.photos/id/1015/900/600?grayscale",
        type:"send"
    },
    {
        id: "2",
        name: "Card2erererer43243",
        bio: "Content 2",
        avatar: "https://picsum.photos/id/1011/600/600?grayscale",
        type:"buy"
    },
    {
        id: "3",
        name: "Card3rererewrwe",
        bio: "Content 3ghsdgagdahsdgagdajhs",
        avatar: "https://picsum.photos/id/1020/600/800?grayscale",
        type:"buy"
    }
]
interface BentoElementProps {
  element: BentoElement
  isEditing: boolean
  onDelete?: () => void
  onShapeChange?: (shape: BentoShape) => void
  onAddLink?: (id: string, url: string) => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  onColorChange?: (id: string, color: string) => void
  onContentChange?: (id: string, content: string) => void
}

export function BentoElementComponent({
  element,
  isEditing,
  onDelete,
  onShapeChange,
  onAddLink,
  onDragStart,
  onDragEnd,
  onColorChange,
  onContentChange,
}: BentoElementProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showShapeMenu, setShowShapeMenu] = useState(false)
  const [color, setColor] = useState("#E3825D")
  // 使用 element.shape 作为 key 来强制重新计算
  const config = shapeConfig[element.shape]
  const gridColumnSpan = config.width 
  const gridRowSpan = config.height
  const router = useRouter()
  const [showInput, setShowInput] = useState(false)
  const [linkValue, setLinkValue] = useState("")
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const [isEditingText, setIsEditingText] = useState(false)
  const [textValue, setTextValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 计算弹出框位置
  useEffect(() => {
    if (showInput && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPopupPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2
      })
    }
  }, [showInput])

  // 文本编辑自动 focus
  useEffect(() => {
    if (isEditingText && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditingText])

  // 新创建的文本元素自动进入编辑模式
  useEffect(() => {
    if (element.type === "text" && element.content === "点击编辑文本..." && !isEditingText) {
      setTextValue(element.content)
      setIsEditingText(true)
    }
  }, [element.id])
  
  // util: convert hex color to rgba with alpha
  const hexToRgba = (hex: string, alpha: number) => {
    const cleaned = hex.replace('#', '')
    const bigint = parseInt(cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // 所有可用的形状（5种最常用的）
  const getAvailableShapes = (): BentoShape[] => {
    // 任何元素都可以变成这5种形状
    return ["square-1x1", "square-2x2", "rect-1x2", "rect-2x1", "rect-2x3"]
  }

  const cardsNode = (): ReactNode[] => {
    return (cards.map((card) => (
    <div key={card.id} className="flex items-center justify-center p-2 rounded-2xl bg-transparent">
      <div className="flex  items-center justify-center p-2 rounded-2xl bg-transparent">
        <FallbackImage src={card.avatar} alt={card.name} fill className="rounded-lg relative" />
        <div className="flex flex-col items-start justify-start w-full absolute bottom-0 left-0 right-0 ">
          <p className="text-xs font-semibold line-clamp-1 w-full text-ellipsis overflow-hidden whitespace-nowrap text-white p-1">{card.name}</p>
          <p className="text-xs opacity-80 line-clamp-1 w-full text-ellipsis overflow-hidden whitespace-nowrap text-white p-1">@{card.bio}</p>
        </div>
      </div>
    </div>
  )))}

  const postsNode = (): ReactNode[] => {
    return (posts.map((post) => (
    <div key={post.id} className="flex p-1 rounded-2xl bg-transparent flex-col items-start justify-start">      
        <div className="max-w-full max-h-[4/5]">
        <FallbackImage src={post.image} alt={post.title} fill={true} className="rounded-lg" />
        </div>
        <p className="text-xs font-semibold line-clamp-1 w-full text-ellipsis overflow-hidden whitespace-nowrap">{post.title}</p>
    </div>
    )))}
    
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
              "text-white cursor-pointer"
            )}
            onClick={(e) => isEditing && e.preventDefault()}
          >
            <div className={`bg-gradient-to-br p-2 rounded-xl`} style={{
              backgroundImage: `linear-gradient(135deg, ${hexToRgba(element.color || '#E3825D', 0.8)}, ${hexToRgba(element.color || '#E3825D', 0.9)})`
            }}>
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
            </div>
            
          </a>
        )
      
      case "text":
        return (
          <div
            className={cn(
              "flex items-center justify-center w-full h-full p-4 rounded-2xl relative",
              // Use inline gradient instead of dynamic Tailwind classes so it reacts to runtime color
              "bg-gradient-to-br",
              !isEditingText && isEditing && "cursor-pointer"
            )}
            style={{
              backgroundImage: `linear-gradient(135deg, ${hexToRgba(element.color || '#E3825D', 0.8)}, ${hexToRgba(element.color || '#E3825D', 0.9)})`
            }}
            onClick={(e) => {
              if (!isEditing || isEditingText) return
              // 检查点击是否来自子元素（如删除按钮）
              if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button')) {
                return
              }
              e.stopPropagation()
              setTextValue(element.content)
              setIsEditingText(true)
            }}
          >
            {element.url && !isEditingText && (
              <a href={element.url} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 z-10">
                <ExternalLink className="w-4 h-4 text-white " />
              </a>
            )}
            {isEditingText ? (
              <Textarea
                ref={textareaRef}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onBlur={(e) => {
                  // 检查焦点是否移到了删除按钮或其他控制按钮
                  const relatedTarget = e.relatedTarget as HTMLElement
                  if (relatedTarget && relatedTarget.closest('button')) {
                    return
                  }
                  onContentChange?.(element.id, textValue)
                  setIsEditingText(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setTextValue(element.content)
                    setIsEditingText(false)
                  }
                  // Ctrl/Cmd + Enter 保存
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    onContentChange?.(element.id, textValue)
                    setIsEditingText(false)
                  }
                }}
                className={cn(
                  "w-full h-full resize-none border-1 border-white/50 text-white rounded-lg p-1 focus:border-white focus:outline-none focus:bg-background/50",
                  element.fontSize === "sm" && "text-sm",
                  element.fontSize === "md" && "text-base",
                  element.fontSize === "lg" && "text-lg"
                )}
                placeholder="输入文本内容..."
              />
            ) : (
              <p
                className={cn(
                  "text-white text-center break-words whitespace-pre-wrap",
                  element.fontSize === "sm" && "text-sm",
                  element.fontSize === "md" && "text-base",
                  element.fontSize === "lg" && "text-lg font-semibold",
                  !element.fontSize && "text-base"
                )}
              >
                {element.content}
              </p>
            )}
          </div>
        )

      case "stack":
        return (
          <div className="w-full h-full flex items-center justify-center p-4 rounded-2xl" onClick={() => {
            if (isEditing) return
            router.push(`/artwork-preview?type=image`)
          }}>
  <Stack
  randomRotation={true}
  sensitivity={180}
  sendToBackOnClick={false}
  cardDimensions={{ width: 200, height: 200 }}
  cardsData={images}
  />
          </div>
        )

    case "folder":
      return (
        <div className="w-full h-full flex items-center justify-center p-4 rounded-2xl" onClick={()=>{
            if (isEditing) return
            router.push(`/artwork-preview?type=${element.foldType}`) 
        }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white z-9999 text-2xl font-semibold bold">
              {element.foldType === "card" ? "名片夹" : "作品集"}
            </div>
           <Folder size={2} color={hexToRgba(element.color || "#E3825D", 1)} className="custom-folder relative" items={element.foldType === "card" ? cardsNode() : postsNode()}/>
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
    {(element.type === "image" || element.type === "text") && (
      <>
          <Button
              ref={buttonRef}
              variant="ghost"
              size="icon"
              className="hover:scale-110 transition-transform"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setLinkValue(element.url || '')
                setShowInput(!showInput)
              }}
            >
              <Link2 className="h-3 w-3" />
            </Button>
            {showInput && typeof window !== 'undefined' && createPortal(
              <div 
                className="fixed w-64 z-[99999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-primary p-3"
                style={{
                  top: `${popupPosition.top}px`,
                  left: `${popupPosition.left}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <Input 
                  type="text" 
                  placeholder="Enter link here" 
                  value={linkValue} 
                  onChange={(e) => {
                    setLinkValue(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onAddLink?.(element.id, linkValue)
                      setShowInput(false)
                    } else if (e.key === 'Escape') {
                      setShowInput(false)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      onAddLink?.(element.id, linkValue)
                      setShowInput(false)
                    }, 200)
                  }}
                  className="w-full"
                  autoFocus
                />
              </div>,
              document.body
            )}
        </>
            )}
           
            <div className="flex items-center gap-2 p-2 border-l-1 border-l-blue-500 dark:bg-gray-800 z-9999 cursor-pointer">
            <ColorPicker 
              value={color}
              onChange={(newColor) => {
                setColor(newColor)               // 本地更新
                onColorChange?.(element.id, newColor)  // 通知父层（可选）
              }}
            />
            </div>
    </>  
    )}


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
        className={cn(`w-${gridRowSpan * 100}px h-${gridColumnSpan * 100}px`,isEditing && "cursor-move")}
        draggable={isEditing}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {renderContent()}
      </div>

      {/* 编辑模式下的控制按钮 */}
      {isEditing && (isHovered || isEditingText) && (
        <>
          {/* 删除按钮 */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className={cn(
              "absolute -top-2 -left-2 h-6 w-6 rounded-full shadow-lg transition-opacity z-[10000]",
              isEditingText ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Delete button clicked for:', element.id, element.type)
              onDelete?.()
            }}
            onMouseDown={(e) => {
              // 防止 textarea 的 onBlur 先触发
              e.preventDefault()
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

