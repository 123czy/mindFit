import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { PostImageCarousel } from "@/components/post/post-image-carousel"
import { PostContent } from "@/components/post/post-content"
import { PostAuthorCard } from "@/components/post/post-author-card"
import { PaidContentSection } from "@/components/post/paid-content-section"
import { CommentSection } from "@/components/comment/comment-section"
import { getPostById, getProductsByPostId } from "@/lib/supabase/api"
import { mapDbPostToPost } from "@/lib/types"

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: dbPost, error } = await getPostById(id)

  if (error || !dbPost) {
    notFound()
  }

  // 获取关联的商品
  const { data: products } = await getProductsByPostId('159b9ed8-3c28-4dca-a229-8097b414cbeb')

  const post = mapDbPostToPost(dbPost as any, [...(products || [])])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 max-w-7xl mx-auto">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <PostImageCarousel images={post.images} />
            
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6">
            <PostContent post={post} />
            <PostAuthorCard author={post.author} />
            <PaidContentSection products={post.products || []} />
          </div>
        </div>

        {/* Comments Section - Full Width */}
        <div className="max-w-7xl mx-auto mt-8">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  )
}
