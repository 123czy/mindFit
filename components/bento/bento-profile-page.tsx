"use client"

import React, { useRef, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import type { BentoElement, BentoShape } from "@/lib/types/bento"
import { shapeConfig } from "@/lib/types/bento"
import { Navbar } from "@/components/layout/navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
// import { BentoGrid } from "./bento-grid"

// import { PackeryDemo } from "@/components/packery-demo"
import { MuuriDemo } from "@/components/muuri-demo"
import { BentoToolbar } from "./bento-toolbar"
import { Edit, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BentoProfilePageProps {
  user: User
  isOwner: boolean
}

// Mock 初始数据
const mockBentoElements: BentoElement[] = [
  {
    id: "11",
    type: "image",
    shape: "square-2x2",
    position: { x: 0, y: 0 },
    src: "./placeholder.svg",
    alt: "Profile image",
  },
  {
    id: "22",
    type: "link",
    shape: "rect-2x3",
    position: { x: 2, y: 0 },
    url: "https://github.com",
    title: "GitHub",
    icon: "🔗",
  },
  {
    id: "33",
    type: "text",
    shape: "square-1x1",
    position: { x: 0, y: 2 },
    content: "hi everyone",
    fontSize: "md",
  },
  {
    id: "44",
    type: "link",
    shape: "rect-2x3",
    position: { x: 1, y: 2 },
    url: "https://twitter.com",
    title: "Twitter",
    icon: "🐦",
  },
  {
    id: "55",
    type: "stack",
    shape: "square-2x2",
    position: { x: 2, y: 2 },
    title: "图库",
  },
  {
    id: "66",
    type: "folder",
    shape: "square-2x2",
    position: { x: 0, y: 4 },
    title: "名片夹",
    foldType: "card",
  },
  {
    id: "77",
    type: "folder",
    shape: "square-2x2",
    position: { x: 0, y: 6 },
    title: "帖子夹",
    foldType: "post",
  }
]

export function BentoProfilePage({ user, isOwner }: BentoProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [elements, setElements] = useState<BentoElement[]>(mockBentoElements)
  const [nameText, setNameText] = useState(user.username)
  const [bioLines, setBioLines] = useState<string[]>((user.bio || "i am what i am").split("\n"))

  const bioContainerRef = useRef<HTMLDivElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const bioRefs = useRef<Array<HTMLInputElement | null>>([])
  const bioTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [tags, setTags] = useState<{ doing: string; role: string; location: string; pronoun: string }>({
    doing: "",
    role: "",
    location: "",
    pronoun: "",
  })

  // 查找空闲位置的函数
  const findEmptyPosition = (shape: BentoShape, elements: BentoElement[]): { x: number; y: number } => {
    const config = shapeConfig[shape]
    const gridCols = isMobileView ? 2 : 4
    const maxRows = 20 // 最大搜索行数
    
    // 创建占用网格的映射
    const occupied = new Set<string>()
    elements.forEach((el) => {
      const elConfig = shapeConfig[el.shape]
      for (let row = el.position.y; row < el.position.y + elConfig.height; row++) {
        for (let col = el.position.x; col < el.position.x + elConfig.width; col++) {
          occupied.add(`${col},${row}`)
        }
      }
    })

    // 从上到下、从左到右查找空闲位置
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col <= gridCols - config.width; col++) {
        let canPlace = true
        
        // 检查当前位置是否可以放置
        for (let r = row; r < row + config.height; r++) {
          for (let c = col; c < col + config.width; c++) {
            if (occupied.has(`${c},${r}`)) {
              canPlace = false
              break
            }
          }
          if (!canPlace) break
        }
        
        if (canPlace) {
          return { x: col, y: row }
        }
      }
    }
    
    // 如果找不到空位，返回最下方的位置
    const maxY = Math.max(0, ...elements.map(el => el.position.y + shapeConfig[el.shape].height))
    return { x: 0, y: maxY }
  }

  const handleAddElement = (newElement: Omit<BentoElement, "id" | "position">) => {
    const position = findEmptyPosition(newElement.shape, elements)
    const element: BentoElement = {
      ...newElement,
      id: `element-${Date.now()}-${Math.random()}`, // 确保唯一性
      position,
    } as BentoElement

    setElements((prevElements) => [...prevElements, element])
  }

  const handleElementsChange = (newElements: BentoElement[]) => {
    setElements(newElements)
  }

  const handleToggleEdit = () => {
    if (!isOwner) return
    setIsEditing(!isEditing)
  }

  // 点击页面其他区域时，保存并退出当前字段编辑态
  useEffect(() => {
    if (!isEditing) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        bioContainerRef.current &&
        !bioContainerRef.current.contains(target)
      ) {
        setEditingName(false)
        setEditingBio(false)
        // 这里可以调用 API 保存 nameText 与 bioLines.join("\n")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isEditing, bioLines, nameText])

  // 当 editingName 变为 true 时，聚焦 name 输入框
  useEffect(() => {
    if (editingName) {
      requestAnimationFrame(() => {
        nameRef.current?.focus()
      })
    }
  }, [editingName])

  // 名称与 Bio 输入法 Enter 行为
  const handleBioKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      // 如果是最后一行，新增一行
      if (index === bioLines.length - 1) {
        const next = [...bioLines, ""]
        setBioLines(next)
        // 下一个 tick 聚焦新行
        requestAnimationFrame(() => {
          const ref = bioRefs.current[index + 1]
          ref?.focus()
        })
      } else {
        const ref = bioRefs.current[index + 1]
        ref?.focus()
      }
    }
  }

  // Textarea 内容变化 -> 同步为行数组
  const handleBioTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/\r\n?/g, "\n")
    setBioLines(value.split("\n"))
  }

  // Textarea 点击空白行下方 -> 新增一行并将光标移动到新行起始位置
  const handleBioTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!bioTextareaRef.current) return
    const ta = bioTextareaRef.current
    const style = window.getComputedStyle(ta)
    const paddingTop = parseFloat(style.paddingTop || "0")
    const lineHeight = parseFloat(style.lineHeight || "20")
    const rect = ta.getBoundingClientRect()
    const y = e.clientY - rect.top + ta.scrollTop - paddingTop
    const clickedLine = Math.floor(y / lineHeight) + 1
    const totalLines = bioLines.length
    if (clickedLine > totalLines) {
      setBioLines(prev => [...prev, ""]) 
      requestAnimationFrame(() => {
        if (!bioTextareaRef.current) return
        const end = bioTextareaRef.current.value.length
        bioTextareaRef.current.selectionStart = end
        bioTextareaRef.current.selectionEnd = end
        bioTextareaRef.current.focus()
      })
    }
  }

  const handleAddTag = () => {
    console.log("add tag")
  }

  // Textarea 自适应高度
  useEffect(() => {
    const ta = bioTextareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }, [bioLines, editingBio, isEditing])

  const combinedTags = Object.values(tags)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" / ")

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div
          className={cn(
            "mx-auto transition-all duration-300",
            isMobileView ? "max-w-[400px] border-1 shadow-xl border-border rounded-4xl" : "max-w-7xl"
          )}
        >
          {/* 主内容区：左右布局 */}
          <div
            className={cn(
              "grid gap-8",
              isMobileView ? "grid-cols-1" : "grid-cols-[300px_1fr]"
            )}
          >
            {/* 左侧：用户信息 */}
            <div className={cn("space-y-4", isMobileView && "flex flex-col p-6")}>
              <Avatar className={cn("h-48 w-48 ring-4 ring-white dark:ring-gray-800 shadow-xl", isMobileView && "h-24 w-24")}>
                <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                {/* Name */}
                {isEditing && editingName ? (
                  <Input
                    ref={nameRef}
                    value={nameText}
                    onChange={(e) => setNameText(e.target.value)}
                    className={cn("h-10 text-xl font-bold", isMobileView && "text-lg")}
                  />
                ) : (
                  <h1
                    className={cn("text-4xl font-bold", isMobileView && "text-3xl", isEditing && "cursor-text")}
                    onClick={() => isEditing && setEditingName(true)}
                  >
                    {nameText}
                  </h1>
                )}

                {/* Tags inline display */}
                {combinedTags && (
                  <div className="text-muted-foreground text-xl">{combinedTags}</div>
                )}

                {!tagDialogOpen && isOwner && isEditing && (
                  <div className="space-y-2 text-base cursor-pointer border-1 border-dashed rounded-4xl p-2 flex items-center justify-center text-blue-400  hover:border-blue-500 hover:text-blue-500" onClick={() => setTagDialogOpen(true)}><Edit className="mr-2 h-4 w-4" /> 修改/添加 Tag</div>
                )}

                {tagDialogOpen && (
                  <div className="rounded-3xl border border-border p-4 space-y-6 bg-card/50">
                    {/* 当前在做 */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">🦄 当前在做</Label>
                      <Input
                        value={tags.doing}
                        onChange={(e) => setTags({ ...tags, doing: e.target.value })}
                        placeholder="Founder CEO@Apple"
                        className="h-11 rounded-2xl bg-muted border-0 focus-visible:ring-1"
                      />
                    </div>

                    {/* 角色 */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">🧙 角色</Label>
                      <Input
                        value={tags.role}
                        onChange={(e) => setTags({ ...tags, role: e.target.value })}
                        placeholder="开发者"
                        className="h-11 rounded-2xl bg-muted border-0 focus-visible:ring-1"
                      />
                    </div>

                    {/* 地区 */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">📍 地区</Label>
                      <Input
                        value={tags.location}
                        onChange={(e) => setTags({ ...tags, location: e.target.value })}
                        placeholder="中国·上海"
                        className="h-11 rounded-2xl bg-muted border-0 focus-visible:ring-1"
                      />
                    </div>

                    {/* 性别代词 */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2"> MCN</Label>
                      <Input
                        value={tags.pronoun}
                        onChange={(e) => setTags({ ...tags, pronoun: e.target.value })}
                        placeholder="MCN"
                        className="h-11 rounded-2xl bg-muted border-0 focus-visible:ring-1"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-blue-500 hover:underline"
                        onClick={() => setTagDialogOpen(false)}
                      >完成</button>
                    </div>
                  </div>
                )}

                {/* <div className="space-y-2 text-muted-foreground text-lg"><span className="font-bold">211</span> 关注<span className="font-bold ml-2">100</span> 粉丝<span className="font-bold ml-2">300</span> 浏览量</div> */}
                
                {/* Bio - 可编辑（Textarea） */}
                <div className="relative group" ref={bioContainerRef}>
                  {isEditing ? (
                    <Textarea
                      ref={bioTextareaRef}
                      value={bioLines.join("\n")}
                      onChange={handleBioTextChange}
                      onClick={handleBioTextareaClick}
                      placeholder="介绍一下自己..."
                      className="w-full min-h-[64px] p-0 border-0 focus-visible:ring-0 text-lg text-muted-foreground resize-none bg-transparent"
                      rows={Math.max(2, bioLines.length)}
                    />
                  ) : (
                    <div 
                      className="relative cursor-text"
                      onClick={() => {
                        if (isEditing) {
                          setEditingBio(true)
                          requestAnimationFrame(() => {
                            bioTextareaRef.current?.focus()
                          })
                        }
                      }}
                    >
                      <div className="text-muted-foreground text-lg whitespace-pre-wrap">
                        {bioLines.join("\n")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：Bento 网格 */}
            <div >
              <MuuriDemo elements={elements} isMobileView={isMobileView} isEditing={isEditing} onElementsChange={handleElementsChange}/>
            </div>
          </div>
        </div>

        {/* 工具栏 (仅主态显示) */}
        {isOwner && (
          <BentoToolbar
            isEditing={isEditing}
            isMobileView={isMobileView}
            onAddElement={handleAddElement}
            onToggleView={() => setIsMobileView(!isMobileView)}
            onToggleEdit={handleToggleEdit}
          />
        )}

      </div>
    </div>
  )
}
