/**
 * Prompt 相关 API
 * 对接 Go 后端的 Prompt 接口
 */

import { apiClient } from "./client";
import type {
  PromptView,
  CreatePromptRequest,
  UpdatePromptRequest,
  AddVersionRequest,
} from "./types";

// ==================== API 函数 ====================

/**
 * 创建 Prompt
 * POST /prompts
 */
export async function createPrompt(
  payload: CreatePromptRequest
): Promise<PromptView> {
  return apiClient.post<PromptView>("/prompts", payload);
}

/**
 * 获取 Prompt 详情
 * GET /prompts/{id}
 */
export async function getPromptById(id: string): Promise<PromptView> {
  return apiClient.get<PromptView>(`/prompts/${id}`);
}

/**
 * 更新 Prompt
 * PUT /prompts/{id}
 */
export async function updatePrompt(
  id: string,
  payload: UpdatePromptRequest
): Promise<PromptView> {
  return apiClient.put<PromptView>(`/prompts/${id}`, payload);
}

/**
 * 添加 Prompt 版本
 * POST /prompts/{id}/versions
 */
export async function addPromptVersion(
  id: string,
  payload: AddVersionRequest
): Promise<PromptView> {
  return apiClient.post<PromptView>(`/prompts/${id}/versions`, payload);
}
