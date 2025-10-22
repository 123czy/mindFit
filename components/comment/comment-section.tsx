import { CommentList } from "@/components/comment/comment-list"
import { CommentInput } from "@/components/comment/comment-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  // TODO: 从 Supabase 获取评论数据
  const comments: any[] = []

  return (
    <Card>
      <CardHeader>
        <CardTitle>评论 ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CommentInput postId={postId} />
        <CommentList comments={comments} />
      </CardContent>
    </Card>
  )
}
