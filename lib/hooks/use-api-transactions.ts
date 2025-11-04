/**
 * Transaction 相关 React Query Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction } from "@/lib/api/transactions";
import type { CreateTransactionRequest } from "@/lib/api/types";

/**
 * 创建交易
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) =>
      createTransaction(payload),
    onSuccess: () => {
      // 刷新购买的 Salables 列表
      queryClient.invalidateQueries({ queryKey: ["salables", "purchased"] });
      // 刷新创建的 Salables 列表（更新状态）
      queryClient.invalidateQueries({ queryKey: ["salables", "created"] });
    },
  });
}
