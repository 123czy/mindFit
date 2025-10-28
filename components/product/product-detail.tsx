"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { VariableForm } from "../publish/variable-form"

interface Variable {
  id: string
  type: string
  value: string
}

export function ProductDetail() {
  // 示例变量数据
  const [variables, setVariables] = useState<Variable[]>([
    { id: "1", type: "商品名称", value: "" },
    { id: "2", type: "商品价格", value: "" },
    { id: "3", type: "商品描述", value: "" },
  ])

  // 示例初始body（包含变量的文本）
  const initialBody = "[商品名称]是一款价格[商品价格]的产品，[商品描述]"

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>商品详情</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 使用 VariableForm 组件 */}
          <VariableForm 
            variables={variables}
            onChange={setVariables}
            initialBody={initialBody}
          />
        </CardContent>
      </Card>
    </div>
  )
}