"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { useAuth } from "@/lib/auth/auth-context"
import {
  ANALYTICS_BATCH_SIZE,
  ANALYTICS_DEBUG,
  ANALYTICS_ENDPOINT,
  ANALYTICS_FLUSH_INTERVAL,
} from "./constants"
import type {
  AnalyticsEventInput,
  AnalyticsEventPayload,
  AnalyticsRefer,
} from "./types"
import {
  ensureDeviceId,
  getAppVersion,
  loadPersistedQueue,
  mapPathnameToRefer,
  persistQueue,
} from "./utils"

interface AnalyticsContextValue {
  track: (event: AnalyticsEventInput) => void
  flush: () => Promise<void>
  currentRefer: AnalyticsRefer
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [deviceId] = useState(() => ensureDeviceId())

  const version = useMemo(() => getAppVersion(), [])
  const platform = "web"
  const userId = user?.id ?? "0"
  const currentRefer = useMemo(
    () => mapPathnameToRefer(pathname || "/"),
    [pathname]
  )
  const searchKey = searchParams?.toString() ?? ""

  const queueRef = useRef<AnalyticsEventPayload[]>([])
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const flushingRef = useRef(false)

  // hydrate queue from localStorage once
  useEffect(() => {
    const events = loadPersistedQueue()
    if (events.length > 0) {
      queueRef.current = events
    }
  }, [])

  const sendEvents = useCallback(async (events: AnalyticsEventPayload[]) => {
    if (ANALYTICS_DEBUG) {
      // eslint-disable-next-line no-console
      console.info("[Analytics][debug]", events)
      return
    }

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events })], {
        type: "application/json",
      })
      const ok = navigator.sendBeacon(ANALYTICS_ENDPOINT, blob)
      if (ok) return
    }

    await fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
      keepalive: true,
    })
  }, [])

  const flush = useCallback(async () => {
    if (flushingRef.current) return
    if (queueRef.current.length === 0) {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current)
        flushTimeoutRef.current = null
      }
      return
    }

    flushingRef.current = true
    const events = queueRef.current.splice(0)
    persistQueue(queueRef.current)

    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current)
      flushTimeoutRef.current = null
    }

    try {
      await sendEvents(events)
    } catch (error) {
      // 发送失败，放回队列并稍后重试
      queueRef.current.unshift(...events)
      persistQueue(queueRef.current)
    } finally {
      flushingRef.current = false
    }
  }, [sendEvents])

  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      return
    }
    if (typeof window === "undefined") return
    flushTimeoutRef.current = window.setTimeout(() => {
      flushTimeoutRef.current = null
      void flush()
    }, ANALYTICS_FLUSH_INTERVAL)
  }, [flush])

  const enrichEvent = useCallback(
    (input: AnalyticsEventInput): AnalyticsEventPayload => ({
      event_name: input.event_name,
      ap_name: input.ap_name,
      action_type: input.action_type,
      refer: input.refer ?? currentRefer,
      user_id: userId,
      device_id: deviceId,
      platform,
      version,
      time: input.time ?? Date.now(),
      items: input.items ?? [],
      extra: input.extra,
    }),
    [currentRefer, deviceId, platform, userId, version]
  )

  const track = useCallback(
    (input: AnalyticsEventInput) => {
      const event = enrichEvent(input)
      queueRef.current.push(event)
      persistQueue(queueRef.current)

      if (queueRef.current.length >= ANALYTICS_BATCH_SIZE) {
        void flush()
      } else {
        scheduleFlush()
      }
    },
    [enrichEvent, flush, scheduleFlush]
  )

  // 页面曝光
  useEffect(() => {
    if (!pathname) return
    track({
      event_name: "page_view",
      ap_name: `${currentRefer}_page`,
      refer: currentRefer,
      items: [
        {
          item_type: "page",
          item_value: currentRefer,
        },
      ],
    })
  }, [currentRefer, pathname, searchKey, track])

  // flush when page hidden/unload
  useEffect(() => {
    if (typeof document === "undefined") return
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        void flush()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("beforeunload", handleVisibility)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("beforeunload", handleVisibility)
    }
  }, [flush])

  const value = useMemo(
    () => ({
      track,
      flush,
      currentRefer,
    }),
    [currentRefer, flush, track]
  )

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error(
      "useAnalyticsContext must be used within AnalyticsProvider"
    )
  }
  return context
}
