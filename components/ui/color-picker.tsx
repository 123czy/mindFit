"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  presetColors?: string[]
  showInput?: boolean
  className?: string
}

const defaultPresetColors = [
  // 第一行：基础色 + 主色调
  "#FFFFFF", "#E5E5E5", "#5B92E5", "#6BA3E8", "#5373C6", 
  "#EAC451", "#E9A659", "#E3825D", "#6B7280",
  // 第二行：辅助色
  "#000000", "#E5BDEC", "#CF92D8", "#B37FBD", "#7ED4D1", 
  "#6FB6A9", "#5F9C8E", "#D1C4E9", "#B39DDB",
]

export function ColorPicker({
  value = "#000000",
  onChange,
  presetColors = defaultPresetColors,
  showInput = true,
  className,
}: ColorPickerProps) {
  const [color, setColor] = React.useState(value)
  const [customColor, setCustomColor] = React.useState(value)

  React.useEffect(() => {
    setColor(value)
    setCustomColor(value)
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    setCustomColor(newColor)
    onChange?.(newColor)
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    
    // 验证是否是有效的颜色值
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      setColor(newColor)
      onChange?.(newColor)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="w-full flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform">
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: color }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {showInput && (
            <div className="space-y-2">
              <Label htmlFor="color-input" className="text-sm font-medium">
                颜色值
              </Label>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <Input
                  id="color-input"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  placeholder="#000000"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">预设颜色</Label>
            <div className="grid grid-cols-9 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={cn(
                    "h-6 w-6 cursor-pointer rounded-full hover:scale-110 transition-transform relative",
                    color === presetColor && "border-primary ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorChange(presetColor)}
                  title={presetColor}
                >
                  {color === presetColor && (
                    <Check 
                      className="absolute inset-0 m-auto h-4 w-4" 
                      style={{ 
                        color: presetColor === "#000000" || parseInt(presetColor.slice(1), 16) < 0x888888 
                          ? "white" 
                          : "black" 
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

