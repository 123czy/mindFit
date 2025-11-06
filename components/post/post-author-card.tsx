import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { User } from "@/lib/types"
import { Download, Heart, MessageCircle,UserRound } from "lucide-react"

interface PostAuthorCardProps {
  author: User
}

export function PostAuthorCard({ author }: PostAuthorCardProps) {
  return (
    <Card className="py-3">
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={author.avatar || "/placeholder.svg"} />
            <AvatarFallback>{author.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${author.username}?tab=card`} className="font-semibold hover:underline">
              {author.username}
            </Link>
            {author.bio && author.bio.length > 0 && <p className="text-sm text-muted-foreground line-clamp-2">{author.bio}</p>}
          </div>
          </div>
         
          <div className="flex items-center gap-2">
            <div className="flex items-center cursor-pointer bg-transparent font-medium">
              <Heart className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">{author.likeCount || 10}</span>
            </div>
            <div  className="flex items-center cursor-pointer bg-transparent font-medium">
              <UserRound className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">{author.commentCount || 10}</span>
            </div>
            <div  className="flex items-center cursor-pointer bg-transparent font-medium">
              <Download className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">{author.downloadCount || 10}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
