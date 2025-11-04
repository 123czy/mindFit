import { BentoProfilePage } from "@/components/bento/bento-profile-page"
import { getUserByUsername } from "@/lib/supabase/api"
import { notFound } from "next/navigation"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  
  const { data: user, error } = await getUserByUsername(username)

  if (error || !user) {
    notFound()
  }

  const isOwner = false // Mock - in real app, check if current user is owner

  return <BentoProfilePage user={user} isOwner={isOwner} />
}
