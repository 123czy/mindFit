/**
 * 帖子相关 React Query Hooks
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  publishPost,
} from "@/lib/api/posts";
import { CACHE_TIMES, QUERY_PRESETS } from "@/lib/react-query/config";
import type {
  CreatePostRequest,
  UpdatePostRequest,
  GetPostsParams,
} from "@/lib/api/posts";

/**
 * 获取帖子列表
 */
export function usePosts(params?: GetPostsParams) {
  return useQuery({
    queryKey: ["posts", "list", params],
    queryFn: () => getPosts(params),
    staleTime: CACHE_TIMES.POSTS.staleTime,
    gcTime: CACHE_TIMES.POSTS.gcTime,
    ...QUERY_PRESETS.list,
  });
}

/**
 * 获取帖子列表（无限滚动）
 */
export function useInfinitePosts(params?: Omit<GetPostsParams, "offset">) {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite", params],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getPosts({
        ...params,
        offset: pageParam as number,
      });
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.data.length,
        0
      );
      // 如果返回的数据少于 limit，说明没有更多数据了
      const limit = params?.limit || 20;
      return lastPage.data.length === limit ? loadedCount : undefined;
    },
    initialPageParam: 0,
    staleTime: CACHE_TIMES.POSTS.staleTime,
    gcTime: CACHE_TIMES.POSTS.gcTime,
    ...QUERY_PRESETS.list,
  });
}

/**
 * 获取单个帖子
 */
export function usePost(id: string | null, locale?: string) {
  return useQuery({
    queryKey: ["posts", id, locale],
    queryFn: () => {
      if (!id) throw new Error("Post ID is required");
      return getPostById(id, locale);
    },
    enabled: !!id,
    staleTime: CACHE_TIMES.POST_DETAIL.staleTime,
    gcTime: CACHE_TIMES.POST_DETAIL.gcTime,
    ...QUERY_PRESETS.detail,
  });
}

/**
 * 创建帖子
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostRequest) => createPost(payload),
    onSuccess: () => {
      // 刷新帖子列表
      queryClient.invalidateQueries({ queryKey: ["posts", "list"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] });
    },
  });
}

/**
 * 更新帖子
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePostRequest }) =>
      updatePost(id, payload),
    onSuccess: (data, variables) => {
      // 更新单个帖子缓存
      queryClient.setQueryData(["posts", variables.id], data);
      // 刷新帖子列表
      queryClient.invalidateQueries({ queryKey: ["posts", "list"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] });
    },
  });
}

/**
 * 发布帖子
 */
export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishPost(id),
    onSuccess: (data, id) => {
      // 更新单个帖子缓存
      queryClient.setQueryData(["posts", id], data);
      // 刷新帖子列表
      queryClient.invalidateQueries({ queryKey: ["posts", "list"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] });
    },
  });
}
