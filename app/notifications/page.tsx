"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useAuth } from "@/lib/auth/auth-context"
import { useLoginDialog } from "@/lib/auth/use-login-dialog"

type NotificationType = "all" | "system" | "interaction"

interface BaseNotification {
  id: string
  type: "system" | "interaction"
  isRead: boolean
  createdAt: Date
}

interface SystemNotification extends BaseNotification {
  type: "system"
  eventType: "publish_success"
  title: string
  targetId: string
}

interface InteractionNotification extends BaseNotification {
  type: "interaction"
  eventType: "like_post" | "like_comment" | "comment_post" | "reply_comment" | "business_card"
  user: {
    id: string
    username: string
    avatar: string
  }
  targetId: string
  targetContent: string
}

type Notification = SystemNotification | InteractionNotification

// Mock数据
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "system",
    eventType: "publish_success",
    title: "AI写作助手Prompt合集",
    targetId: "post-1",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
  },
  {
    id: "2",
    type: "interaction",
    eventType: "like_post",
    user: {
      id: "user-1",
      username: "宝玉",
      avatar: "/placeholder-user.jpg",
    },
    targetId: "post-2",
    targetContent: "AI创作技巧分享",
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3小时前
  },
  {
    id: "3",
    type: "interaction",
    eventType: "business_card",
    user: {
      id: "user-2",
      username: "小互",
      avatar: "/placeholder-user.jpg",
    },
    targetId: "card-1",
    targetContent: "",
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
  },
  {
    id: "4",
    type: "interaction",
    eventType: "comment_post",
    user: {
      id: "user-3",
      username: "李继刚",
      avatar: "/placeholder-user.jpg",
    },
    targetId: "post-3",
    targetContent: "这个Prompt很实用!",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
  },
]

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { openDialog } = useLoginDialog()
  const [activeTab, setActiveTab] = useState<NotificationType>("all")
  const [notifications] = useState<Notification[]>(mockNotifications)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openDialog({
        type: "view_notifications",
        params: {},
        callback: () => {
          // 登录后不需要额外操作，页面会自动刷新
        },
      })
    }
  }, [isAuthenticated, isLoading, openDialog])

  // 排序：按时间从新到旧
  const sortedNotifications = [...notifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  // 过滤通知
  const filteredNotifications = sortedNotifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "system") return notification.type === "system"
    if (activeTab === "interaction") return notification.type === "interaction"
    return true
  })

  // 渲染系统消息
  const renderSystemNotification = (notification: SystemNotification) => {
    const messageMap = {
      publish_success: `你的作品【${notification.title}】发布成功`,
    }

    return (
      <Card
        key={notification.id}
        className={`relative cursor-pointer transition-all hover:shadow-md ${
          notification.isRead ? "bg-white" : "bg-green-50 dark:bg-green-950/20"
        }`}
      >
        {!notification.isRead && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500" />
        )}
        <CardContent className="p-4 pl-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-foreground">{messageMap[notification.eventType]}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: zhCN })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染用户消息
  const renderInteractionNotification = (notification: InteractionNotification) => {
    const messageTemplates = {
      like_post: `赞了你的帖子【${notification.targetContent}】`,
      like_comment: `赞了你的评论【${notification.targetContent}】`,
      comment_post: `评论了你的帖子【${notification.targetContent}】`,
      reply_comment: `回复了你的评论【${notification.targetContent}】`,
      business_card: `获取了你的名片`,
    }

    return (
      <Card
        key={notification.id}
        className={`relative cursor-pointer transition-all hover:shadow-md ${
          notification.isRead ? "bg-white" : "bg-green-50 dark:bg-green-950/20"
        }`}
      >
        {!notification.isRead && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500" />
        )}
        <CardContent className="p-4 pl-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Link href={`/profile/${notification.user.username}`}>
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage src={notification.user.avatar} />
                  <AvatarFallback>{notification.user.username[0]}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-start gap-2">
                <Link href={`/profile/${notification.user.username}`}>
                  <span className="font-medium text-sm hover:underline">
                    {notification.user.username}
                  </span>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {messageTemplates[notification.eventType]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: zhCN })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">消息通知</h1>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            全部已读
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as NotificationType)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">全部消息</TabsTrigger>
            <TabsTrigger value="system">系统通知</TabsTrigger>
            <TabsTrigger value="interaction">互动</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                if (notification.type === "system") {
                  return renderSystemNotification(notification as SystemNotification)
                } else {
                  return renderInteractionNotification(notification as InteractionNotification)
                }
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
