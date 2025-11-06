import { Navbar } from "@/components/layout/navbar"
import { SidebarLeft } from "@/components/layout/sidebar-left"
import { SidebarRight } from "@/components/layout/sidebar-right"
import { FeedContainer } from "@/components/feed/feed-container"
import { HeroSwiper } from "@/components/hero/hero-swiper"
import { QueryClient, dehydrate } from "@tanstack/react-query"
import { HydrationProvider } from "@/lib/react-query/hydration"
import { getSpotlightPostsSSR } from "@/lib/supabase/api/spotlight-server"
import { getPostsWithProductsSSR } from "@/lib/supabase/api/posts-server"

export default async function HomePage() {
  // 创建 QueryClient 用于 SSR 数据预填充
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2分钟缓存（用于 Spotlight）
      },
    },
  })

  // 并行获取所有首屏数据
  const [spotlightPosts, posts] = await Promise.all([
    getSpotlightPostsSSR(6),
    getPostsWithProductsSSR({ limit: 20 }),
  ])

  // 预填充 React Query 缓存
  // Spotlight 数据可以缓存（变化不频繁）
  queryClient.setQueryData(["spotlight-posts", 6], spotlightPosts)
  
  // Posts 数据预填充用于首屏快速显示，但客户端会立即重新获取最新数据
  // 由于 usePostsOptimized 设置了 staleTime: 0 和 refetchOnMount: true
  // 客户端组件挂载时会立即重新获取，确保每次刷新看到不同内容
  queryClient.setQueryData(
    ["posts", 20, undefined, ""],
    posts
  )

  return (
    <HydrationProvider dehydratedState={dehydrate(queryClient)}>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Main Content */}
        <div className="mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_320px] gap-6">
            {/* Left Sidebar */}
            <aside className="hidden lg:block">
              <SidebarLeft />
            </aside>

            {/* Main Feed */}
            <main className="space-y-10">
              {/* Hero Spotlight Section */}
              <HeroSwiper />
              
              {/* Trending Projects */}
              <div>
                <FeedContainer />
              </div>
            </main>

            {/* Right Sidebar */}
            <aside className="hidden xl:block">
              <SidebarRight />
            </aside>
          </div>
        </div>
      </div>
    </HydrationProvider>
  )
}
