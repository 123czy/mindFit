"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const filters = ["全部", "名片收录", "文本生成", "图片生成", "视频生成", "工作流", "热点话题", "深度观点", "技巧讨论"]

export function FilterTabs() {
  const [activeFilter, setActiveFilter] = useState("全部")
  const [sortBy, setSortBy] = useState("热度")

  return (
    <div className="border-b border-border/40 glass-effect shadow-apple">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={
                activeFilter === filter
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 shadow-apple transition-apple active-press"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full px-4 transition-apple active-press"
              }
            >
              {filter}
            </Button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto rounded-full px-4 transition-apple hover:bg-accent/60 active-press"
              >
                {sortBy}
                <ChevronDown className="ml-1.5 h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-apple-lg border-border/40">
              <DropdownMenuItem onClick={() => setSortBy("热度")} className="rounded-lg transition-apple">
                热度
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("最新")} className="rounded-lg transition-apple">
                最新
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("推荐")} className="rounded-lg transition-apple">
                推荐
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
