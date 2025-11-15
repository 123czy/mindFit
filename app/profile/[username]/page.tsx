"use client"

import { BentoProfilePage } from "@/components/bento/bento-profile-page"
import { useCurrentUserInfo } from "@/lib/hooks/use-api-auth"
import { notFound } from "next/navigation"

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { data: currentUser, isLoading, error } = useCurrentUserInfo()

  // 加载中显示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 错误处理
  if (error || !currentUser) {
    notFound()
  }

  const isOwner = true // Mock - in real app, check if current user is owner

  return <BentoProfilePage user={currentUser} isOwner={isOwner} />
}
