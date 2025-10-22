import { Navbar } from "@/components/layout/navbar"
import { PostCard } from "@/components/post/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPosts, getProductsByPostId } from "@/lib/supabase/api"
import { mapDbPostToPost } from "@/lib/types"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = await searchParams
  const query = q

  // 获取帖子数据
  const { data: dbPosts, error } = await getPosts({ limit: 20 })

  // 转换为前端格式
  const posts = dbPosts
    ? await Promise.all(
        dbPosts.map(async (dbPost: any) => {
          const { data: products } = await getProductsByPostId(dbPost.id)
          return mapDbPostToPost(dbPost, products || [])
        })
      )
    : []

  // TODO: 实现真正的搜索功能
  // 这里可以根据 query 过滤帖子标题、内容或标签

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">搜索结果</h1>
          {query && <p className="text-muted-foreground">关键词: {query}</p>}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="posts">内容</TabsTrigger>
            <TabsTrigger value="users">用户</TabsTrigger>
            <TabsTrigger value="tags">标签</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {posts.length > 0 ? (
              <div className="masonry-grid">
                {posts.map((post) => (
                  <div key={post.id} className="masonry-item">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">暂无搜索结果</p>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            {posts.length > 0 ? (
              <div className="masonry-grid">
                {posts.map((post) => (
                  <div key={post.id} className="masonry-item">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">暂无搜索结果</p>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <p className="text-center text-muted-foreground py-12">用户搜索功能开发中...</p>
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            <p className="text-center text-muted-foreground py-12">标签搜索功能开发中...</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
