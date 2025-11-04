"use client"

import type React from "react"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "@/lib/web3-config"
import { useState } from "react"
import { PostsProvider } from "@/lib/posts-context"
import { AuthProvider } from "@/lib/auth/auth-context"
import { LoginDialog } from "@/components/auth/login-dialog"

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
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PostsProvider>
            {children}
            <LoginDialog />
          </PostsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
