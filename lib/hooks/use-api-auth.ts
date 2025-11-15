/**
 * 认证相关 React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { googleSignIn, refreshToken, logout } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/users";
import { CACHE_TIMES, QUERY_PRESETS } from "@/lib/react-query/config";
import type { GoogleSignInRequest, AuthResponse, User } from "@/lib/api/types";

/**
 * Google 登录
 */
export function useGoogleSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GoogleSignInRequest) => googleSignIn(payload),
    onSuccess: async (data: AuthResponse) => {
      // 先设置缓存数据，实现快速更新 UI
      queryClient.setQueryData(["user", "me"], data.user);

      // 自动触发 useCurrentUser 重新获取，确保全局用户信息更新
      // 这会触发所有使用 useCurrentUser 的组件自动更新
      // refetchQueries 会自动使缓存失效并重新获取最新数据
      await queryClient.refetchQueries({
        queryKey: ["user", "me"],
        type: "active", // 只重新获取当前活跃的查询
      });
    },
  });
}

/**
 * 刷新 token
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data: AuthResponse) => {
      // 更新用户信息
      queryClient.setQueryData(["user", "me"], data.user);
    },
  });
}

/**
 * 退出登录
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 清除所有缓存
      queryClient.clear();
    },
  });
}

/**
 * 获取当前用户信息
 */
export function useCurrentUserInfo() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: getCurrentUser,
    enabled: true,
    staleTime: CACHE_TIMES.USER.staleTime,
    gcTime: CACHE_TIMES.USER.gcTime,
    ...QUERY_PRESETS.detail,
  });
}
