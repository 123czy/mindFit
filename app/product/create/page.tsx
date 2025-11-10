import { Navbar } from "@/components/layout/navbar"
import { CreateProductForm } from "@/components/product/create-product-form"

export default function ProductCreatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CreateProductForm />
      </div>
    </div>
  )
}
