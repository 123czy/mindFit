"use client"

import { useState } from "react"

const categories = ["全部", "我的关注", "文本生成", "图片生成", "视频生成", "工作流", "热点话题", "深度观点"]

export function FilterTabs() {
  const [activeCategory, setActiveCategory] = useState("全部")
  const [activeSort, setActiveSort] = useState("热度")

  
  return (
    <div className="bg-background/95 backdrop-blur-sm sticky top-16 z-40">
      <div className="mx-auto px-2">
        <div className="flex items-center gap-8 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category,index) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                cursor-pointer text-sm whitespace-nowrap transition-all duration-200 relative pb-0.5
                ${
                  activeCategory === category
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }
                ${index < 2 ? "font-bold text-base" : ""}
              `}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
          <div className="flex-1 flex justify-end items-center gap-1 text-sm text-muted-foreground">
            <span className={`cursor-pointer hover:text-foreground ${activeSort === "热度" ? "text-foreground font-semibold" : ""}`} onClick={() => setActiveSort("热度")}>热度</span>
            <span className="text-muted-foreground"> | </span>
            <span className={`cursor-pointer hover:text-foreground ${activeSort === "最新" ? "text-foreground font-semibold" : ""}`} onClick={() => setActiveSort("最新")}>最新</span>
          </div>
        </div>
      </div>
    </div>
  )
}
