/**
 * Hook to fetch spotlight posts
 * 使用 React Query 进行缓存管理
 */

import { useQuery } from "@tanstack/react-query";
import { getSpotlightPosts } from "@/lib/supabase/api/spotlight";
import { CACHE_TIMES, QUERY_PRESETS } from "@/lib/react-query/config";

export function useSpotlightPosts(limit: number = 6) {
  return useQuery({
    queryKey: ["spotlight-posts", limit],
    queryFn: async () => {
      const { data, error } = await getSpotlightPosts(limit);
      if (error) {
        throw error;
      }
      return data || [];
    },
    staleTime: CACHE_TIMES.POSTS.staleTime,
    gcTime: CACHE_TIMES.POSTS.gcTime,
    ...QUERY_PRESETS.list,
  });
}
