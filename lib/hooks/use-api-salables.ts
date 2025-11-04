/**
 * Salable 相关 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCreatedSalables,
  getPurchasedSalables,
  publishSalable,
} from "@/lib/api/salables";
import { CACHE_TIMES, QUERY_PRESETS } from "@/lib/react-query/config";
import type { GetCreatedSalablesParams } from "@/lib/api/salables";

/**
 * 获取创建的 Salables
 */
export function useCreatedSalables(params?: GetCreatedSalablesParams) {
  return useQuery({
    queryKey: ["salables", "created", params],
    queryFn: () => getCreatedSalables(params),
    staleTime: CACHE_TIMES.PRODUCTS.staleTime,
    gcTime: CACHE_TIMES.PRODUCTS.gcTime,
    ...QUERY_PRESETS.list,
  });
}

/**
 * 获取购买的 Salables
 */
export function usePurchasedSalables() {
  return useQuery({
    queryKey: ["salables", "purchased"],
    queryFn: getPurchasedSalables,
    staleTime: CACHE_TIMES.PRODUCTS.staleTime,
    gcTime: CACHE_TIMES.PRODUCTS.gcTime,
    ...QUERY_PRESETS.list,
  });
}

/**
 * 发布 Salable
 */
export function usePublishSalable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishSalable(id),
    onSuccess: () => {
      // 刷新创建的 Salables 列表
      queryClient.invalidateQueries({ queryKey: ["salables", "created"] });
    },
  });
}
