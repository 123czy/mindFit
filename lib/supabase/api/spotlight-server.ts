/**
 * Spotlight 服务器端 API
 * 用于 SSR 和 Server Components
 */

import { getServerSupabase } from "../server";
import type { SpotlightPost } from "@/lib/types/spotlight";

/**
 * 服务器端获取 Spotlight 帖子列表
 */
export async function getSpotlightPostsSSR(
  limit: number = 6
): Promise<SpotlightPost[]> {
  try {
    const supabase = await getServerSupabase();

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
      .not("badge", "is", null)
      .order("view_count", { ascending: false })
      .order("like_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching spotlight posts:", error);
      return [];
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

    return spotlightPosts;
  } catch (error) {
    console.error("Error in getSpotlightPostsSSR:", error);
    return [];
  }
}
