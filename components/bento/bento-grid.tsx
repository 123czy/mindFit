"use client"

import { useState } from "react"
import type { BentoElement, BentoShape } from "@/lib/types/bento"
import { BentoElementComponent } from "./bento-element"
import { cn } from "@/lib/utils"
import { shapeConfig } from "@/lib/types/bento"

interface BentoGridProps {
  elements: BentoElement[]
  isEditing: boolean
  isMobileView: boolean
  onElementsChange?: (elements: BentoElement[]) => void
}

export function BentoGrid({ elements, isEditing, isMobileView, onElementsChange }: BentoGridProps) {
  const [draggedElement, setDraggedElement] = useState<BentoElement | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (element: BentoElement) => {
    setDraggedElement(element)
  }

  const handleDragEnd = () => {
    setDraggedElement(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    
    if (!draggedElement || !onElementsChange) return

    const newElements = [...elements]
    const draggedIndex = newElements.findIndex((el) => el.id === draggedElement.id)
    
    if (draggedIndex === -1) return

    // 移除拖拽元素
    const [removed] = newElements.splice(draggedIndex, 1)
    // 插入到新位置
    newElements.splice(targetIndex, 0, removed)

    onElementsChange(newElements)
    setDragOverIndex(null)
    setDraggedElement(null)
  }

  const handleDelete = (id: string) => {
    if (!onElementsChange) return
    onElementsChange(elements.filter((el) => el.id !== id))
  }

  const handleShapeChange = (id: string, shape: BentoShape) => {
    if (!onElementsChange) return
    const newElements = elements.map((el) => 
      el.id === id ? { ...el, shape } : el
    )
    onElementsChange(newElements)
  }

  const handleAddLink = (id: string) => {
    // TODO: 实现添加链接功能
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
        className={cn(
          "grid gap-3 p-4 sm:p-6",
          isMobileView 
            ? "grid-cols-2 auto-rows-[120px]" 
            : "grid-cols-4 auto-rows-[140px]"
        )}
      >
        {elements.map((element, index) => (
          <div
            key={`${element.id}-${element.shape}`}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={cn(
              `relative w-[${shapeConfig[element.shape].width * 100}px] h-[${shapeConfig[element.shape].height * 100}px]`,
              dragOverIndex === index && "ring-2 ring-blue-500 rounded-2xl"
            )}
          >
            <BentoElementComponent
              key={`element-${element.id}-${element.shape}`}
              element={element}
              isEditing={isEditing}
              onDelete={() => handleDelete(element.id)}
              onShapeChange={(shape) => handleShapeChange(element.id, shape)}
              onAddLink={() => handleAddLink(element.id)}
              onDragStart={() => handleDragStart(element)}
              onDragEnd={handleDragEnd}
            />
          </div>
        ))}
        
        {/* 空状态 */}
        {elements.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-[400px] border-2 border-dashed rounded-2xl">
            <p className="text-muted-foreground">
              {isEditing ? "点击下方按钮添加元素" : "暂无内容"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

