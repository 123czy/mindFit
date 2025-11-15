/**
 * 认证相关 API
 * 对接 Go 后端的认证接口
 */

import { clearAuthToken, setAuthToken } from "./client";
import type { GoogleSignInRequest, AuthResponse } from "./types";

// ==================== API 函数 ====================

/**
 * Google 登录
 * POST /auth/google/signin
 */
export async function googleSignIn(
  payload: GoogleSignInRequest
): Promise<AuthResponse> {
  const res = await fetch("/api/auth/google/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    const message = (data as any)?.error || "Sign in failed";
    throw new Error(message);
  }

  const authResponse = data as AuthResponse;
  if (authResponse.access_token) {
    setAuthToken(authResponse.access_token);
  }

  return authResponse;
}

/**
 * 刷新 access token
 * POST /auth/refresh
 * 使用 refresh token cookie（自动发送）
 */
export async function refreshToken(): Promise<AuthResponse> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    const message = (data as any)?.error || "Failed to refresh token";
    throw new Error(message);
  }

  const authResponse = data as AuthResponse;
  if (authResponse.access_token) {
    setAuthToken(authResponse.access_token);
  }

  return authResponse;
}

/**
 * 退出登录
 */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  clearAuthToken();
}
