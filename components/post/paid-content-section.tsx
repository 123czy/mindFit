"use client"
import { Lock } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProductCardDetail } from "@/components/product/product-card-detail"
import type { Product } from "@/lib/types"

interface PaidContentSectionProps {
  products: Product[]
}

export function PaidContentSection({ products }: PaidContentSectionProps) {
  const mockProducts = [
    {
      id: "1",
      title: "商品1",
      description: "商品1描述",
      price: 100
    },
  ]
  return (
    <Card className="gap-0">
      <CardHeader>展示当前的商品</CardHeader>
      <CardContent className="space-y-0">
        {mockProducts.length > 0 && mockProducts.map((product) => (
          <ProductCardDetail key={product.id} product={product} />
        ))}
      </CardContent>
    </Card>
  )
}
