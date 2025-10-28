import { supabase } from "../client";
import type { Database } from "../types";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export interface CreatePostParams {
  userId: string;
  walletAddress: string;
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  isPaid?: boolean;
  price?: number;
  paidContent?: string;
}

/**
 * Create a new post
 */
export async function createPost(params: CreatePostParams) {
  try {
    const postData: PostInsert = {
      user_id: params.userId,
      wallet_address: params.walletAddress.toLowerCase(),
      title: params.title,
      content: params.content,
      images: params.images || [],
      tags: params.tags || [],
      is_paid: params.isPaid || false,
      price: params.price || null,
      paid_content: params.paidContent || null,
    };

    const { data, error } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in createPost:", error);
    return { data: null, error };
  }
}

/**
 * Get posts with pagination
 */
export async function getPosts(options?: {
  limit?: number;
  offset?: number;
  userId?: string;
  tags?: string[];
}) {
  try {
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

    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    console.error("Error in getPosts:", error);
    return { data: null, error };
  }
}

/**
 * Get post by ID
 */
export async function getPostById(postId: string) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*, users!inner(id, username,bio, avatar_url, wallet_address)")
      .eq("id", postId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in getPostById:", error);
    return { data: null, error };
  }
}

/**
 * Update post
 */
export async function updatePost(postId: string, updates: PostUpdate) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in updatePost:", error);
    return { data: null, error };
  }
}

/**
 * Delete post
 */
export async function deletePost(postId: string) {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    return { error };
  } catch (error) {
    console.error("Error in deletePost:", error);
    return { error };
  }
}

/**
 * Increment post view count
 */
export async function incrementViewCount(postId: string) {
  try {
    const { error } = await supabase.rpc("increment_view_count", {
      post_id: postId,
    });

    // If RPC doesn't exist, use manual increment
    if (error) {
      const { data: post } = await supabase
        .from("posts")
        .select("view_count")
        .eq("id", postId)
        .single();

      if (post) {
        await supabase
          .from("posts")
          .update({ view_count: post.view_count + 1 })
          .eq("id", postId);
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Error in incrementViewCount:", error);
    return { error };
  }
}

/**
 * Check if user has purchased paid post
 */
export async function hasUserPurchasedPost(userId: string, postId: string) {
  try {
    const { data, error } = await supabase
      .from("post_purchases")
      .select("id")
      .eq("buyer_id", userId)
      .eq("post_id", postId)
      .single();

    return { hasPurchased: !!data, error };
  } catch (error) {
    return { hasPurchased: false, error: null };
  }
}

/**
 * Record post purchase
 */
export async function recordPostPurchase(params: {
  buyerId: string;
  buyerWallet: string;
  postId: string;
  sellerId: string;
  sellerWallet: string;
  amount: number;
  txHash?: string;
}) {
  try {
    const { data, error } = await supabase
      .from("post_purchases")
      .insert({
        buyer_id: params.buyerId,
        buyer_wallet: params.buyerWallet.toLowerCase(),
        post_id: params.postId,
        seller_id: params.sellerId,
        seller_wallet: params.sellerWallet.toLowerCase(),
        amount: params.amount,
        tx_hash: params.txHash || null,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in recordPostPurchase:", error);
    return { data: null, error };
  }
}
