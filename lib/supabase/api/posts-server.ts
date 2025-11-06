/**
 * Posts 服务器端 API
 * 用于 SSR 和 Server Components
 */

import { getServerSupabase } from "../server";
import { mapDbPostToPost, type Post } from "@/lib/types";

/**
 * 服务器端批量获取 products
 */
async function getProductsByPostIdsSSR(postIds: string[]) {
  try {
    if (postIds.length === 0) {
      return { data: [], error: null };
    }

    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("post_id", postIds)
      .eq("is_active", true);

    return { data: data || [], error };
  } catch (error) {
    console.error("Error in getProductsByPostIdsSSR:", error);
    return { data: [], error };
  }
}

/**
 * 服务器端获取帖子列表（带 products）
 */
export async function getPostsWithProductsSSR(options?: {
  limit?: number;
  offset?: number;
  userId?: string;
  tags?: string[];
}): Promise<Post[]> {
  try {
    const supabase = await getServerSupabase();

    // 获取帖子
    let query = supabase
      .from("posts")
      .select("*, users!inner(username, avatar_url, wallet_address)")
      .order("created_at", { ascending: false });

    if (options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    if (options?.tags && options.tags.length > 0) {
      query = query.contains("tags", options.tags);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data: posts, error } = await query;

    if (error || !posts) {
      console.error("Error fetching posts:", error);
      return [];
    }

    // 批量获取所有 products
    const postIds = posts.map((post: any) => post.id);
    const { data: allProducts, error: productsError } =
      await getProductsByPostIdsSSR(postIds);

    if (productsError) {
      console.error("Error loading products:", productsError);
    }

    // 将 products 分组到对应的 post
    const productsByPostId = new Map<string, any[]>();
    if (allProducts) {
      allProducts.forEach((product: any) => {
        const postId = product.post_id;
        if (!productsByPostId.has(postId)) {
          productsByPostId.set(postId, []);
        }
        productsByPostId.get(postId)!.push(product);
      });
    }

    // 转换数据格式
    const mappedPosts: Post[] = posts.map((dbPost: any) => {
      const products = productsByPostId.get(dbPost.id) || [];
      return mapDbPostToPost(dbPost, products);
    });

    return mappedPosts;
  } catch (error) {
    console.error("Error in getPostsWithProductsSSR:", error);
    return [];
  }
}
