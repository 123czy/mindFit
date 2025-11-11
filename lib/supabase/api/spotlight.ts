/**
 * Spotlight 帖子相关 API
 * 用于获取首页展示的精选帖子
 */

import { supabase } from "../client";
import type { SpotlightPost } from "@/lib/types/spotlight";

/**
 * 获取 Spotlight 帖子列表
 * 优先返回有 badge 的帖子，按 view_count 和 like_count 排序
 */
export async function getSpotlightPosts(
  limit: number = 6
): Promise<{ data: SpotlightPost[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        title,
        content,
        images,
        tags,
        badge,
        view_count,
        like_count,
        comment_count,
        users!inner(
          username,
          avatar_url,
          wallet_address
        )
      `
      )
      .not("badge", "is", null) // 只获取有 badge 的帖子
      .order("view_count", { ascending: false })
      .order("like_count", { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    // 转换数据格式
    const spotlightPosts: SpotlightPost[] =
      data?.map((post: any) => {
        const user = post.users;
        const firstImage =
          Array.isArray(post.images) && post.images.length > 0
            ? post.images[0]
            : "/placeholder.jpg";

        return {
          id: post.id,
          title: post.title,
          description: post.content,
          image: firstImage,
          author: {
            name: user.username || "匿名",
            avatar: user.avatar_url || "/placeholder-user.jpg",
          },
          stats: {
            views: post.view_count || 0,
            likes: post.like_count || 0,
          },
          tags: post.tags || [],
          badge: post.badge,
          detailUrl: `/post/${post.id}`,
        };
      }) || [];

    return { data: spotlightPosts, error: null };
  } catch (error) {
    console.error("Error in getSpotlightPosts:", error);
    return { data: null, error };
  }
}
