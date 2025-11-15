import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBundles,
  getCreatedBundlesById,
  getCreatedBundles,
  patchBundles,
  bundlesArchive,
} from "@/lib/api/bundles";
import { CACHE_TIMES, QUERY_PRESETS } from "@/lib/react-query/config";
import type {
  CreateBundlesRequest,
  UpdateBundlesRequest,
  PatchBundlesRequest,
} from "@/lib/api/types";

/**
 * 创建 Bundles
 */
export function useCreateBundles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBundlesRequest) => createBundles(payload),
    onSuccess: (data) => {
      // 更新 Bundles 缓存
      queryClient.setQueryData(["bundles", data.id], data);
    },
  });
}

/**
 * 获取 Bundles 详情
 */
export function useCreatedBundles(id: string | null) {
  return useQuery({
    queryKey: ["bundles", id],
    queryFn: () => {
      if (!id) throw new Error("Bundles ID is required");
      return getCreatedBundlesById(id);
    },
    staleTime: CACHE_TIMES.PRODUCTS.staleTime,
    gcTime: CACHE_TIMES.PRODUCTS.gcTime,
    ...QUERY_PRESETS.detail,
  });
}

/**
 * 获取 Bundles 列表
 */
export function useCreatedBundlesList(status: string) {
  return useQuery({
    queryKey: ["bundles", "list", status],
    queryFn: () => getCreatedBundles(status),
    staleTime: CACHE_TIMES.PRODUCTS.staleTime,
    gcTime: CACHE_TIMES.PRODUCTS.gcTime,
    ...QUERY_PRESETS.list,
  });
}

export function useArchivedBundlesList(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatchBundlesRequest) => bundlesArchive(id),
    onSuccess: (data) => {
      // 更新 Bundles 缓存
      queryClient.invalidateQueries({ queryKey: ["bundles", id] });
    },
  });
}

export function usePatchBundles(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatchBundlesRequest) => patchBundles(id, payload),
    onSuccess: (data) => {
      // 更新 Bundles 缓存
      queryClient.setQueryData(["bundles", id], data);
      queryClient.invalidateQueries({ queryKey: ["bundles", "list", "created"] });
      queryClient.invalidateQueries({ queryKey: ["bundles", "list", "archived"] });
    },
  });
}
