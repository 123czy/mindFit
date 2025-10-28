"use client"

import type React from "react"

import { useRef } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

interface SortableItemProps {
  id: string
  image: string
  index: number
  onRemove: (index: number) => void
}

function SortableItem({ id, image, index, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
    >
      <div 
        {...attributes}
        {...listeners}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <Image 
          src={image || "/placeholder.svg"} 
          alt={`Upload ${index + 1}`} 
          fill 
          className="object-cover pointer-events-none" 
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove(index)
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才开始拖拽，避免与点击冲突
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // Mock upload - in real app, upload to blob storage
    const newImages = files.map((file) => URL.createObjectURL(file))
    onChange([...images, ...newImages].slice(0, 10))
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((_, i) => i.toString() === active.id)
      const newIndex = images.findIndex((_, i) => i.toString() === over.id)
      
      onChange(arrayMove(images, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

      {/* Upload Button */}
      {images.length < 10 && (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-dashed bg-transparent"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">点击上传图片（最多10张）</div>
          </div>
        </Button>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((_, index) => index.toString())}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <SortableItem
                  key={index}
                  id={index.toString()}
                  image={image}
                  index={index}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="text-xs text-muted-foreground">已上传 {images.length} / 10 张图片</p>
    </div>
  )
}
