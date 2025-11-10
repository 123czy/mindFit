"use client"
import { Lock } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProductCardDetail } from "@/components/product/product-card-detail"
import type { Product } from "@/lib/types"

interface PaidContentSectionProps {
  products: Product[]
}

export function PaidContentSection({ products }: PaidContentSectionProps) {
  return (
    <Card className="gap-0">
      <CardHeader>展示当前的商品</CardHeader>
      <CardContent className="space-y-0">
        {products.length > 0 && products.map((product) => (
          <ProductCardDetail key={product.id} product={product} />
        ))}
      </CardContent>
    </Card>
  )
}
