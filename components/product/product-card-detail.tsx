"use client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"


interface ProductCardDetailProps {
  product: {
    title: string;
    description: string;
    price: number;
    id:string;
  }
}

export function ProductCardDetail({ product }: ProductCardDetailProps) {
  const router = useRouter()
  
  return (
    <div onClick={() => {
      router.push(`/product/${product.id}`)
    }} className="cursor-pointer">
    <Card>
      <CardHeader>
        <CardTitle>{product.title || '新建商品'}</CardTitle>
      </CardHeader> 
      <CardContent>
        <p>{product.description || '新建商品描述'}</p>
        <p>${product.price || '0'}</p>
      </CardContent>
    </Card>
    </div>
  )
}