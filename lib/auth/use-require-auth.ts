"use client";

import { useCallback } from "react";
import { useAuth } from "./auth-context";
import { useLoginDialog } from "./use-login-dialog";

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const { openDialog } = useLoginDialog();

  const requireAuth = useCallback(
    (callback: () => void, actionType?: string, params?: any) => {
      if (isAuthenticated) {
        callback();
      } else {
        openDialog({
          type: actionType || "unknown",
          params,
          callback,
        });
      }
    },
    [isAuthenticated, openDialog]
  );

  return { requireAuth };
}
