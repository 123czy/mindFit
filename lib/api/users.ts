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
  return apiClient.get<User>("/me");
}

/**
 * 更新当前用户信息
 * PUT /me
 */
export async function updateCurrentUser(
  payload: UpdateMeRequest
): Promise<User> {
  return apiClient.put<User>("/me", payload);
}

/**
 * 根据 ID 获取用户信息
 * GET /users/{id}
 */
export async function getUserById(id: string): Promise<User> {
  return apiClient.get<User>(`/users/${id}`);
}
