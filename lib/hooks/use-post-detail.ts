"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../supabase/api/posts";
import { getProductsByPostId } from "../supabase/api/products";
import { mapDbPostToPost, type Post } from "../types";
import { CACHE_TIMES, QUERY_PRESETS } from "../react-query/config";

interface UsePostDetailOptions {
  postId: string;
  enabled?: boolean;
}

/**
 * 获取单个 Post 详情的 Hook
 *
 * 使用 POST_DETAIL 缓存策略：
 * - 5分钟缓存（比列表长，因为单个帖子变化不频繁）
 * - 10分钟垃圾回收
 */
export function usePostDetail(options: UsePostDetailOptions) {
  const { postId, enabled = true } = options;

  const {
    data: post,
    isLoading,
    error,
    isFetching,
  } = useQuery<Post | null>({
    queryKey: ["post", postId],
    queryFn: async () => {
      // 获取 post
      const { data: dbPost, error: postError } = await getPostById(postId);

      if (postError || !dbPost) {
        throw postError || new Error("Post not found");
      }

      // 获取 products
      const { data: products } = await getProductsByPostId(postId);

      // 转换数据格式
      return mapDbPostToPost(dbPost, products || []);
    },
    enabled: enabled && !!postId,
    // 使用配置中的缓存时间（详情页缓存更久）
    staleTime: CACHE_TIMES.POST_DETAIL.staleTime, // 5分钟缓存
    gcTime: CACHE_TIMES.POST_DETAIL.gcTime, // 10分钟垃圾回收
    // 使用详情查询预设
    ...QUERY_PRESETS.detail,
  });

  return {
    post,
    isLoading,
    isFetching,
    error,
  };
}
