"use client"

import { PostCard } from "@/components/post/post-card"
import { Empty } from "@/components/ui/empty"
import { usePosts } from "@/lib/hooks/use-posts"
import { Loader2 } from "lucide-react"

interface PostsTabProps {
  userId: string
  isOwner: boolean
}

export function PostsTab({ userId, isOwner }: PostsTabProps) {
  const { posts, isLoading, error } = usePosts({ userId })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <Empty title="加载失败" description="请稍后重试" />
  }

  if (posts.length === 0) {
    return <Empty title="暂无内容" description={isOwner ? "发布你的第一篇内容吧" : "该用户还没有发布内容"} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
