/**
 * Salable 相关 API
 * 对接 Go 后端的 Salable 接口
 */

import type {
  SalableListResponse,
  PurchasedSalableListResponse,
  SuccessMessageResponse,
} from "./types";

// ==================== API 函数 ====================

export interface GetCreatedSalablesParams {
  status?: "draft" | "published" | "archived";
  mounted_item?: "PROMPT_FILE" | "BUNDLE" | "ZIP";
  post_id?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message =
      (data as any)?.error || (data as any)?.message || "请求失败";
    throw new Error(message);
  }
  return data as T;
}

/**
 * 获取创建的 Salables
 * GET /salables/created
 */
export async function getCreatedSalables(
  params?: GetCreatedSalablesParams
): Promise<SalableListResponse> {
  // 转换 params 为 API 客户端需要的格式
  const apiParams = new URLSearchParams();
  if (params?.status) apiParams.set("status", params.status);
  if (params?.mounted_item) apiParams.set("mounted_item", params.mounted_item);
  if (params?.post_id) apiParams.set("post_id", params.post_id);

  const queryString = apiParams.toString();
  const url = queryString
    ? `/api/salables/created?${queryString}`
    : `/api/salables/created`;

  console.log("[getCreatedSalables] Request URL:", url);
  console.log("[getCreatedSalables] Params:", params);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await handleResponse<SalableListResponse>(response);
  console.log("[getCreatedSalables] Response data:", data);
  return data;
}

/**
 * 获取购买的 Salables
 * GET /salables/purchased
 */
export async function getPurchasedSalables(): Promise<PurchasedSalableListResponse> {
  const response = await fetch(`/api/salables/purchased`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await handleResponse<PurchasedSalableListResponse>(response);
  return data;
}

/**
 * 发布 Salable
 * POST /salables/{id}/publish
 */
export async function publishSalable(
  id: string
): Promise<SuccessMessageResponse> {
  const res = await fetch(`/api/salables/${id}/publish`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await handleResponse<SuccessMessageResponse>(res);
  return data;
}
