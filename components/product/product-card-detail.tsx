"use client"

import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"


interface ProductCardDetailProps {
  product: Product
}

export function ProductCardDetail({ product }: ProductCardDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name || '新建商品'}</CardTitle>
      </CardHeader> 
      <CardContent>
        <p>{product.description || '新建商品描述'}</p>
      </CardContent>
    </Card>
  )
}