"use client"

import { Github, Instagram, Link2, Twitter, Youtube } from "lucide-react"
import type { PlatformSlug } from "@/lib/types/bento"
import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
}

const DouyinIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M13 2v6.5a4.5 4.5 0 0 0 4.5 4.5h1V17c0 3.866-3.134 7-7 7S4.5 20.866 4.5 17 7.634 10 11.5 10H13V6.5A5.5 5.5 0 0 0 8.5 1H13v1Z" />
  </svg>
)

const WechatIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10 3C5.582 3 2 6.134 2 10c0 1.614.606 3.1 1.618 4.315L3 18l3.058-1.358C7.091 16.884 8.51 17 10 17c4.418 0 8-3.134 8-7s-3.582-7-8-7Z" />
    <path d="M14 11c4.418 0 8 3.01 8 6.725 0 1.72-.76 3.287-2.01 4.486L21 23l-2.512-.902C17.486 22.676 15.801 23 14 23c-4.418 0-8-3.01-8-6.725S9.582 11 14 11Z" />
  </svg>
)

const XiaohongshuIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    aria-hidden="true"
  >
    <rect x={3} y={4} width={18} height={16} rx={3} stroke="currentColor" strokeWidth={2} />
    <path
      d="M7 9v6M5 12h4M13 9v6M11.5 9H14a2 2 0 1 1 0 4h-1"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <path
      d="M17 15.5V9h2"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
)

const WeiboIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16 3c2.761 0 5 2.239 5 5h-2a3 3 0 0 0-3-3V3Z" />
    <path d="M18 8.5c2.485 0 4.5 2.015 4.5 4.5h-2a2.5 2.5 0 0 0-2.5-2.5V8.5Z" />
    <path d="M14.5 7C18.09 7 21 9.358 21 12.273c0 3.959-4.834 7.177-10.793 7.177C5.607 19.45 2 16.86 2 13.9 2 10.728 5.807 8 10.207 8c1.36 0 2.641.23 3.713.63.37.138.58.546.454.91-.4 1.157-.19 2.46.736 3.386 1.255 1.255 3.293 1.255 4.548 0 .343-.343.937-.303 1.197.09.22.323.145.76-.097 1.016-1.422 1.492-3.552 2.439-5.844 2.439C8.74 17.471 4.5 15.473 4.5 12.9c0-2.225 3.105-3.9 6.707-3.9 1.08 0 2.112.147 2.992.414A.5.5 0 0 1 14.5 9v-2Z" />
  </svg>
)

const BilibiliIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <rect x={3} y={7} width={18} height={12} rx={3} />
    <path d="M7 3l3 3M17 3l-3 3" strokeLinecap="round" />
    <path d="M9 12v2M15 12v2" strokeLinecap="round" />
  </svg>
)

const ZhihuIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    aria-hidden="true"
  >
    <rect x={3} y={5} width={18} height={14} rx={2} />
    <path d="M8 9v6m-2-4h4M16 9v6M14.5 9H17a2 2 0 0 1 0 4h-1.5" strokeLinecap="round" />
  </svg>
)

type IconRenderer = (props: IconProps) => JSX.Element

const iconMap: Record<PlatformSlug, IconRenderer> = {
  douyin: DouyinIcon,
  wechat: WechatIcon,
  xiaohongshu: XiaohongshuIcon,
  weibo: WeiboIcon,
  bilibili: BilibiliIcon,
  zhihu: ZhihuIcon,
  github: (props) => <Github aria-hidden="true" {...props} />,
  twitter: (props) => <Twitter aria-hidden="true" {...props} />,
  instagram: (props) => <Instagram aria-hidden="true" {...props} />,
  youtube: (props) => <Youtube aria-hidden="true" {...props} />,
  link: (props) => <Link2 aria-hidden="true" {...props} />,
}

export function PlatformIcon({
  slug = "link",
  className,
}: {
  slug?: PlatformSlug | string
  className?: string
}) {
  const IconComponent = iconMap[slug as PlatformSlug] || iconMap.link
  return <IconComponent className={cn("h-5 w-5", className)} />
}
