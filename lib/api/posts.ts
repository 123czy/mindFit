/**
 * 帖子相关 API
 * 对接 Go 后端的帖子接口
 */

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};
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
  const searchParams = new URLSearchParams();

  if (params?.limit !== undefined)
    searchParams.set("limit", String(params.limit));
  if (params?.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  if (params?.tags) searchParams.set("tags", params.tags);
  if (params?.author_id) searchParams.set("author_id", params.author_id);
  if (params?.keyword) searchParams.set("keyword", params.keyword);
  if (params?.locale) searchParams.set("locale", params.locale);
  if (params?.tag_id && params.tag_id.length > 0) {
    const existingTags = searchParams.get("tags");
    const combined = existingTags
      ? `${existingTags},${params.tag_id.join(",")}`
      : params.tag_id.join(",");
    searchParams.set("tags", combined);
  }

  const query = searchParams.toString();
  const res = await fetch(query ? `/api/posts?${query}` : "/api/posts", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message = (data as any)?.error || "Failed to load posts";
    throw new Error(message);
  }

  return data as PostListResponse;
}

/**
 * 获取单个帖子
 * GET /posts/{id}
 */
export async function getPostById(
  id: string,
  locale?: string
): Promise<PostSingleResponse> {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  const res = await fetch(`/api/posts/${id}${query}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message = (data as any)?.error || "Failed to load post";
    throw new Error(message);
  }

  return data as PostSingleResponse;
}

/**
 * 创建帖子
 * POST /posts
 */
export async function createPost(
  payload: CreatePostRequest
): Promise<PostSingleResponse> {
  const res = await fetch("/api/posts", {
    method: "POST",
    credentials: "include",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message = (data as any)?.error || "Failed to create post";
    throw new Error(message);
  }

  return data as PostSingleResponse;
}

/**
 * 更新帖子
 * PUT /posts/{id}
 */
export async function updatePost(
  id: string,
  payload: UpdatePostRequest
): Promise<PostSingleResponse> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message = (data as any)?.error || "Failed to update post";
    throw new Error(message);
  }

  return data as PostSingleResponse;
}

/**
 * 发布帖子
 * POST /posts/{id}/publish
 */
export async function publishPost(id: string): Promise<PostSingleResponse> {
  const res = await fetch(`/api/posts/${id}/publish`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message = (data as any)?.error || "Failed to publish post";
    throw new Error(message);
  }

  return data as PostSingleResponse;
}
