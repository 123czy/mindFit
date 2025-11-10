"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { LoginDialog } from "@/components/auth/login-dialog"
import { AnalyticsProvider } from "@/lib/analytics/analytics-provider"
import { PostsProvider } from "@/lib/posts-context"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 不设置全局的 staleTime 和 gcTime，让每个查询自己配置
            // 只设置通用的默认值
            refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
            retry: 1, // 失败时重试1次
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnalyticsProvider>
          <PostsProvider>
            {children}
            <LoginDialog />
          </PostsProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
