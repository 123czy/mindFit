"use client"

import { PostCard } from "@/components/post/post-card"
import { Button } from "@/components/ui/button"
import { usePostsOptimized } from "@/lib/hooks/use-posts-optimized"
import { FilterTabs } from "@/components/feed/filter-tabs"
import { PostCardSkeleton } from "@/components/feed/post-card-skeleton"

export function FeedContainer() {
  const { posts, isLoading, isFetching, error } = usePostsOptimized({ limit: 20 })

  // 显示骨架屏：只有在没有数据且正在加载时才显示
  // 如果有 SSR 预填充的数据，即使正在重新获取也不显示骨架屏
  const showSkeleton = isLoading && posts.length === 0

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">加载失败，请稍后重试</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Masonry Grid */}
      <FilterTabs />
      
      {showSkeleton ? (
        // 首次加载：显示骨架屏
        <div className="masonry-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <PostCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        // 有缓存数据：立即显示，后台刷新
        <>
          <div className="masonry-grid">
            {posts.map((post) => (
              <div key={post.id} className="masonry-item">
                <PostCard post={post} />
              </div>
            ))}
          </div>

          {/* 后台刷新指示器 */}
          {isFetching && posts.length > 0 && (
            <div className="flex items-center justify-center py-2">
              <div className="text-xs text-muted-foreground">正在更新...</div>
            </div>
          )}

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
        </>
      )}
    </div>
  )
}
