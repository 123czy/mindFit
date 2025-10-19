"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bell, Wallet, PenSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const navItems = [
  { href: "/", label: "发现", icon: Home },
  { href: "/publish", label: "发布", icon: PenSquare },
  { href: "/notifications", label: "通知", icon: Bell, badge: 3 },
  { href: "/profile/AI_Creator_Pro?tab=wallet", label: "资产", icon: Wallet },
]

export function SidebarLeft() {
  const pathname = usePathname()
  const isLoggedIn = false

  return (
    <div className="sticky top-20 space-y-4">
      {!isLoggedIn && (
        <Card className="border-border/40 shadow-apple hover:shadow-apple-lg transition-apple overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <p className="text-sm text-center text-muted-foreground leading-relaxed font-medium">
              用可信价值链接
              <br />
              全球AIGC达人
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 font-medium shadow-apple hover:shadow-apple-lg transition-apple active-press"
              asChild
            >
              <Link href="/login">登录</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-apple relative group",
                isActive
                  ? "bg-accent text-foreground shadow-apple"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground active-press",
              )}
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              {item.label}
              {item.badge && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-apple animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
