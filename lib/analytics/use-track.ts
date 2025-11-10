"use client"

import { useCallback, useEffect, useRef } from "react"
import { useAnalyticsContext } from "./analytics-provider"
import type { AnalyticsEventInput } from "./types"

interface ExposureOptions {
  once?: boolean
  threshold?: number
}

export function useTrack() {
  const context = useAnalyticsContext()
  return context
}

export function useTrackExposure<T extends HTMLElement>(
  factory: () => AnalyticsEventInput,
  options: ExposureOptions = {}
) {
  const { track } = useTrack()
  const ref = useRef<T | null>(null)
  const { once = true, threshold = 0.5 } = options

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            track(factory())
            if (once) {
              observerInstance.unobserve(entry.target)
            }
          }
        })
      },
      { threshold }
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [factory, once, threshold, track])

  return useCallback((node: T | null) => {
    ref.current = node
  }, [])
}
