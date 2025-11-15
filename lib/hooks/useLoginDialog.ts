import { useCallback, useEffect, useRef } from "react"
import { useCurrentUserInfo } from "./use-api-auth"
import { useLoginDialog as useGlobalLoginDialog } from "@/lib/auth/use-login-dialog"

interface EnsureLoginOptions {
  actionType?: string
  params?: Record<string, unknown>
}

type PendingAction = (() => void) | null

export function useLoginDialog() {
  const { data: currentUser, isLoading } = useCurrentUserInfo()
  const { openDialog } = useGlobalLoginDialog()
  const pendingActionRef = useRef<PendingAction>(null)

  const runPendingAction = useCallback(() => {
    const action = pendingActionRef.current
    pendingActionRef.current = null
    if (action) {
      action()
    }
  }, [])

  const ensureLogin = useCallback(
    (action?: () => void, options?: EnsureLoginOptions) => {
      if (currentUser) {
        action?.()
        return
      }

      pendingActionRef.current = action || null

      openDialog({
        type: options?.actionType || "pending_action",
        params: options?.params,
        callback: runPendingAction,
      })
    },
    [currentUser, openDialog, runPendingAction]
  )

  useEffect(() => {
    if (currentUser) {
      runPendingAction()
    }
  }, [currentUser, runPendingAction])

  return {
    isAuthenticated: !!currentUser,
    isLoading,
    ensureLogin,
  }
}
