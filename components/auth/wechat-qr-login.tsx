"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function WechatQrLogin() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 获取微信登录二维码
  const fetchQrCode = async () => {
    setIsLoading(true)
    try {
      // Mock: 实际应该调用后端API获取二维码
      const response = await fetch("/api/auth/wechat/qrcode", {
        method: "POST",
      })
      const data = await response.json()
      if (data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl)
        setIsScanning(true)
        startPolling(data.ticket || "mock-ticket")
      } else {
        toast.error("获取二维码失败，请重试")
      }
    } catch (error) {
      console.error("Error fetching QR code:", error)
      toast.error("获取二维码失败，请重试")
      // Mock: 生成一个占位二维码URL
      setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mock-wechat-login")
    } finally {
      setIsLoading(false)
    }
  }

  // 轮询检查扫码状态
  const startPolling = (ticket: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/wechat/status?ticket=${ticket}`)
        const data = await response.json()
        if (data.status === "scanned") {
          toast.info("扫码成功，请在手机上确认")
        } else if (data.status === "confirmed") {
          // 登录成功，会通过AuthContext自动处理
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          setIsScanning(false)
        } else if (data.status === "expired") {
          toast.error("二维码已过期，请刷新")
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          setIsScanning(false)
        }
      } catch (error) {
        console.error("Error polling status:", error)
      }
    }, 2000) // 每2秒轮询一次
  }

  useEffect(() => {
    fetchQrCode()
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full space-y-4">
      {isLoading ? (
        <div className="h-[220px] w-full mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-border/40">
          <span className="text-muted-foreground text-sm">加载中...</span>
        </div>
      ) : qrCodeUrl ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border/40">
              <img
                src={qrCodeUrl}
                alt="微信扫码登录"
                className="w-[200px] h-[200px] rounded-xl"
              />
            </div>
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
                <div className="text-white text-sm font-medium">等待扫码...</div>
              </div>
            )}
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              使用 <span className="text-green-600 dark:text-green-500">微信</span> 扫码登录
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchQrCode}
              className="text-xs text-muted-foreground hover:text-foreground h-7"
            >
              刷新二维码
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={fetchQrCode}
          disabled={isLoading}
          className="w-full h-12 rounded-xl font-medium"
        >
          {isLoading ? "加载中..." : "获取二维码"}
        </Button>
      )}
    </div>
  )
}
