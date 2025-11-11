'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart, Sparkles } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSpotlightPosts } from '@/lib/hooks/use-spotlight-posts'
import type { SpotlightPost } from '@/lib/types/spotlight'

interface Project {
  id: string
  title: string
  description: string
  image: string
  author: {
    name: string
    avatar: string
  }
  stats: {
    views: number
    likes: number
  }
  tags: string[]
  badge: string | null
  detailUrl: string
}

const badgeColors: Record<string, string> = {
  "热门": "bg-orange-500/90",
  "精选": "bg-purple-500/90",
  "新作": "bg-green-500/90",
  "推荐": "bg-blue-500/90"
}

export function HeroSwiper() {
  const { data: spotlightPosts = [], isLoading, error } = useSpotlightPosts(6)
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  // 转换数据格式
  const projects: Project[] = spotlightPosts.map((post: SpotlightPost) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    image: post.image,
    author: post.author,
    stats: post.stats,
    tags: post.tags,
    badge: post.badge,
    detailUrl: post.detailUrl,
  }))

  // 设置默认激活的项目
  useEffect(() => {
    if (projects.length > 0 && !activeProject) {
      setActiveProject(projects[0])
    }
  }, [projects, activeProject])

  // 加载状态
  if (isLoading) {
    return (
      <div className="w-full">
        <Card className="overflow-hidden rounded-xl md:rounded-2xl border-0 bg-card shadow-lg p-2">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        </Card>
      </div>
    )
  }

  // 错误状态
  if (error || projects.length === 0) {
    return (
      <div className="w-full">
        <Card className="overflow-hidden rounded-xl md:rounded-2xl border-0 bg-card shadow-lg p-2">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-muted-foreground">暂无精选内容</div>
          </div>
        </Card>
      </div>
    )
  }

  if (!activeProject) {
    return null
  }

  return (
    <div className="w-full">

      {/* Single Card Container */}
      <Card className="overflow-hidden rounded-xl md:rounded-2xl border-0 bg-card shadow-lg p-2">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] 2xl:grid-cols-[1fr_400px]">
          {/* Left Side - Featured Display */}
          <Link 
            href={activeProject.detailUrl}
            className="relative h-[260px] lg:h-[400px] group cursor-pointer overflow-hidden"
          >
            {/* Main Image with smooth transition */}
            <div className="relative h-full w-full">
              <Image
                key={activeProject.id}
                src={activeProject.image}
                alt={activeProject.title}
                fill
                className="object-cover rounded-xl md:rounded-2xl"
                priority
              />
              <div className="absolute inset-0 to-transparent transition-opacity rounded-xl md:rounded-2xl" />
            </div>

            {/* Content Overlay with fade animation */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10">
              {/* Title & Description */}
              <h3 
                key={`title-${activeProject.id}`}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 drop-shadow-2xl leading-tight animate-in fade-in duration-500"
              >
                {activeProject.title}
              </h3>
              <p 
                key={`desc-${activeProject.id}`}
                className="text-white/95 text-sm md:text-base mb-4 md:mb-5 line-clamp-2 drop-shadow-lg max-w-2xl animate-in fade-in duration-500 delay-100"
              >
                {activeProject.description}
              </p>

              {/* Author & Stats */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <Image
                      src={activeProject.author.avatar}
                      alt={activeProject.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-base md:text-lg drop-shadow-md">
                      {activeProject.author.name}
                    </span>
                    {/* Tags */}
                    <div className="flex gap-2 text-xs text-white/80">
                      {activeProject.tags.map((tag, index) => (
                        <span key={index}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-white/95 text-sm md:text-base font-medium">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{activeProject.stats.views}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{activeProject.stats.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Right Side - Project List with Scroll (shows 3.5 items) */}
          <div className="border-t lg:border-t-0 ">
            <ScrollArea className="h-[260px] lg:h-[400px]">
              <div className="px-3 space-y-2.5">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={project.detailUrl}
                    onMouseEnter={() => setActiveProject(project)}
                    className={`block group transition-all duration-200 ${
                      activeProject.id === project.id
                        ? 'ring-2 ring-purple-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="relative h-[100px] lg:h-[120px] rounded-lg overflow-hidden bg-card">
                      {/* Project Image */}
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
                      
                      {/* Badge */}
                      {project.badge && (
                        <div className="absolute top-2 right-2">
                          <Badge className={`${badgeColors[project.badge] || badgeColors["推荐"]} text-white border-0 text-[10px] px-2 py-0.5 shadow-lg`}>
                            {project.badge}
                          </Badge>
                        </div>
                      )}

                      {/* Project Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3">
                        <h4 className="font-bold text-xs md:text-sm text-white mb-1 line-clamp-2 drop-shadow-md group-hover:text-purple-300 transition-colors">
                          {project.title}
                        </h4>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] md:text-xs text-white/90 font-medium truncate max-w-[120px]">
                            @{project.author.name}
                          </p>
                          
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/90 font-medium">
                            <div className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3" />
                              <span>{project.stats.views}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Heart className="w-3 h-3" />
                              <span>{project.stats.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Active Indicator - Left bar */}
                      {activeProject.id === project.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-lg shadow-purple-500/50" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  )
}

