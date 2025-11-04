/**
 * Prompt 相关 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPromptById,
  createPrompt,
  updatePrompt,
  addPromptVersion,
} from "@/lib/api/prompts";
import { CACHE_TIMES, QUERY_PRESETS } from "@/lib/react-query/config";
import type {
  PromptView,
  CreatePromptRequest,
  UpdatePromptRequest,
  AddVersionRequest,
} from "@/lib/api/types";

/**
 * 获取 Prompt 详情
 */
export function usePrompt(id: string | null) {
  return useQuery({
    queryKey: ["prompts", id],
    queryFn: () => {
      if (!id) throw new Error("Prompt ID is required");
      return getPromptById(id);
    },
    enabled: !!id,
    staleTime: CACHE_TIMES.PRODUCTS.staleTime,
    gcTime: CACHE_TIMES.PRODUCTS.gcTime,
    ...QUERY_PRESETS.detail,
  });
}

/**
 * 创建 Prompt
 */
export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePromptRequest) => createPrompt(payload),
    onSuccess: (data) => {
      // 更新 Prompt 缓存
      queryClient.setQueryData(["prompts", data.promptFileID], data);
    },
  });
}

/**
 * 更新 Prompt
 */
export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePromptRequest;
    }) => updatePrompt(id, payload),
    onSuccess: (data, variables) => {
      // 更新 Prompt 缓存
      queryClient.setQueryData(["prompts", variables.id], data);
    },
  });
}

/**
 * 添加 Prompt 版本
 */
export function useAddPromptVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddVersionRequest }) =>
      addPromptVersion(id, payload),
    onSuccess: (data, variables) => {
      // 更新 Prompt 缓存
      queryClient.setQueryData(["prompts", variables.id], data);
    },
  });
}
