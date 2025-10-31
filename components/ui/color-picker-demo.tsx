"use client"

import { useState } from "react"
import { ColorPicker } from "./color-picker"
import { SimpleColorPicker } from "./simple-color-picker"
import { Label } from "./label"

export function ColorPickerDemo() {
  const [backgroundColor, setBackgroundColor] = useState("#3B82F6")
  const [textColor, setTextColor] = useState("#FFFFFF")
  const [borderColor, setBorderColor] = useState("#1E40AF")
  const [simpleColor, setSimpleColor] = useState("#3B82F6")

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">颜色选择器示例</h2>
        <p className="text-muted-foreground">
          基于 shadcn-ui 的颜色选择器组件
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 左侧：颜色选择器控制 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>背景颜色</Label>
            <ColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
          </div>

          <div className="space-y-2">
            <Label>文字颜色</Label>
            <ColorPicker
              value={textColor}
              onChange={setTextColor}
            />
          </div>

          <div className="space-y-2">
            <Label>边框颜色</Label>
            <ColorPicker
              value={borderColor}
              onChange={setBorderColor}
            />
          </div>

          {/* 颜色值显示 */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold">当前颜色值</h3>
            <div className="space-y-1 text-sm font-mono">
              <div>背景: {backgroundColor}</div>
              <div>文字: {textColor}</div>
              <div>边框: {borderColor}</div>
            </div>
          </div>
        </div>

        {/* 右侧：预览 */}
        <div className="space-y-4">
          <h3 className="font-semibold">预览效果</h3>
          <div
            className="p-8 rounded-lg transition-all duration-300"
            style={{
              backgroundColor,
              color: textColor,
              border: `4px solid ${borderColor}`,
            }}
          >
            <h4 className="text-xl font-bold mb-2">示例标题</h4>
            <p className="mb-4">
              这是一段示例文字，用于展示颜色选择器的效果。
              你可以在左侧选择不同的颜色来查看实时预览。
            </p>
            <div className="flex gap-2">
              <div
                className="px-4 py-2 rounded"
                style={{
                  backgroundColor: textColor,
                  color: backgroundColor,
                }}
              >
                按钮示例
              </div>
            </div>
          </div>

          {/* 色块网格预览 */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className="h-20 rounded flex items-center justify-center text-sm font-medium"
              style={{ backgroundColor }}
            >
              背景
            </div>
            <div
              className="h-20 rounded flex items-center justify-center text-sm font-medium"
              style={{ backgroundColor: textColor }}
            >
              文字
            </div>
            <div
              className="h-20 rounded flex items-center justify-center text-sm font-medium"
              style={{ backgroundColor: borderColor }}
            >
              边框
            </div>
          </div>
        </div>
      </div>

      {/* 简单颜色选择器 */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold">简单颜色选择器</h3>
        <p className="text-sm text-muted-foreground">
          适用于快速选择颜色的场景，无需打开弹窗
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>小尺寸 (sm)</Label>
            <SimpleColorPicker
              value={simpleColor}
              onChange={setSimpleColor}
              size="sm"
            />
          </div>

          <div className="space-y-2">
            <Label>中尺寸 (md) - 默认</Label>
            <SimpleColorPicker
              value={simpleColor}
              onChange={setSimpleColor}
              size="md"
            />
          </div>

          <div className="space-y-2">
            <Label>大尺寸 (lg)</Label>
            <SimpleColorPicker
              value={simpleColor}
              onChange={setSimpleColor}
              size="lg"
            />
          </div>

          <div className="space-y-2">
            <Label>自定义颜色集</Label>
            <SimpleColorPicker
              value={simpleColor}
              onChange={setSimpleColor}
              colors={[
                "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
                "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
              ]}
            />
          </div>

          <div 
            className="p-4 rounded-lg text-center font-medium"
            style={{ backgroundColor: simpleColor, color: "#fff" }}
          >
            当前选择: {simpleColor}
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold">使用方法</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">完整颜色选择器</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`import { ColorPicker } from "@/components/ui/color-picker"

function MyComponent() {
  const [color, setColor] = useState("#3B82F6")

  return (
    <ColorPicker 
      value={color}
      onChange={setColor}
    />
  )
}`}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">简单颜色选择器</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`import { SimpleColorPicker } from "@/components/ui/simple-color-picker"

function MyComponent() {
  const [color, setColor] = useState("#3B82F6")

  return (
    <SimpleColorPicker 
      value={color}
      onChange={setColor}
      size="md"
    />
  )
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">ColorPicker Props</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
              <li><code>value</code>: 当前颜色值（HEX格式）</li>
              <li><code>onChange</code>: 颜色改变时的回调函数</li>
              <li><code>presetColors</code>: 自定义预设颜色数组（可选）</li>
              <li><code>showInput</code>: 是否显示输入框（默认true）</li>
              <li><code>className</code>: 自定义样式类名</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">SimpleColorPicker Props</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
              <li><code>value</code>: 当前颜色值（HEX格式）</li>
              <li><code>onChange</code>: 颜色改变时的回调函数</li>
              <li><code>colors</code>: 自定义颜色数组（可选）</li>
              <li><code>size</code>: 尺寸大小 "sm" | "md" | "lg"（默认md）</li>
              <li><code>className</code>: 自定义样式类名</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

