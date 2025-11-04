/**
 * Salable 相关 API
 * 对接 Go 后端的 Salable 接口
 */

import { apiClient } from "./client";
import type {
  SalableListResponse,
  PurchasedSalableListResponse,
  SuccessMessageResponse,
} from "./types";

// ==================== API 函数 ====================

export interface GetCreatedSalablesParams {
  status?: "draft" | "published" | "archived";
  type?: "PROMPT_FILE" | "BUNDLE";
}

/**
 * 获取创建的 Salables
 * GET /salables/created
 */
export async function getCreatedSalables(
  params?: GetCreatedSalablesParams
): Promise<SalableListResponse> {
  // 转换 params 为 API 客户端需要的格式
  const apiParams: Record<string, string | number | boolean | undefined> = {};

  if (params?.status) apiParams.status = params.status;
  if (params?.type) apiParams.type = params.type;

  return apiClient.get<SalableListResponse>("/salables/created", {
    params: apiParams,
  });
}

/**
 * 获取购买的 Salables
 * GET /salables/purchased
 */
export async function getPurchasedSalables(): Promise<PurchasedSalableListResponse> {
  return apiClient.get<PurchasedSalableListResponse>("/salables/purchased");
}

/**
 * 发布 Salable
 * POST /salables/{id}/publish
 */
export async function publishSalable(
  id: string
): Promise<SuccessMessageResponse> {
  return apiClient.post<SuccessMessageResponse>(`/salables/${id}/publish`);
}
