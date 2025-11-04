/**
 * 用户相关 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserById, updateCurrentUser } from "@/lib/api/users";
import { CACHE_TIMES, QUERY_PRESETS } from "@/lib/react-query/config";
import type { UpdateMeRequest, User } from "@/lib/api/types";

/**
 * 根据 ID 获取用户信息
 */
export function useUser(id: string | null) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => {
      if (!id) throw new Error("User ID is required");
      return getUserById(id);
    },
    enabled: !!id,
    staleTime: CACHE_TIMES.USER.staleTime,
    gcTime: CACHE_TIMES.USER.gcTime,
    ...QUERY_PRESETS.detail,
  });
}

/**
 * 更新当前用户信息
 */
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMeRequest) => updateCurrentUser(payload),
    onSuccess: (data: User) => {
      // 更新当前用户缓存
      queryClient.setQueryData(["user", "me"], data);
      // 如果用户 ID 相同，也更新用户详情缓存
      queryClient.setQueryData(["user", data.id], data);
    },
  });
}
