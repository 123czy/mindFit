/**
 * Transaction 相关 API
 * 对接 Go 后端的 Transaction 接口
 */

import type { TransactionView, CreateTransactionRequest } from "./types";

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
 * 创建交易
 * POST /transactions
 */
export async function createTransaction(
  payload: CreateTransactionRequest
): Promise<TransactionView> {
  const res = await fetch("/api/transactions", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<TransactionView>(res);
}
