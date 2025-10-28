"use client"

import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostImageCarousel } from "@/components/post/post-image-carousel"
import { PostContent } from "@/components/post/post-content"
import { PostAuthorCard } from "@/components/post/post-author-card"
import { PaidContentSection } from "@/components/post/paid-content-section"
import type { Product, Post, User } from "@/lib/types"

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  title: string
  body: string
  images: string[]
  tags: string[]
  products: Product[]
  currentUser?: {
    username: string
    avatar?: string
    bio?: string
  }
}

export function PreviewModal({ 
  open, 
  onClose, 
  title, 
  body, 
  images, 
  tags, 
  products,
  currentUser = { username: "您", avatar: "/placeholder-user.jpg", bio: "" }
}: PreviewModalProps) {
  // 构造预览用的Post对象
  const previewPost: Post = {
    id: "preview",
    userId: "preview-user",
    title: title || "未命名",
    body: body || "",
    images: images,
    hasPaidContent: products.length > 0,
    price: products.length > 0 ? products[0]?.price : undefined,
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    createdAt: new Date().toISOString(),
    author: {
      id: "preview-user",
      username: currentUser.username,
      avatar: currentUser.avatar || "/placeholder-user.jpg",
      bio: currentUser.bio,
      walletAddress: "",
      likeCount: 0,
      commentCount: 0,
      downloadCount: 0,
    },
    products: products,
    tags: tags,
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader>
        <DialogTitle className="text-2xl font-bold px-6 pt-4">内容预览</DialogTitle>
        </DialogHeader>
        {/* Content - Same layout as post detail page */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {images.length > 0 ? (
                <PostImageCarousel images={images} />
              ) : (
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">暂无图片</p>
                </div>
              )}
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6">
              <PostContent post={previewPost} />
              <PostAuthorCard author={previewPost.author} />
              {previewPost.hasPaidContent && previewPost.products && (
                <PaidContentSection products={previewPost.products} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
