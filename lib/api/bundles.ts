/**
 * Prompt 相关 API
 * 对接 Go 后端的 Prompt 接口
 */

import {
  CreateBundlesRequest,
  UpdateBundlesRequest,
  BundlesView,
  PatchBundlesRequest,
} from "./types";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message =
      (data as any)?.error || (data as any)?.message || "请求失败";
    throw new Error(message);
  }
  return data as T;
}

// ==================== API 函数 ====================

/**
 * 创建 Bundles
 * POST /bundles
 */
export async function createBundles(
  payload: CreateBundlesRequest
): Promise<BundlesView> {
  const res = await fetch("/api/bundles", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<BundlesView>(res);
}

/**
 * 获取 Prompt 详情
 * GET /prompts/{id}
 */
export async function getCreatedBundlesById(id: string): Promise<BundlesView> {
  const res = await fetch(`/api/bundles/${id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<BundlesView>(res);
}

export async function getCreatedBundles(status: string): Promise<BundlesView> {
  const res = await fetch(`/api/bundles/created?status=${status}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<BundlesView>(res);
}

/**
 * 更新 Bundles
 * PUT /prompts/{id}
 */
export async function patchBundles(
  id: string,
  payload: PatchBundlesRequest
): Promise<BundlesView> {
  const res = await fetch(`/api/bundles/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<BundlesView>(res);
}

/**
 * 归档 Bundles
 * POST /prompts/{id}/versions
 */
export async function bundlesArchive(id: string): Promise<BundlesView> {
  const res = await fetch(`/api/bundles/{id}/archive`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<BundlesView>(res);
}
