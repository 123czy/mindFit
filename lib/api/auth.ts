/**
 * 认证相关 API
 * 对接 Go 后端的认证接口
 */

import { apiClient, setAuthToken, clearAuthToken } from "./client";
import type { GoogleSignInRequest, AuthResponse } from "./types";

// ==================== API 函数 ====================

/**
 * Google 登录
 * POST /auth/google/signin
 */
export async function googleSignIn(
  payload: GoogleSignInRequest
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/google/signin",
    payload,
    { skipAuth: true }
  );

  // 保存 access token
  if (response.access_token) {
    setAuthToken(response.access_token);
  }

  return response;
}

/**
 * 刷新 access token
 * POST /auth/refresh
 * 使用 refresh token cookie（自动发送）
 */
export async function refreshToken(): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/refresh");

  // 保存新的 access token
  if (response.access_token) {
    setAuthToken(response.access_token);
  }

  return response;
}

/**
 * 退出登录
 */
export async function logout(): Promise<void> {
  try {
    // 如果有退出登录接口，调用它
    // await apiClient.post("/auth/logout");
  } finally {
    clearAuthToken();
  }
}
