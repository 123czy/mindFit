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
    onSuccess: (data: AuthResponse) => {
      // 清除用户相关缓存，触发重新获取
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.setQueryData(["user", "me"], data.user);
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
export function useCurrentUserQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: getCurrentUser,
    enabled,
    staleTime: CACHE_TIMES.USER.staleTime,
    gcTime: CACHE_TIMES.USER.gcTime,
    ...QUERY_PRESETS.detail,
  });
}
