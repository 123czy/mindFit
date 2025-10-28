"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { copyToClipboard } from "@/lib/utils/copy-to-clipboard"
import { toast } from "sonner"

interface Variable {
  id: string
  type: string
  value: string
}

interface VariableFormProps {
  variables: Variable[]
  onChange: (variables: Variable[]) => void
  initialBody: string
}

export function VariableForm({ variables, onChange, initialBody }: VariableFormProps) {
  const [previewText, setPreviewText] = useState("")
  const [copied, setCopied] = useState(false)

  const updatePreview = (vars: Variable[]) => {
    let text = initialBody
    vars.forEach((v) => {
      const regex = new RegExp(`\\[${v.type}\\]`, "g")
      text = text.replace(regex, v.value || `[${v.type}]`)
    })
    setPreviewText(text)
  }

  useEffect(() => {
    updatePreview(variables)
  }, [variables, initialBody])

  const handleFieldChange = (index: number, newValue: string) => {
    const newVariables = [...variables]
    newVariables[index] = {
      ...newVariables[index],
      value: newValue,
    }
    onChange(newVariables)
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(previewText)
    if (success) {
      setCopied(true)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("复制失败")
    }
  }

  return (
    <div>
      {/* 标题 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">填写变量值</h3>
        <p className="text-sm text-muted-foreground">
          请为以下变量填写对应的值，填写完成后将自动替换提示词中的变量。
        </p>
      </div>

      {/* 变量输入区 */}
      <div className="space-y-3 mb-4">
        {variables.map((variable, index) => (
          <div key={variable.id} className="space-y-1">
            <Label className="text-sm text-muted-foreground">
              {variable.type}
            </Label>
            <Input
              value={variable.value}
              onChange={(e) => handleFieldChange(index, e.target.value)}
              placeholder={`请输入${variable.type}的值`}
              className="w-full"
            />
            {/* 显示验证错误 */}
            {variable.value.trim() === "" && (
              <p className="text-xs text-red-500 mt-1">
                此项为必填项
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 预览区域 */}
      {previewText && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">预览</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="cursor-pointer rounded-xl shadow-apple hover:shadow-apple-lg transition-apple active-press"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </>
              )}
            </Button>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm whitespace-pre-wrap text-blue-500">
              {previewText}
            </p>
          </div>
        </div>
      )}

      {/* 底部信息 */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>共{variables.length}个变量</span>
        </div>
    </div>
  )
}

