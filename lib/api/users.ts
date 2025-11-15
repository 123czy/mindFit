/**
 * 用户相关 API
 * 对接 Go 后端的用户接口
 */

import { apiClient } from "./client";
import type { User, UpdateMeRequest } from "./types";

// ==================== API 函数 ====================

/**
 * 获取当前用户信息
 * GET /me
 */
export async function getCurrentUser(): Promise<User> {
  const res = await fetch("/api/me", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    const message = (data as any)?.error || "Failed to load current user";
    throw new Error(message);
  }

  return data as User;
}

/**
 * 更新当前用户信息
 * PUT /me
 */
export async function updateCurrentUser(
  payload: UpdateMeRequest
): Promise<User> {
  const res = await fetch("/api/me", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    const message = (data as any)?.error || "Failed to update profile";
    throw new Error(message);
  }

  return data as User;
}

/**
 * 根据 ID 获取用户信息
 * GET /users/{id}
 */
export async function getUserById(id: string): Promise<User> {
  return apiClient.get<User>(`/users/${id}`);
}
