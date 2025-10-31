"use client"

import { useEffect, useRef } from "react"
import type { BentoElement, BentoShape } from "@/lib/types/bento"
import { shapeConfig } from "@/lib/types/bento"
import { BentoElementComponent } from "./bento/bento-element"
import { cn } from "@/lib/utils"

interface MuuriDemoProps {
  elements: BentoElement[]
  isEditing: boolean
  isMobileView: boolean
  onElementsChange?: (elements: BentoElement[]) => void
}

const BASE = 100
const GUTTER = 10

export function MuuriDemo({ 
  elements, 
  isEditing, 
  isMobileView, 
  onElementsChange 
}: MuuriDemoProps) {
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
          dragContainer: document.body,
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
    if (muuriRef.current) {
      muuriRef.current.refreshItems()
      muuriRef.current.layout()
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

  const handleAddLink = (id: string) => {
    console.log('Add link to element:', id)
  }

  return (
    <div
      className={cn(
        "mx-auto transition-all duration-300 min-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent",
        isMobileView ? "w-full max-w-[375px]" : "w-full max-w-4xl"
      )}
    >
      <div 
        ref={gridRef} 
        className={cn(
          "muuri-grid relative p-4 sm:p-6"
        )}
      >
        {elements.map((element) => {
          const conf = shapeConfig[element.shape]
          const width = conf.width * BASE + (conf.width - 1) * GUTTER
          const height = conf.height * BASE + (conf.height - 1) * GUTTER
          
          return (
            <div
              key={element.id}
              data-id={element.id}
              className="muuri-item m-2"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                position: "absolute",
                touchAction: "none",
              }}
            >
              <BentoElementComponent 
                element={element} 
                isEditing={isEditing} 
                onDelete={() => handleDelete(element.id)}
                onShapeChange={(shape) => handleShapeChange(element.id, shape)}
                onAddLink={() => handleAddLink(element.id)}
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
    </div>
  )
}