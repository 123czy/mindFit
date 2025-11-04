import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostCardSkeleton() {
  return (
    <Card className="py-2 gap-2 bg-background">
      {/* Image skeleton */}
      <div className="relative aspect-[3/2] overflow-hidden mx-2 rounded-lg bg-muted">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="px-4 space-y-2">
        {/* Title skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Author and stats skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-3.5">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </Card>
  )
}

