import { supabase } from "../client";
import type { Database } from "../types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export interface CreateProductParams {
  userId: string;
  walletAddress: string;
  postId?: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  fileUrl?: string;
  category?: string;
  stock?: number;
  chain_product_id?: number;
  work_id?: string | null;
  contentData?: {
    exampleImages?: string[];
    guidance?: string;
    examplePrompts?: Array<{
      imageUrl: string;
      prompt: string;
    }>;
  };
}

/**
 * Create a new product
 */
export async function createProduct(params: CreateProductParams) {
  try {
    const productData: any = {
      user_id: params.userId,
      wallet_address: params.walletAddress.toLowerCase(),
      post_id: params.postId || null,
      name: params.name,
      description: params.description,
      price: params.price,
      currency: params.currency || "mUSDT",
      image_url: params.imageUrl || null,
      file_url: params.fileUrl || null,
      category: params.category || null,
      stock: params.stock || null,
      is_active: true,
      chain_product_id: params.chain_product_id,
      work_id: params.work_id || null,
    };

    // 如果有 contentData，添加到 productData 中
    if (params.contentData) {
      productData.content_data = params.contentData;
    }

    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return { data: null, error };
  }
}

/**
 * Get products with pagination
 */
export async function getProducts(options?: {
  limit?: number;
  offset?: number;
  userId?: string;
  category?: string;
  isActive?: boolean;
}) {
  try {
    let query = supabase
      .from("products")
      .select("*, users!inner(username, avatar_url, wallet_address)")
      .order("created_at", { ascending: false });

    if (options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    if (options?.category) {
      query = query.eq("category", options.category);
    }

    if (options?.isActive !== undefined) {
      query = query.eq("is_active", options.isActive);
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
    console.error("Error in getProducts:", error);
    return { data: null, error };
  }
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, users!inner(id, username, avatar_url, wallet_address)")
      .eq("id", productId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in getProductById:", error);
    return { data: null, error };
  }
}

/**
 * Get products by post ID
 */
export async function getProductsByPostId(postId: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, users!inner(username, avatar_url, wallet_address)")
      .eq("post_id", postId) // 修复：应该是 post_id 而不是 id
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Error in getProductsByPostId:", error);
    return { data: null, error };
  }
}

/**
 * Batch get products by post IDs (优化：一次性获取多个 post 的 products)
 */
export async function getProductsByPostIds(postIds: string[]) {
  try {
    if (postIds.length === 0) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, users!inner(username, avatar_url, wallet_address)")
      .in("post_id", postIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    console.error("Error in getProductsByPostIds:", error);
    return { data: [], error };
  }
}

/**
 * Update product
 */
export async function updateProduct(productId: string, updates: ProductUpdate) {
  try {
    // @ts-ignore - Supabase type issue
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return { data: null, error };
  }
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string) {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    return { error };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return { error };
  }
}

/**
 * Increment product sales count
 */
export async function incrementSalesCount(productId: string) {
  try {
    const { data: product } = await supabase
      .from("products")
      .select("sales_count")
      .eq("id", productId)
      .single();

    if (product) {
      // @ts-ignore - Supabase type issue
      await supabase
        .from("products")
        .update({ sales_count: (product as any).sales_count + 1 })
        .eq("id", productId);
    }

    return { error: null };
  } catch (error) {
    console.error("Error in incrementSalesCount:", error);
    return { error };
  }
}

/**
 * Update product stock
 */
export async function updateProductStock(
  productId: string,
  quantityChange: number
) {
  try {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();

    if (product && (product as any).stock !== null) {
      const newStock = (product as any).stock + quantityChange;
      // @ts-ignore - Supabase type issue
      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", productId);
    }

    return { error: null };
  } catch (error) {
    console.error("Error in updateProductStock:", error);
    return { error };
  }
}
