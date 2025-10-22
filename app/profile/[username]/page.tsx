import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { BusinessCardDisplay } from "@/components/business-card/business-card-display"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { getUserByUsername } from "@/lib/supabase/api"
import { ContractInteractionDemo } from '@/components/contract/contract-interaction-demo'
import { ProductPurchase } from '@/components/contract/product-purchase'
import { SBTBinding } from '@/components/contract/sbt-binding'

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { username } = await params
  const { tab = "posts" } = await searchParams
  
  const { data: user, error } = await getUserByUsername(username)

  if (error || !user) {
    notFound()
  }

  const isOwner = true // Mock - in real app, check if current user is owner

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-6">
          <ContractInteractionDemo />
          <ProductPurchase productId={1n} productName="Product 1" price="10.0" />
          <SBTBinding />
          <BusinessCardDisplay userId={user.id} isOwner={isOwner} />
          <ProfileTabs userId={user.id} isOwner={isOwner} activeTab={tab} />
        </div>
      </div>
    </div>
  )
}
