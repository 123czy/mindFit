import { supabase } from "../client";
import type { Database } from "../types";

type User = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

/**
 * Get or create user by wallet address
 */
export async function getOrCreateUser(walletAddress: string) {
  try {
    // Try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (existingUser) {
      return { data: existingUser, error: null };
    }

    // Create new user if not exists
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        username: `user_${walletAddress.slice(2, 8)}`,
      })
      .select()
      .single();

    if (createError) {
      return { data: null, error: createError };
    }

    return { data: newUser, error: null };
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    return { data: null, error };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in getUserById:", error);
    return { data: null, error };
  }
}

/**
 * Get user by wallet address
 */
export async function getUserByWallet(walletAddress: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in getUserByWallet:", error);
    return { data: null, error };
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in getUserByUsername:", error);
    return { data: null, error };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: UserUpdate) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return { data: null, error };
  }
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailable(username: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    // If no data found, username is available
    return { available: !data, error: null };
  } catch (error) {
    return { available: true, error: null };
  }
}
