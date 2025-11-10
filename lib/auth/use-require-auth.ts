"use client";

import { useCallback } from "react";
import { useAuth } from "./auth-context";
import { useLoginDialog } from "./use-login-dialog";
import { useTrack } from "@/lib/analytics/use-track";

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const { openDialog } = useLoginDialog();
  const { track } = useTrack();

  const requireAuth = useCallback(
    (callback: () => void, actionType?: string, params?: any) => {
      if (isAuthenticated) {
        callback();
      } else {
        track({
          event_name: "block",
          ap_name: "require_auth_gate",
          items: [
            {
              item_type: "pending_action",
              item_value: actionType || "unknown",
              item_meta: params,
            },
          ],
        });
        openDialog({
          type: actionType || "unknown",
          params,
          callback,
        });
      }
    },
    [isAuthenticated, openDialog, track]
  );

  return { requireAuth };
}
