/**
 * Prompt 相关 API
 * 对接 Go 后端的 Prompt 接口
 */

import {
  CreatePromptRequest,
  PromptView,
  UpdatePromptRequest,
  AddVersionRequest,
} from "./types";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  console.log("handleResponsedata", data);
  if (!res.ok || !data) {
    const message =
      (data as any)?.error || (data as any)?.message || "请求失败";
    throw new Error(message);
  }
  return data as T;
}

// ==================== API 函数 ====================

/**
 * 创建 Prompt
 * POST /prompts
 */
export async function createPrompt(
  payload: CreatePromptRequest
): Promise<PromptView> {
  const res = await fetch("/api/products", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("createPrompt res---", JSON.stringify(payload), res);

  return handleResponse<PromptView>(res);
}

/**
 * 获取 Prompt 详情
 * GET /prompts/{id}
 */
export async function getPromptById(id: string): Promise<PromptView> {
  const res = await fetch(`/api/products/${id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<PromptView>(res);
}

/**
 * 更新 Prompt
 * PUT /prompts/{id}
 */
export async function updatePrompt(
  id: string,
  payload: UpdatePromptRequest
): Promise<PromptView> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<PromptView>(res);
}

/**
 * 添加 Prompt 版本
 * POST /prompts/{id}/versions
 */
export async function addPromptVersion(
  id: string,
  payload: AddVersionRequest
): Promise<PromptView> {
  const res = await fetch(`/api/products/${id}/versions`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<PromptView>(res);
}
