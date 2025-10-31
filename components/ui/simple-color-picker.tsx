"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface SimpleColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  colors?: string[]
  className?: string
  size?: "sm" | "md" | "lg"
}

const defaultColors = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
  "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
  "#EC4899", "#F43F5E", "#000000", "#6B7280", "#FFFFFF",
]

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
}

export function SimpleColorPicker({
  value = "#3B82F6",
  onChange,
  colors = defaultColors,
  className,
  size = "md",
}: SimpleColorPickerProps) {
  const handleColorChange = (color: string) => {
    onChange?.(color)
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            sizeClasses[size],
            "rounded-md border-2 border-transparent hover:scale-110 transition-all relative flex items-center justify-center",
            value === color && "border-primary ring-2 ring-primary ring-offset-2",
            color === "#FFFFFF" && "border-gray-300"
          )}
          style={{ backgroundColor: color }}
          onClick={() => handleColorChange(color)}
          title={color}
        >
          {value === color && (
            <Check
              className={cn(
                size === "sm" && "h-3 w-3",
                size === "md" && "h-4 w-4",
                size === "lg" && "h-5 w-5"
              )}
              style={{
                color:
                  color === "#000000" || parseInt(color.slice(1), 16) < 0x888888
                    ? "white"
                    : "black",
              }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

