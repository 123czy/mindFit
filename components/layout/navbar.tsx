"use client"

import Link from "next/link"
import { Search, Copy, LogOut, ChevronDown, Bell, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth/auth-context"
import { useLoginDialog } from "@/lib/auth/use-login-dialog"
import { useRequireAuth } from "@/lib/auth/use-require-auth"
import { useState } from "react"

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth()
  const { openDialog } = useLoginDialog()
  const { requireAuth } = useRequireAuth()
  const [searchType, setSearchType] = useState<"posts" | "users" | "tags">("posts")
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogin = () => {
    openDialog()
  }

  const handleLogout = async () => {
    await signOut()
    toast.success("已退出登录")
  }

  const handleNotifications = () => {
    requireAuth(
      () => {
        window.location.href = "/notifications"
      },
      "view_notifications"
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // 根据搜索类型跳转到不同的搜索页面
    const params = new URLSearchParams({ q: searchQuery })
    const path = searchType === "posts" 
      ? `/search?${params}`
      : searchType === "users"
      ? `/search/users?${params}`
      : `/search/tags?${params}`
    
    window.location.href = path
  }

  const searchTypeLabels = {
    posts: "帖子",
    users: "用户",
    tags: "商品",
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-effect shadow-apple">
      <div className="mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-apple transition-apple group-hover:shadow-apple-lg group-hover:scale-105 active-press">
              <span className="text-white font-bold text-base">炒</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">炒词</span>
          </Link>

          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative group">
              <div className="flex items-center rounded-xl bg-muted/40 border border-border/40 focus-within:bg-background focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                {/* 搜索图标 */}
                <Search className="absolute left-4 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none z-10" />
                
                {/* 搜索输入框 */}
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索炒词、达人、话题..."
                  className="flex-1 pl-11 pr-2 h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                />
                
                {/* 类型选择器 */}
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 h-11 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors border-l border-border/40 focus:outline-none"
                      >
                        <span>{searchTypeLabels[searchType]}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={() => setSearchType("posts")}
                      >
                        <span className={searchType === "posts" ? "font-bold" : ""}>帖子</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSearchType("users")}
                      >
                        <span className={searchType === "users" ? "font-bold" : ""}>用户</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSearchType("tags")}
                      >
                        <span className={searchType === "tags" ? "font-bold" : ""}>商品</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* 搜索按钮 */}
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotifications}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {/* 可以添加未读消息红点 */}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">{user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}`}>个人资料</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/publish">发布内容</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-11 font-medium shadow-apple hover:shadow-apple-lg transition-apple active-press"
              onClick={handleLogin}
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
