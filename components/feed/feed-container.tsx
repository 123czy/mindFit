"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/post/post-card"
import { Button } from "@/components/ui/button"
import { FilterTabs } from "@/components/feed/filter-tabs"
import { PostCardSkeleton } from "@/components/feed/post-card-skeleton"
import { getPostsWithProducts } from "@/lib/supabase/api/posts"
import { mapDbPostToPost, type Post } from "@/lib/types"

export function FeedContainer() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      if (posts.length > 0) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const { data, error: supabaseError } = await getPostsWithProducts({
        limit: 20,
      })

      if (supabaseError) {
        throw supabaseError
      }

      const normalized = (data || []).map((dbPost: any) =>
        mapDbPostToPost(dbPost, dbPost.products || [])
      )
      setPosts(normalized)
    } catch (err) {
      console.error("Failed to load posts:", err)
      setError(
        err instanceof Error ? err.message : "加载失败，请稍后重试"
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchPosts()
  }, [])

  // 显示骨架屏：只有在没有数据且正在加载时才显示
  const showSkeleton = isLoading && posts.length === 0

  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FilterTabs />

      {showSkeleton ? (
        <div className="masonry-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <PostCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="masonry-grid">
            {posts.map((post) => (
              <div key={post.id} className="masonry-item">
                <PostCard post={post} />
              </div>
            ))}
          </div>

          {isRefreshing && posts.length > 0 && (
            <div className="flex items-center justify-center py-2">
              <div className="text-xs text-muted-foreground">正在更新...</div>
            </div>
          )}

          {posts.length === 0 && !isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">暂无内容</p>
            </div>
          )}

          {posts.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => void fetchPosts()}>
                刷新
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
