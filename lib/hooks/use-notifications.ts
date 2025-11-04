"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_TIMES, QUERY_PRESETS } from "../react-query/config";

/**
 * 获取通知的 Hook（示例）
 *
 * 使用 NOTIFICATIONS 缓存策略：
 * - 30秒缓存（需要实时性，缓存时间短）
 * - 2分钟垃圾回收
 */
export function useNotifications() {
  const {
    data: notifications = [],
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      // TODO: 实现获取通知的 API
      // const { data } = await getNotifications();
      // return data;
      return [];
    },
    // 使用配置中的缓存时间（通知需要实时性）
    staleTime: CACHE_TIMES.NOTIFICATIONS.staleTime, // 30秒缓存
    gcTime: CACHE_TIMES.NOTIFICATIONS.gcTime, // 2分钟垃圾回收
    // 使用实时查询预设（可以设置自动刷新）
    ...QUERY_PRESETS.realtime,
  });

  return {
    notifications,
    isLoading,
    isFetching,
    error,
  };
}
