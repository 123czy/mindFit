"use client"

import Link from "next/link"
import { Share2, Clock, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useEffect, useRef, useState } from "react"

interface PostContentProps {
  post: Post
}

export function PostContent({ post }: PostContentProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: zhCN,
  })

  const [expanded, setExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const bodyRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return

    const measure = () => {
      // 在折叠态下测量：scrollHeight 大于可见高度则说明超出
      const overflow = el.scrollHeight > el.clientHeight + 1
      setHasOverflow(overflow)
    }

    // 延迟一帧确保样式生效后测量
    const raf = requestAnimationFrame(measure)
    window.addEventListener("resize", measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", measure)
    }
  }, [post.body])

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-balance">{post.title}</h1>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {timeAgo}
        </div>
        <div>{post.viewCount} 浏览</div>
        <div>{post.likeCount} 点赞</div>
        <div>{post.commentCount} 评论</div>
      </div>

      {/* Body */}
      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
        <div className="relative">
          <p
            ref={bodyRef}
            className={
              expanded
                ? "text-pretty leading-relaxed"
                : "text-pretty leading-relaxed line-clamp-10"
            }
          >
            {post.body}
          </p>

          {!expanded && hasOverflow && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-r from-background/0 via-background/60 to-background" />
          )}
          {!expanded && hasOverflow && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="absolute bottom-0 right-0 translate-y-1/2 text-sm font-medium text-primary cursor-pointer bg-background px-1"
            >
              ...more
            </button>
          )}
        </div>

        {expanded && hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-2 cursor-pointer text-sm font-medium text-primary "
          >
            Show less
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="secondary" asChild>
            <Link href={`/search?q=${encodeURIComponent(tag)}`}>#{tag}</Link>
          </Badge>
        ))}
      </div>

      {/* Share Button */}
      <div className="flex justify-between  gap-2 items-center">
      <Button variant="outline" size="sm" className="cursor-pointer bg-transparent">
        <Heart className="mr-2 h-4 w-4" />
        点赞
      </Button>
      <Button variant="outline" size="sm" className="cursor-pointer bg-transparent">
        <Star className="mr-2 h-4 w-4" />
        收藏
      </Button>
      <Button variant="outline" size="sm" className="cursor-pointer flex-1 bg-transparent">
        <Share2 className="mr-2 h-4 w-4" />
        分享
      </Button>
      </div>
      
    </div>
  )
}
