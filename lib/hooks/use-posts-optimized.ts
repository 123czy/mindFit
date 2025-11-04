"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostsWithProducts } from "../supabase/api/posts";
import { mapDbPostToPost, type Post } from "../types";
import { CACHE_TIMES, QUERY_PRESETS } from "../react-query/config";

interface UsePostsOptions {
  limit?: number;
  userId?: string;
  tags?: string[];
  enabled?: boolean; // 允许外部控制是否启用查询
}

/**
 * 优化的 usePosts Hook - 使用 React Query 实现缓存和自动重新验证
 *
 * 特性：
 * 1. 批量获取 products（减少 N+1 查询问题）
 * 2. 自动缓存数据（2分钟，从配置中读取）
 * 3. 从详情页返回时使用缓存，不重新加载
 * 4. 后台自动重新验证（保持数据新鲜）
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
      const { data, error: fetchError } = await getPostsWithProducts({
        limit: options?.limit || 20,
        userId: options?.userId,
        tags: options?.tags,
      });

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        return [];
      }

      // 转换数据格式
      const mappedPosts: Post[] = data.map((dbPost: any) => {
        const products = dbPost.products || [];
        return mapDbPostToPost(dbPost, products);
      });

      return mappedPosts;
    },
    enabled: options?.enabled !== false, // 默认启用
    // 使用配置中的缓存时间
    staleTime: CACHE_TIMES.POSTS.staleTime, // 2分钟缓存
    gcTime: CACHE_TIMES.POSTS.gcTime, // 5分钟垃圾回收
    // 使用列表查询预设
    ...QUERY_PRESETS.list,
  });

  return {
    posts,
    isLoading,
    isFetching,
    isStale,
    error,
  };
}
