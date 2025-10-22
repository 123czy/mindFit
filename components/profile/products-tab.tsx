"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty } from "@/components/ui/empty"
import { useProducts } from "@/lib/hooks/use-products"
import { Loader2 } from "lucide-react"

interface ProductsTabProps {
  userId: string
  isOwner: boolean
}

export function ProductsTab({ userId, isOwner }: ProductsTabProps) {
  const { products, isLoading, error } = useProducts({ userId })

  return (
    <Tabs defaultValue="published">
      <TabsList>
        <TabsTrigger value="published">已发布</TabsTrigger>
        <TabsTrigger value="collected">已收藏</TabsTrigger>
      </TabsList>

      <TabsContent value="published" className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Empty title="加载失败" description="请稍后重试" />
        ) : products.length === 0 ? (
          <Empty title="暂无产品" description={isOwner ? "创建你的第一个产品吧" : "该用户还没有发布产品"} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{product.title}</h3>
                    <Badge variant={product.isFree ? "secondary" : "default"}>
                      {product.isFree ? "免费" : `¥${product.price}`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  {product.stockLimit && (
                    <p className="text-xs text-muted-foreground">
                      剩余 {product.stockRemaining} / {product.stockLimit}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="collected">
        <Empty title="暂无收藏" description="收藏的产品会显示在这里" />
      </TabsContent>
    </Tabs>
  )
}
