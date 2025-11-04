"use client"
import { Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { ProductCardInPost } from "@/components/product/product-card-in-post"
import { ProductCardDetail } from "@/components/product/product-card-detail"
import type { Product } from "@/lib/types"

interface PaidContentSectionProps {
  products: Product[]
}

export function PaidContentSection({ products }: PaidContentSectionProps) {
  return (
    <Card className="gap-0">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4" />
          付费内容
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {products.map((product) => (
          <ProductCardDetail key={product.id} product={product} />
        ))}
      </CardContent>
    </Card>
  )
}
