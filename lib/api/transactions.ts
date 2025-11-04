/**
 * Transaction 相关 API
 * 对接 Go 后端的 Transaction 接口
 */

import { apiClient } from "./client";
import type { TransactionView, CreateTransactionRequest } from "./types";

// ==================== API 函数 ====================

/**
 * 创建交易
 * POST /transactions
 */
export async function createTransaction(
  payload: CreateTransactionRequest
): Promise<TransactionView> {
  return apiClient.post<TransactionView>("/transactions", payload);
}
