'use client'
import Link from "next/link"
import { ChevronRight, Flame, Loader2, Rocket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSpotlightPosts } from "@/lib/hooks/use-spotlight-posts"
import type { SpotlightPost } from "@/lib/supabase/api/spotlight"


const aiTools = [
  { rank: 1, name: "Sora AI", category: "文本生成视频", isNew: true, icon: "🚀" },
  { rank: 2, name: "Gemini 2.0", category: "多模态AI助手", isNew: true, icon: "🚀" },
  { rank: 3, name: "Runway Gen-3", category: "视频生成", isNew: true, icon: "🚀" },
  { rank: 4, name: "Claude Opus", category: "AI编程助手", isNew: true, icon: "🚀" },
  { rank: 5, name: "Midjourney V6", category: "图像生成", isNew: true, icon: "🚀" },
]

const creators = [
  { rank: 1, name: "AI_Creator_Pro", category: "提示词专家" },
  { rank: 2, name: "PromptMaster", category: "工作流设计" },
  { rank: 3, name: "DigitalArtist", category: "AI艺术创作" },
]

export function SidebarRight() {
  const { data: spotlightPosts = [], isLoading, error } = useSpotlightPosts(6)
  const hotTopics = spotlightPosts.map((post: SpotlightPost, index: number) => ({
    rank: index + 1,
    title: post.title,
    highlight: post.badge === "hot",
  }))

  return (
    <div className="sticky top-20 space-y-4">
      <Card className="border-border/40 shadow-apple hover:shadow-apple-lg transition-apple">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              热门话题
            </CardTitle>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-apple"
              asChild
            >
              <Link href="/topics">
                更多
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            hotTopics.length > 0 ? (
              hotTopics.map((topic) => (  
            <Link
              key={topic.rank}
              href={`/topic/${topic.rank}`}
              className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-accent/60 transition-apple group active-press"
            >
              <Badge
                variant={topic.rank === 1 ? "default" : "secondary"}
                className={`h-5 w-5 flex items-center justify-center p-0 text-xs shrink-0 font-semibold shadow-sm ${
                  topic.rank === 1
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                    : topic.rank === 2
                      ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
                      : topic.rank === 3
                        ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white"
                        : "bg-muted text-muted-foreground"
                }`}
              >
                {topic.rank}
              </Badge>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug font-medium">
                {topic.title}
              </span>
            </Link>
            ))) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">暂无热门话题</p>
            </div>
          )
          ) }
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-apple hover:shadow-apple-lg transition-apple">
        <CardHeader >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              工具榜
            </CardTitle>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-apple"
              asChild
            >
              <Link href="/tools">
                更多
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3 bg-muted/40 p-1 rounded-xl">
              <TabsTrigger value="ai" className="text-xs rounded-lg transition-apple data-[state=active]:shadow-apple">
                AI榜
              </TabsTrigger>
              <TabsTrigger
                value="creator"
                className="text-xs rounded-lg transition-apple data-[state=active]:shadow-apple"
              >
                达人榜
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ai" className="space-y-1 mt-0">
              {aiTools.map((tool) => (
                <Link
                  key={tool.rank}
                  href={`/tool/${tool.name}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-accent/60 transition-apple group active-press"
                >
                  <Badge
                    variant={tool.rank === 1 ? "default" : "secondary"}
                    className={`h-5 w-5 flex items-center justify-center p-0 text-xs shrink-0 font-semibold shadow-sm ${
                      tool.rank === 1
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                        : tool.rank === 2
                          ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
                          : tool.rank === 3
                            ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tool.rank}
                  </Badge>
                  <span className="text-lg transition-transform group-hover:scale-110">{tool.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {tool.name}
                      </p>
                      {tool.isNew && (
                        <Badge className="h-4 px-1.5 text-[10px] bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white border-0 shadow-sm font-bold animate-pulse">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{tool.category}</p>
                  </div>
                </Link>
              ))}
            </TabsContent>
            <TabsContent value="creator" className="space-y-1 mt-0">
              {creators.map((creator) => (
                <Link
                  key={creator.rank}
                  href={`/profile/${creator.name}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-accent/60 transition-apple group active-press"
                >
                  <Badge
                    variant={creator.rank === 1 ? "default" : "secondary"}
                    className={`h-5 w-5 flex items-center justify-center p-0 text-xs shrink-0 font-semibold shadow-sm ${
                      creator.rank === 1
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                        : creator.rank === 2
                          ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
                          : creator.rank === 3
                            ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {creator.rank}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {creator.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{creator.category}</p>
                  </div>
                </Link>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
