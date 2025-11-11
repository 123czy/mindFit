"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../utils/api-client";
import { mapDbPostToPost, type Post } from "../types";
import { CACHE_TIMES, QUERY_PRESETS } from "../react-query/config";

interface UsePostsOptions {
  limit?: number;
  userId?: string;
  tags?: string[];
  enabled?: boolean; // 允许外部控制是否启用查询
}

/**
 * 优化的 usePosts Hook - 使用 React Query 实现数据获取
 *
 * 特性：
 * 1. 批量获取 products（减少 N+1 查询问题）
 * 2. 每次刷新页面都获取新数据（不使用缓存）
 * 3. SSR 预填充数据用于首屏快速显示
 * 4. 客户端组件挂载时立即重新获取最新数据
 *
 * 缓存策略：
 * - staleTime: 0 - 不缓存，每次都需要重新获取
 * - refetchOnMount: true - 组件挂载时重新获取
 * - 确保每次刷新页面看到不同的内容
 */
export function usePostsOptimized(options?: UsePostsOptions) {
  const queryKey = [
    "posts",
    options?.limit,
    options?.userId,
    options?.tags?.join(",") || "",
  ];

  const {
    data: posts = [],
    isLoading,
    error,
    isFetching,
    isStale,
  } = useQuery<Post[]>({
    queryKey,
    queryFn: async () => {
      // 使用优化的批量查询
      const query = new URLSearchParams();
      if (options?.limit) query.set("limit", String(options.limit));
      if (options?.userId) query.set("userId", options.userId);
      if (options?.tags?.length) query.set("tags", options.tags.join(","));

      const queryString = query.toString();
      const url = queryString ? `/api/posts?${queryString}` : "/api/posts";

      const response = await apiGet<{ data: Array<any & { products?: any[] }> }>(url);

      const data = response.data ?? [];

      // 转换数据格式
      const mappedPosts: Post[] = data.map((dbPost) => {
        const products = dbPost.products || [];
        return mapDbPostToPost(dbPost, products);
      });

      return mappedPosts;
    },
    enabled: options?.enabled !== false, // 默认启用
    // 每次刷新页面时获取新数据，不使用缓存
    staleTime: 0, // 不缓存，每次都需要重新获取
    gcTime: CACHE_TIMES.POSTS.gcTime, // 5分钟垃圾回收
    // 每次挂载时都重新获取数据
    refetchOnMount: true, // 组件挂载时重新获取
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    retry: 1, // 失败时重试1次
  });

  return {
    posts,
    isLoading,
    isFetching,
    isStale,
    error,
  };
}
