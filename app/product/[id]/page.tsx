import { Navbar } from "@/components/layout/navbar"
import { PromptbaseProductDetailDemo } from "@/components/product/promptbase-product-detail-demo"

export default function ProductDetailPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PromptbaseProductDetailDemo />
    </div>
  )
}

