import { CommentItem } from "@/components/comment/comment-item"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import type { Comment } from "@/lib/types"

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <Empty >
      <EmptyTitle>暂无评论</EmptyTitle>
      <EmptyDescription>成为第一个评论的人吧</EmptyDescription>
    </Empty>
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
