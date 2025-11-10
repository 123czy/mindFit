import packageJson from "../../package.json"
import {
  ANALYTICS_DEVICE_KEY,
  ANALYTICS_STORAGE_KEY,
} from "./constants"
import type { AnalyticsRefer } from "./types"

const REFER_RULES: Array<{ pattern: RegExp; refer: AnalyticsRefer }> = [
  { pattern: /^\/$/, refer: "home" },
  { pattern: /^\/post\/.+/, refer: "post_detail" },
  { pattern: /^\/product\/.+/, refer: "product_detail" },
  { pattern: /^\/publish/, refer: "publish" },
  { pattern: /^\/notifications/, refer: "notifications" },
  { pattern: /^\/profile\/.+/, refer: "profile" },
  { pattern: /^\/search/, refer: "search" },
]

export function mapPathnameToRefer(pathname: string): AnalyticsRefer {
  const rule = REFER_RULES.find((item) => item.pattern.test(pathname))
  return rule ? rule.refer : "other"
}

export function getAppVersion(): string {
  return (
    process.env.NEXT_PUBLIC_APP_VERSION ||
    packageJson.version ||
    "0.0.0"
  )
}

export function ensureDeviceId(): string {
  if (typeof window === "undefined") {
    return "server"
  }

  try {
    const existing =
      window.localStorage.getItem(ANALYTICS_DEVICE_KEY) ||
      getCookie(ANALYTICS_DEVICE_KEY)
    if (existing) {
      // 确保 cookie 与 localStorage 同步
      window.localStorage.setItem(ANALYTICS_DEVICE_KEY, existing)
      setCookie(ANALYTICS_DEVICE_KEY, existing)
      return existing
    }
    const nextId = crypto.randomUUID()
    window.localStorage.setItem(ANALYTICS_DEVICE_KEY, nextId)
    setCookie(ANALYTICS_DEVICE_KEY, nextId)
    return nextId
  } catch {
    return "unknown"
  }
}

function getCookie(key: string): string | null {
  if (typeof document === "undefined") return null
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${key}=`))
  return value ? decodeURIComponent(value.split("=")[1]) : null
}

function setCookie(key: string, value: string) {
  if (typeof document === "undefined") return
  try {
    document.cookie = `${key}=${value}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax`
  } catch {
    // ignore
  }
}

export function loadPersistedQueue() {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) ?? []
  } catch {
    return []
  }
}

export function persistQueue(events: unknown[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      ANALYTICS_STORAGE_KEY,
      JSON.stringify(events)
    )
  } catch {
    // ignore
  }
}
