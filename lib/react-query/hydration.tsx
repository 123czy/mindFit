/**
 * React Query Hydration 工具
 * 用于 SSR 数据预填充
 */

"use client";

import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface HydrationProviderProps {
  children: ReactNode;
  dehydratedState?: any;
}

/**
 * React Query Hydration Provider
 * 用于将 SSR 数据传递给客户端组件
 */
export function HydrationProvider({ children, dehydratedState }: HydrationProviderProps) {
  if (!dehydratedState) {
    return <>{children}</>;
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      {children}
    </HydrationBoundary>
  );
}

