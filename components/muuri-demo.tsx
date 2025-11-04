"use client"

import { useEffect, useRef, useState } from "react"
import type { BentoElement, BentoShape } from "@/lib/types/bento"
import { shapeConfig } from "@/lib/types/bento"
import { BentoElementComponent } from "./bento/bento-element"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Lock, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth/auth-context"
interface MuuriDemoProps {
  elements: BentoElement[]
  isEditing: boolean
  isMobileView: boolean
  onElementsChange?: (elements: BentoElement[]) => void
  isUnlocked?: boolean
  isOwner?: boolean
  onUnlock?: () => void
  profilePrice?: number
}

const BASE = 100
const GUTTER = 10

export function MuuriDemo({ 
  elements, 
  isEditing, 
  isMobileView, 
  onElementsChange,
  isUnlocked = true,
  isOwner = false,
  onUnlock,
  profilePrice = 9.99
}: MuuriDemoProps) {
  const { isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const muuriRef = useRef<any>(null)

  useEffect(() => {
    const initMuuri = async () => {
      if (!gridRef.current || muuriRef.current) return

      try {
        const Muuri = (await import("muuri")).default

        muuriRef.current = new Muuri(gridRef.current, {
          items: ".muuri-item",
          dragEnabled: true,
        //   dragEnabled: isEditing,
          layout: {
            fillGaps: true,
            horizontal: false,
            alignRight: false,
            alignBottom: false,
            rounding: false,
          },
          layoutDuration: 300,
          layoutEasing: "ease-out",
          dragContainer: document.body,
          dragStartPredicate: {
            distance: 0,
            delay: 0,
          },
        })

        muuriRef.current.on("dragEnd", () => {
          console.log("Drag ended")
        })

        console.log("Muuri initialized successfully!")
      } catch (error) {
        console.error("Failed to initialize Muuri:", error)
      }
    }

    initMuuri()

    return () => {
      if (muuriRef.current) {
        muuriRef.current.destroy()
        muuriRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (muuriRef.current && elements.length > 0) {
      // 使用 setTimeout 确保 DOM 完全更新
      const timer = setTimeout(() => {
        try {
          // 获取所有新的 items
          const items = muuriRef.current.getItems()
          const newItems = Array.from(gridRef.current?.querySelectorAll('.muuri-item') || [])
            .filter((el) => !items.some((item: any) => item.getElement() === el))
          
          // 如果有新元素，添加到 Muuri
          if (newItems.length > 0) {
            muuriRef.current.add(newItems, { layout: false })
          }
          
          // 刷新所有 items 并重新布局
          muuriRef.current.refreshItems()
          muuriRef.current.layout(true)
        } catch (error) {
          console.error('Muuri layout error:', error)
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [elements])

  const handleDelete = (id: string) => {
    if (!onElementsChange) return
    const itemElement = document.querySelector(`[data-id="${id}"]`)
    if (itemElement && muuriRef.current) {
      muuriRef.current.remove([itemElement], { removeElements: true })
    }
    onElementsChange(elements.filter((el) => el.id !== id))
  }

  const handleShapeChange = (id: string, shape: BentoShape) => {
    if (!onElementsChange) return
    console.log('Shape changed for element:', id, shape)
    const newElements = elements.map((el) => 
      el.id === id ? { ...el, shape } : el
    )
    onElementsChange(newElements)
  }

  const handleAddLink = (id: string, url: string) => {
    console.log('Add link to element:', id)
    const newElements = elements.map((el) => 
      el.id === id ? { ...el, url } : el
    )
    onElementsChange?.(newElements)
  }

  const handleColorChange = (id: string, newColor: string) => {
    onElementsChange?.(
      elements.map(el => el.id === id ? { ...el, color: newColor } : el)
    )
  }

  const handleContentChange = (id: string, content: string) => {
    onElementsChange?.(
      elements.map(el => el.id === id && el.type === "text" ? { ...el, content } : el)
    )
  }

  const handleUnlock = async () => {
    if (!isAuthenticated) {
      toast.error("请先登录")
      return
    }

    if (isOwner) {
      toast.info("这是您自己的资料")
      return
    }

    setIsProcessing(true)
    
    // 模拟付费流程
    try {
      // TODO: 这里应该调用实际的付费 API
      // 例如：await createTransaction({ profileId: user.id, amount: profilePrice })
      
      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success("解锁成功！")
      onUnlock?.()
    } catch (error) {
      console.error("Unlock error:", error)
      toast.error("解锁失败，请重试")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={cn(
        "mx-auto transition-all duration-300 min-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent relative",
        isMobileView ? "w-full max-w-[375px]" : "w-full max-w-4xl"
      )}
    >  
      <div 
        ref={gridRef} 
        className={cn(
          "muuri-grid relative p-4 sm:p-6",
          !isUnlocked && !isOwner && "blur-sm select-none pointer-events-none"
        )}
      >

        {elements.map((element, index) => {
          const conf = shapeConfig[element.shape]
          const width = conf.width * BASE + (conf.width - 1) * GUTTER
          const height = conf.height * BASE + (conf.height - 1) * GUTTER

          return (
            <div
              key={element.id}
              data-id={element.id}
              data-index={index}
              className="muuri-item m-2"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                position: "absolute",
                touchAction: "none",
                transition: "transform 0.3s ease, opacity 0.3s ease",
              }}
            >
              <BentoElementComponent 
                element={element} 
                isEditing={isEditing} 
                onDelete={() => handleDelete(element.id)}
                onShapeChange={(shape) => handleShapeChange(element.id, shape)}
                onAddLink={(id, url) => handleAddLink(id, url)}
                onColorChange={(id, color) => handleColorChange(id, color)}
                onContentChange={(id, content) => handleContentChange(id, content)}
              />
            </div>
          )
        })}


        {/* 空状态 */}
        {elements.length === 0 && (
          <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-2xl">
            <p className="text-muted-foreground">
              {isEditing ? "点击下方按钮添加元素" : "暂无内容"}
            </p>
          </div>
        )}
      </div>

      {/* 解锁蒙层 */}
      {!isUnlocked && !isOwner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-6 p-8 max-w-md text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-full border border-primary/20">
                <Lock className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">解锁完整个人资料</h3>
              <p className="text-muted-foreground">
                支付 <span className="font-semibold text-primary">{profilePrice}</span> 元即可查看用户的完整作品集、联系方式等信息
              </p>
            </div>

            <Button
              onClick={handleUnlock}
              disabled={isProcessing}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  解锁个人资料 ¥{profilePrice}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              解锁后可永久查看该用户的完整资料
            </p>
          </div>
        </div>
      )}
    </div>
  )
}