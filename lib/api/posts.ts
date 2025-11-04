/**
 * 帖子相关 API
 * 对接 Go 后端的帖子接口
 */

import { apiClient } from "./client";
import type {
  PostListResponse,
  PostSingleResponse,
  CreatePostRequest,
  UpdatePostRequest,
} from "./types";

// ==================== API 函数 ====================

export interface GetPostsParams {
  limit?: number;
  offset?: number;
  tag_id?: string[];
  tags?: string; // 逗号分隔的 tag IDs
  author_id?: string;
  keyword?: string;
  locale?: string;
}

/**
 * 获取帖子列表
 * GET /posts
 */
export async function getPosts(
  params?: GetPostsParams
): Promise<PostListResponse> {
  // 转换 params 为 API 客户端需要的格式
  const apiParams: Record<string, string | number | boolean | undefined> = {};

  if (params?.limit !== undefined) apiParams.limit = params.limit;
  if (params?.offset !== undefined) apiParams.offset = params.offset;
  if (params?.tags) apiParams.tags = params.tags;
  if (params?.author_id) apiParams.author_id = params.author_id;
  if (params?.keyword) apiParams.keyword = params.keyword;
  if (params?.locale) apiParams.locale = params.locale;

  // tag_id 数组需要特殊处理（转换为逗号分隔的字符串）
  if (params?.tag_id && params.tag_id.length > 0) {
    // 如果已经有 tags 参数，合并；否则使用 tag_id
    if (params.tags) {
      apiParams.tags = [params.tags, ...params.tag_id].join(",");
    } else {
      apiParams.tags = params.tag_id.join(",");
    }
  }

  return apiClient.get<PostListResponse>("/posts", { params: apiParams });
}

/**
 * 获取单个帖子
 * GET /posts/{id}
 */
export async function getPostById(
  id: string,
  locale?: string
): Promise<PostSingleResponse> {
  return apiClient.get<PostSingleResponse>(`/posts/${id}`, {
    params: locale ? { locale } : undefined,
  });
}

/**
 * 创建帖子
 * POST /posts
 */
export async function createPost(
  payload: CreatePostRequest
): Promise<PostSingleResponse> {
  return apiClient.post<PostSingleResponse>("/posts", payload);
}

/**
 * 更新帖子
 * PUT /posts/{id}
 */
export async function updatePost(
  id: string,
  payload: UpdatePostRequest
): Promise<PostSingleResponse> {
  return apiClient.put<PostSingleResponse>(`/posts/${id}`, payload);
}

/**
 * 发布帖子
 * POST /posts/{id}/publish
 */
export async function publishPost(id: string): Promise<PostSingleResponse> {
  return apiClient.post<PostSingleResponse>(`/posts/${id}/publish`);
}
