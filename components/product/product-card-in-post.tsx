"use client"

import { useState } from "react"
import { Lock, Unlock, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/mock-data"

interface ProductCardInPostProps {
  product: Product
}

export function ProductCardInPost({ product }: ProductCardInPostProps) {
  const [isAcquired, setIsAcquired] = useState(false)

  const handleAcquire = () => {
    // Mock acquisition
    setIsAcquired(true)
  }

  return (
    <Card className={isAcquired ? "border-green-500" : ""}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <h4 className="font-semibold text-sm">{product.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
          </div>
          {isAcquired ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Unlock className="mr-1 h-3 w-3" />
              已获取
            </Badge>
          ) : (
            <Badge variant="outline">
              <Lock className="mr-1 h-3 w-3" />
              未获取
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-bold">
              {product.isFree ? <span className="text-green-600">免费</span> : <span>¥{product.price}</span>}
            </div>
            {product.stockLimit && <p className="text-xs text-muted-foreground">剩余 {product.stockRemaining} 份</p>}
          </div>

          {isAcquired ? (
            <Button size="sm" variant="outline">
              查看内容
            </Button>
          ) : (
            <Button size="sm" onClick={handleAcquire}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.isFree ? "获取" : "购买"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
