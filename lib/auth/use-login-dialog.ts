"use client";

import React, { useState, useCallback, useEffect } from "react";

type PendingAction = {
  type: string;
  params?: any;
  callback?: () => void;
};

let loginDialogOpenState = false;
let loginDialogOpenListeners: ((open: boolean) => void)[] = [];
let pendingActions: PendingAction[] = [];

export function useLoginDialog() {
  const [isOpen, setIsOpen] = useState(loginDialogOpenState);

  const openDialog = useCallback((action?: PendingAction) => {
    if (action) {
      pendingActions.push(action);
    }
    loginDialogOpenState = true;
    loginDialogOpenListeners.forEach((listener) => listener(true));
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    loginDialogOpenState = false;
    loginDialogOpenListeners.forEach((listener) => listener(false));
    setIsOpen(false);
  }, []);

  const executePendingActions = useCallback(() => {
    const actions = [...pendingActions];
    pendingActions = [];
    actions.forEach((action) => {
      if (action.callback) {
        action.callback();
      }
    });
  }, []);

  // 监听状态变化
  useEffect(() => {
    const listener = (open: boolean) => setIsOpen(open);
    loginDialogOpenListeners.push(listener);
    setIsOpen(loginDialogOpenState); // 初始化状态
    return () => {
      loginDialogOpenListeners = loginDialogOpenListeners.filter(
        (l) => l !== listener
      );
    };
  }, []);

  return {
    isOpen,
    openDialog,
    closeDialog,
    executePendingActions,
  };
}
