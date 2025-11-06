"use client"

import Link from "next/link"
import React, { useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { WechatQrLogin } from "./wechat-qr-login"
// import { GoogleLogin } from "./google-login"
// import { EmailCodeLogin } from "./email-code-login" // 暂时隐藏，保留代码

import GoogleLoginButton from "./google-login-button"
import { useLoginDialog } from "@/lib/auth/use-login-dialog"
import { useAuth } from "@/lib/auth/auth-context"

export function LoginDialog() {
  const { isOpen, closeDialog, executePendingActions } = useLoginDialog()
  const { isAuthenticated } = useAuth()

  // 当登录成功时，执行待执行的操作并关闭弹窗
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      executePendingActions()
      closeDialog()
    }
  }, [isAuthenticated, isOpen, executePendingActions, closeDialog])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden rounded-3xl shadow-2xl border-0" showCloseButton={true}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* 左侧：Logo和Slogan */}
          <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-primary/30 to-accent/30  dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <div className="flex flex-col items-center space-y-6 max-w-sm">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">炒</span>
              </div>
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                  欢迎来到炒词
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  连接你的创意，开启AI创作之旅
                </p>
              </div>
            </div>
          </div>

          {/* 右侧：登录方式 */}
          <div className="p-10 md:p-12 flex flex-col justify-center bg-white dark:bg-gray-900">
            <div className="space-y-6 max-w-sm mx-auto w-full">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">登录</h2>
              </div>
               {/* 微信扫码登录 */}
               <WechatQrLogin />
              

              {/* 分割线 */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-gray-900 px-3 text-muted-foreground">
                    或
                  </span>
                </div>
              </div>

              {/* Google登录 */}
              <GoogleLoginButton className="w-full" onSuccess={() => {}} />


              <p className="text-sm text-muted-foreground">隐私条款，登录即代表同意<Link href="/terms" className="text-primary hover:underline ml-1">《用户协议》</Link>和<Link href="/privacy" className="text-primary hover:underline ml-1">《隐私政策》</Link></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
