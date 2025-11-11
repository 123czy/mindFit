"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUploader } from "@/components/publish/image-uploader"
import { TagSelector } from "@/components/publish/tag-selector"
import { ProductManager } from "@/components/publish/product-manager"
import { PreviewModal } from "@/components/publish/preview-modal"
import { CoverSelector } from "@/components/publish/cover-selector"
import { VariableForm } from "@/components/publish/variable-form"
import { Eye, Save, Send } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { usePosts } from "@/lib/posts-context"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTextImage } from "@/lib/utils/text-to-image"
import { useTrack } from "@/lib/analytics/use-track"
import { CreateProductForm } from "@/components/product/create-product-form"
import { apiPost } from "@/lib/utils/api-client"

enum PublishType {
  picture = "picture",
  document = "document"
}

enum ProductType {
  product = "product",
  post = "post"
}

type Cover = "cover1" | "cover2" | "cover3" | "cover4"

const covers = [
  {
    id: "cover1",
    src: "https://otahonvekikpyxyjfhdz.supabase.co/storage/v1/object/sign/mindFit_web3/cover1_bg.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzg2NDY1My1lMDI0LTQxYzUtYTNhYi1hMjYwMGMzYjEyNGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtaW5kRml0X3dlYjMvY292ZXIxX2JnLnBuZyIsImlhdCI6MTc2MTQ2MjQ3OSwiZXhwIjoxNzkyOTk4NDc5fQ.rkx1B4bblSzROtqJfGpEDPdh1sFng3Zv982aX9toIII",
    title: "封面1"
  },
  {
    id: "cover2",
    src: "https://otahonvekikpyxyjfhdz.supabase.co/storage/v1/object/sign/mindFit_web3/cover2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzg2NDY1My1lMDI0LTQxYzUtYTNhYi1hMjYwMGMzYjEyNGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtaW5kRml0X3dlYjMvY292ZXIyLnBuZyIsImlhdCI6MTc2MTQ1NjA2OCwiZXhwIjoxNzkyOTkyMDY4fQ.tDtke2RgFQ-svbPmb3x-LHIKWpmz-6WQekAHiEhL6uM",
    title: "封面2"
  },
  {
    id: "cover3",
    src: "https://otahonvekikpyxyjfhdz.supabase.co/storage/v1/object/sign/mindFit_web3/cover3_bg.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzg2NDY1My1lMDI0LTQxYzUtYTNhYi1hMjYwMGMzYjEyNGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtaW5kRml0X3dlYjMvY292ZXIzX2JnLnBuZyIsImlhdCI6MTc2MTQ2MjQ5MywiZXhwIjoxNzkyOTk4NDkzfQ.1t_w6KJV-qnaLN4nX60ME5TuTu31-BLQjzttOv8_reU",
    title: "封面3"
  },
  {
    id: "cover4",
    src: "https://otahonvekikpyxyjfhdz.supabase.co/storage/v1/object/sign/mindFit_web3/cover4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzg2NDY1My1lMDI0LTQxYzUtYTNhYi1hMjYwMGMzYjEyNGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtaW5kRml0X3dlYjMvY292ZXI0LnBuZyIsImlhdCI6MTc2MTQ1NjExMywiZXhwIjoxNzkyOTkyMTEzfQ.66k6ZOmjc_ai58JiJ2Z0Stv1l4d9loa6JEd3EgDKoYs",
    title: "封面4"
  }
]

