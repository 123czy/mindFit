"use client"

import { BentoProfilePage } from "@/components/bento/bento-profile-page"
import { useCurrentUserInfo } from "@/lib/hooks/use-api-auth"
import { notFound } from "next/navigation"

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
//   const { data: currentUser, isLoading, error } = useCurrentUserInfo()
const currentUser = {
    id: "1",
    username: "test",
    avatar_url: "https://via.placeholder.com/150",
    created_at: "2021-01-01",
    display_name: "@test",
    email_verified: true,
    email: "test@test.com",
    bio: "test bio",
    last_login_at: "2021-01-01",
    locale: "en",
    role: "user",
    updated_at: "2021-01-01",
    likeCount: 10,
    commentCount: 20,
    downloadCount: 30,
}
const isLoading = false
const error = null


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
