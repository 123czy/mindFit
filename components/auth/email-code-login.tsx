"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import Link from "next/link"

export function EmailCodeLogin() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [agreed, setAgreed] = useState(false)

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error("请输入邮箱地址")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    setIsSendingCode(true)
    try {
      const response = await fetch("/api/auth/email/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        toast.success("验证码已发送到您的邮箱")
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(data.error || "发送验证码失败，请重试")
      }
    } catch (error) {
      console.error("Error sending code:", error)
      toast.error("发送验证码失败，请重试")
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleLogin = async () => {
    if (!email.trim() || !code.trim()) {
      toast.error("请输入邮箱和验证码")
      return
    }

    if (!agreed) {
      toast.error("请先同意用户协议")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        toast.success("登录成功")
        // 登录成功会通过AuthContext自动处理
        // 这里可以关闭弹窗，但实际由LoginDialog组件处理
      } else {
        toast.error(data.error || "验证码错误，请重试")
      }
    } catch (error) {
      console.error("Error verifying code:", error)
      toast.error("登录失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          placeholder="输入邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">验证码</Label>
        <div className="flex gap-2">
          <Input
            id="code"
            type="text"
            placeholder="输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={isLoading}
            maxLength={6}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSendCode}
            disabled={isSendingCode || countdown > 0}
            className="whitespace-nowrap"
          >
            {countdown > 0 ? `${countdown}秒` : isSendingCode ? "发送中..." : "获取验证码"}
          </Button>
        </div>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={handleLogin}
        disabled={isLoading || !email.trim() || !code.trim()}
      >
        {isLoading ? "登录中..." : "登录"}
      </Button>

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox
          id="agreement"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked === true)}
        />
        <label
          htmlFor="agreement"
          className="text-xs text-muted-foreground leading-tight cursor-pointer"
        >
          我已阅读并同意
          <Link href="/terms" className="text-primary hover:underline ml-1">
            《用户协议》
          </Link>
          <Link href="/privacy" className="text-primary hover:underline ml-1">
            《隐私政策》
          </Link>
          <Link href="/children-privacy" className="text-primary hover:underline ml-1">
            《儿童/青少年个人信息保护规则》
          </Link>
        </label>
      </div>

      <p className="text-xs text-center text-muted-foreground pt-2">
        新用户可直接登录
      </p>
    </div>
  )
}
