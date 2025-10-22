import { supabase } from "../client";
import type { Database } from "../types";
import { incrementSalesCount, updateProductStock } from "./products";

type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
type PurchaseInsert = Database["public"]["Tables"]["purchases"]["Insert"];

export interface CreatePurchaseParams {
  buyerId: string;
  buyerWallet: string;
  productId: string;
  sellerId: string;
  sellerWallet: string;
  amount: number;
  currency?: string;
  txHash?: string;
}

/**
 * Create a new purchase record
 */
export async function createPurchase(params: CreatePurchaseParams) {
  try {
    const purchaseData: PurchaseInsert = {
      buyer_id: params.buyerId,
      buyer_wallet: params.buyerWallet.toLowerCase(),
      product_id: params.productId,
      seller_id: params.sellerId,
      seller_wallet: params.sellerWallet.toLowerCase(),
      amount: params.amount,
      currency: params.currency || "mUSDT",
      tx_hash: params.txHash || null,
      status: "pending",
    };

    const { data, error } = await supabase
      .from("purchases")
      .insert(purchaseData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in createPurchase:", error);
    return { data: null, error };
  }
}

/**
 * Complete a purchase (update status and increment counters)
 */
export async function completePurchase(purchaseId: string, txHash?: string) {
  try {
    // Update purchase status
    const { data: purchase, error: updateError } = await supabase
      .from("purchases")
      .update({
        status: "completed",
        tx_hash: txHash || null,
      })
      .eq("id", purchaseId)
      .select()
      .single();

    if (updateError || !purchase) {
      return { data: null, error: updateError };
    }

    // Increment product sales count
    await incrementSalesCount(purchase.product_id);

    // Decrease product stock by 1 if applicable
    await updateProductStock(purchase.product_id, -1);

    return { data: purchase, error: null };
  } catch (error) {
    console.error("Error in completePurchase:", error);
    return { data: null, error };
  }
}

/**
 * Fail a purchase
 */
export async function failPurchase(purchaseId: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from("purchases")
      .update({
        status: "failed",
      })
      .eq("id", purchaseId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in failPurchase:", error);
    return { data: null, error };
  }
}

/**
 * Get purchases by buyer
 */
export async function getPurchasesByBuyer(
  buyerId: string,
  options?: { limit?: number; offset?: number }
) {
  try {
    let query = supabase
      .from("purchases")
      .select(
        "*, products!inner(name, description, price, image_url), users!purchases_seller_id_fkey(username, avatar_url)"
      )
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false });

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
    console.error("Error in getPurchasesByBuyer:", error);
    return { data: null, error };
  }
}

/**
 * Get purchases by seller
 */
export async function getPurchasesBySeller(
  sellerId: string,
  options?: { limit?: number; offset?: number }
) {
  try {
    let query = supabase
      .from("purchases")
      .select(
        "*, products!inner(name, description, price, image_url), users!purchases_buyer_id_fkey(username, avatar_url, wallet_address)"
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

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
    console.error("Error in getPurchasesBySeller:", error);
    return { data: null, error };
  }
}

/**
 * Get purchase by ID
 */
export async function getPurchaseById(purchaseId: string) {
  try {
    const { data, error } = await supabase
      .from("purchases")
      .select(
        "*, products!inner(*), users!purchases_buyer_id_fkey(username, avatar_url, wallet_address)"
      )
      .eq("id", purchaseId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in getPurchaseById:", error);
    return { data: null, error };
  }
}

/**
 * Check if user has purchased a product
 */
export async function hasUserPurchasedProduct(
  buyerId: string,
  productId: string
) {
  try {
    const { data, error } = await supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", buyerId)
      .eq("product_id", productId)
      .eq("status", "completed")
      .single();

    return { hasPurchased: !!data, error };
  } catch (error) {
    return { hasPurchased: false, error: null };
  }
}

/**
 * Get purchase statistics for a user
 */
export async function getUserPurchaseStats(userId: string) {
  try {
    // Get total purchases as buyer
    const { count: buyCount } = await supabase
      .from("purchases")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", userId)
      .eq("status", "completed");

    // Get total sales as seller
    const { count: sellCount } = await supabase
      .from("purchases")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", userId)
      .eq("status", "completed");

    // Get total spend as buyer
    const { data: purchases } = await supabase
      .from("purchases")
      .select("amount")
      .eq("buyer_id", userId)
      .eq("status", "completed");

    const totalSpend =
      purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Get total revenue as seller
    const { data: sales } = await supabase
      .from("purchases")
      .select("amount")
      .eq("seller_id", userId)
      .eq("status", "completed");

    const totalRevenue =
      sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

    return {
      data: {
        totalPurchases: buyCount || 0,
        totalSales: sellCount || 0,
        totalSpend,
        totalRevenue,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in getUserPurchaseStats:", error);
    return {
      data: {
        totalPurchases: 0,
        totalSales: 0,
        totalSpend: 0,
        totalRevenue: 0,
      },
      error,
    };
  }
}
