"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-effect shadow-apple">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-apple transition-apple group-hover:shadow-apple-lg group-hover:scale-105 active-press">
              <span className="text-white font-bold text-base">炒</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">炒词</span>
          </Link>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="search"
                placeholder="搜索炒词、达人、话题..."
                className="w-full pl-11 pr-4 h-11 bg-muted/40 border-border/40 rounded-xl focus:bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-11 font-medium shadow-apple hover:shadow-apple-lg transition-apple active-press"
            asChild
          >
            <Link href="/login">登录解锁更多名片</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