export function PublishEditor() {
  const router = useRouter()
  const { addPost } = usePosts()
  const { user, isAuthenticated } = useCurrentUser()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [paidPrice, setPaidPrice] = useState<number>(9.9)
  const [paidContent, setPaidContent] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [publishType, setPublishType] = useState<PublishType>(PublishType.picture)
  const [productType, setProductType] = useState<ProductType>(ProductType.post)
  const [cover, setCover] = useState<Cover>("cover1")
  const [documentPreviewImage, setDocumentPreviewImage] = useState<string>("")
  const [variables, setVariables] = useState<Array<{id: string, type: string, value: string}>>([])
  const { track } = useTrack()
  const draftIdRef = useRef<string>(
    typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`
  )
  const draftId = draftIdRef.current
  const handlePublish = async () => {
    if (!isAuthenticated || !user) {
      toast.error("请先登录")
      return
    }

    if (!title.trim()) {
      toast.error("请输入标题")
      return
    }
    if (!body.trim()) {
      toast.error("请输入正文")
      return
    }
    if (images.length === 0) {
      toast.error("请至少上传一张图片")
      return
    }


    track({
      event_name: "submit",
      ap_name: "publish_submit_btn",
      refer: "publish",
      action_type: "create_post",
      items: [
        {
          item_type: "post_draft",
          item_value: draftId,
          item_meta: {
            has_images: images.length > 0,
            has_products: selectedProducts.length > 0,
            tags_count: tags.length,
          },
        },
      ],
    })

    setIsPublishing(true)

    try {
      console.log("[Publishing] Creating post in Supabase:", { 
        title, 
        body, 
        images, 
        tags, 
        paidPrice 
      })

      const { data: newPost } = await apiPost<{ data: any }>(
        "/api/posts",
        {
          userId: user.id,
          walletAddress: user.wallet_address,
          title,
          content: body,
          images,
          tags,
          isPaid: false,
          price: paidPrice,
          paidContent: paidContent,
        }
      )

      // Also add to local context for immediate UI update
      addPost({
        userId: user.id,
        title,
        body,
        images,
        hasPaidContent,
        products: selectedProducts.length > 0 ? selectedProducts : undefined,
        tags,
        likeCount: 0,
        commentCount: 0,
        viewCount: 0,
      })

      track({
        event_name: "submit",
        ap_name: "publish_submit_btn",
        refer: "publish",
        action_type: "create_post_success",
        items: [
          {
            item_type: "post_draft",
            item_value: draftId,
            item_meta: {
              post_id: newPost?.id,
            },
          },
        ],
      })

      toast.success("发布成功！")
      console.log("[Publishing] Post created successfully:", newPost)

      

      router.push("/")
    } catch (error) {
      console.error("[Publishing] Error creating post:", error)
      toast.error("发布失败，请重试")
      track({
        event_name: "submit",
        ap_name: "publish_submit_btn",
        refer: "publish",
        action_type: "create_post_failed",
        items: [
          {
            item_type: "post_draft",
            item_value: draftId,
          },
        ],
        extra: { message: (error as Error)?.message },
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleBackClick = (e: React.MouseEvent) => {
    if (title || body || images.length > 0 || tags.length > 0) {
      if (!confirm("确定要离开吗？未保存的内容将会丢失。")) {
        e.preventDefault()
      }
    }
  }

  const handleCoverSelect = (cover: string) => {
    setCover(cover as Cover)
  }

  // 提取body中的变量
  useEffect(() => {
    const regex = /\[([^\]]+)\]/g
    const matches = Array.from(body.matchAll(regex))
    const extractedTypes = matches.map(match => match[1])
    
    // 保留已有变量的值，只更新新增的变量
    setVariables(prevVariables => {
      // 为每个类型创建一个队列，记录所有可能的变量值
      const typeToValuesMap = new Map<string, string[]>()
      
      // 从之前的状态构建一个队列
      prevVariables.forEach(v => {
        if (!typeToValuesMap.has(v.type)) {
          typeToValuesMap.set(v.type, [])
        }
        typeToValuesMap.get(v.type)!.push(v.value)
      })
      
      // 构建新的变量列表
      const newVariables: Array<{id: string, type: string, value: string}> = []
      
      extractedTypes.forEach((type, index) => {
        const id = `${type}-${Date.now()}-${index}`
        
        // 从队列中获取值
        const values = typeToValuesMap.get(type) || []
        const value = values.length > 0 ? values.shift()! : ''
        
        newVariables.push({
          id,
          type,
          value
        })
      })
      
      return newVariables
    })
  }, [body])

  // 当文档类型且内容变化时生成预览图片
  useEffect(() => {
    const generateDocumentPreview = async () => {
      if (publishType === PublishType.document && title && body) {
        try {
          // 获取当前选中的封面URL
          const selectedCover = covers.find(c => c.id === cover)
          if (selectedCover) {
            const previewImage = await createTextImage({
              title,
              body,
              coverImageUrl: selectedCover.src,
              type:cover
            })
            setDocumentPreviewImage(previewImage)
          }
        } catch (error) {
          console.error('生成预览图片失败:', error)
        }
      } else {
        setDocumentPreviewImage("")
      }
    }

    generateDocumentPreview()
  }, [title, body, cover, publishType])

  // 验证所有变量是否都已填写
  const allVariablesFilled = variables.length === 0 || variables.every(v => v.value.trim() !== '')
  
  const canPublish = title.trim() && body.trim() && images.length > 0 && allVariablesFilled

  return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-apple">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Select value={productType} onValueChange={(value) => setProductType(value as ProductType)}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="选择发布类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">帖子</SelectItem>
                <SelectItem value="product">商品</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="cursor-pointer rounded-xl shadow-apple hover:shadow-apple-lg transition-apple"
              >
                <Eye className="mr-2 h-4 w-4" />
                预览
              </Button>
              <Button
                variant="outline"
                onClick={() => {}}
                className="cursor-pointer rounded-xl shadow-apple hover:shadow-apple-lg transition-apple"
              >
                <Save className="mr-2 h-4 w-4" />
                存草稿
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!canPublish || isPublishing}
                className="cursor-pointer rounded-xl bg-primary hover:bg-primary/90 shadow-apple hover:shadow-apple-lg transition-apple active-press"
              >
                <Send className="mr-2 h-4 w-4" />
                {isPublishing ? "创建中..." : "创建"}
              </Button>
            </div>
          </div>
        </div>

        {productType === ProductType.post ? <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 space-y-2 rounded-2xl bg-card border border-border/40 p-6 shadow-apple">
            <Select value={publishType} onValueChange={(value) => setPublishType(value as PublishType)}>
               <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择发布类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="picture">图文</SelectItem>
                <SelectItem value="document">长文</SelectItem>
              </SelectContent>
            </Select>
              
              <Input
                placeholder="给你的作品起个标题吧"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                maxLength={50}
                className="mt-4 text-lg font-medium border border-border/40 px-2 focus-visible:ring-0 placeholder:text-muted-foreground/60"
              />
              <p className="text-xs text-muted-foreground text-right mt-2">{title.length} / 50</p>
              
              <div className="space-y-6">
            {/* Image Upload */}
            {publishType === PublishType.picture && <div className="">
              <ImageUploader images={images} onChange={setImages} />
            </div>}

            {/* Body */}
            <div className="">
              <Textarea
                placeholder="分享你的创作灵感、使用技巧..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                maxLength={1000}
                className="min-h-[200px] border border-border/40 px-2 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/60"
              />
              <p className="text-xs text-muted-foreground text-right mt-2">{body.length} / 1000</p>
              
            </div>

            {publishType === PublishType.document && <div className="">
              <h3 className="text-sm font-medium mb-4">选择封面效果</h3>
              <CoverSelector handleCoverSelect={handleCoverSelect} cover={cover}/>
            </div>}

            {/* Tags */}
             
              <h3 className="text-sm font-medium mb-4">话题标签</h3>
              <TagSelector tags={tags} onChange={setTags} />
             
           </div>
            {/* Paid Content */}
           
          </div>
            <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-apple">
              <div className="flex items-center gap-3 mb-4">
                <label htmlFor="paid-content" className="text-sm font-medium cursor-pointer select-none">
                  挂载提示词商品
                </label>
              </div>

              <ProductManager selectedProducts={selectedProducts} onChange={setSelectedProducts} />
            </div>
        </div>
      : <div className="container mx-auto px-4 py-8 max-w-4xl">
        
         <CreateProductForm />
      
      </div>}

      {/* Preview Modal */}
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        body={body}
        images={publishType === PublishType.document && documentPreviewImage ? [documentPreviewImage] : images}
        tags={tags}
        products={selectedProducts}
        currentUser={user ? {
          username: user.username || "您",
          avatar: user.avatar_url || undefined,
          bio: user.bio || undefined
        } : undefined}
      />
    </div>
  )
}
