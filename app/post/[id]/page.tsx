import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { PostImageCarousel } from "@/components/post/post-image-carousel"
import { PostContent } from "@/components/post/post-content"
import { PostAuthorCard } from "@/components/post/post-author-card"
import { PostInteractionBar } from "@/components/post/post-interaction-bar"
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
  const { data: products } = await getProductsByPostId('e0d74a12-5942-4f29-89da-2f3c07a920a0')

  const post = mapDbPostToPost(dbPost as any, products || [])

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
            <PostInteractionBar post={post} />
            {post.hasPaidContent && post.products && <PaidContentSection products={post.products} />}
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
