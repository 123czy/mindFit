"use client"

import { PostCard } from "@/components/post/post-card"
import { Button } from "@/components/ui/button"
import { usePosts } from "@/lib/hooks/use-posts"
import { Loader2 } from "lucide-react"
import { FilterTabs } from "@/components/feed/filter-tabs"

export function FeedContainer() {
  const { posts, isLoading, error } = usePosts({ limit: 20 })

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">加载失败，请稍后重试</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Masonry Grid */}
      <FilterTabs />
      <div className="masonry-grid">
        {posts.map((post) => (
          <div key={post.id} className="masonry-item">
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">暂无内容</p>
        </div>
      )}

      {/* Load More - TODO: Implement pagination */}
      {posts.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" disabled>
            已加载全部
          </Button>
        </div>
      )}
    </div>
  )
}
