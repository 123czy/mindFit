"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import type { Product } from "@/lib/types"
import Image from "next/image"
import { toast } from "sonner"
import { useListWork, generateWorkId } from "@/lib/contracts/hooks/use-marketplace-v2"
import { parseUnits } from "viem"
import { CreateProductForm } from "../product/create-product-form"
import { useAccount } from "wagmi"

interface ProductEditModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
  onSave: (product: Product) => void
}

export function ProductEditModal({ open, onClose, product, onSave }: ProductEditModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [image, setImage] = useState("")
  // const { address, isConnected } = useAccount()
  // const { listWork, isPending, isConfirming } = useListWork()

  useEffect(() => {
    if (product) {
      setTitle(product.title)
      setDescription(product.description)
      setContent("")
      setPrice(product.price.toString())
      setStock(product.stockRemaining.toString())
    } else {
      setTitle("")
      setDescription("")
      setContent("")
      setPrice("")
      setStock("")
      setImage("")
    }
  }, [product])



  const handleClose = () => {
    if (title || description || content || price || stock) {
      if (!confirm("确定要关闭吗？未保存的修改将会丢失。")) {
        return
      }
    }
    onClose()
  }

  const handleSave = () => {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] max-h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "修改商品" : "创建新商品"}</DialogTitle>
        </DialogHeader>

        <CreateProductForm open={open} onOpenChange={onClose} postId={product?.id} onSuccess={handleSave} />


        {/* Footer */}
        {/* <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={handleClose} disabled={isPending || isConfirming}>
            取消
          </Button>
          <Button 
            onClick={handleSave} 
          >
            保存{product ? "修改" : ""}
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  )
}
