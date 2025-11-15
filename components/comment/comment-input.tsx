"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/auth-context"
import { Image as ImageIcon } from "lucide-react"
import { useTrack } from "@/lib/analytics/use-track"
import { useLoginDialog } from "@/lib/hooks/useLoginDialog"

interface CommentInputProps {
  postId: string
  parentCommentId?: string
  onCancel?: () => void
}

export function CommentInput({ postId, parentCommentId, onCancel }: CommentInputProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focused, setFocused] = useState(false)
  const { ensureLogin } = useLoginDialog()
  const { user } = useAuth()
  const { track } = useTrack()

  const handleSubmit = async () => {
    if (!content.trim()) return

    ensureLogin(async () => {
      setIsSubmitting(true)
      track({
        event_name: "submit",
        ap_name: "post_comment_btn",
        refer: "post_detail",
        action_type: "comment_post",
        items: [
          {
            item_type: "post",
            item_value: postId,
            item_meta: {
              parent_comment_id: parentCommentId,
            },
          },
        ],
      })
      // Mock submission
      setTimeout(() => {
        setContent("")
        setIsSubmitting(false)
        onCancel?.()
      }, 500)
    }, { actionType: "comment", params: { postId, parentCommentId } })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
      <div className="mx-auto max-w-5xl">
        {/* 输入行 */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar_url || undefined} />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder={parentCommentId ? "Drop a reply..." : "Drop a comment, vibe the moment."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              className="h-11 min-h-11 max-h-48 resize-none rounded-full border border-border/60 bg-transparent px-4 py-2 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              rows={1}
              maxLength={500}
            />
          </div>
          {/* <div className="h-9 w-9 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
          </div> */}
        </div>

        {/* 操作区：聚焦或有内容时显示 */}
        {(focused || content.length > 0) && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{content.length} / 500</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFocused(false)
                  setContent("")
                  onCancel?.()
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
                {isSubmitting ? "Commenting..." : "Comment"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
