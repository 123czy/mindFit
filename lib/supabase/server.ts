/**
 * 服务器端 Supabase 客户端
 * 用于 SSR 和 Server Components
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

/**
 * 创建服务器端 Supabase 客户端
 * 在 Server Component 或 Server Action 中使用
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  // 从 cookie 中获取 session（如果有）
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });
}

/**
 * 获取服务器端 Supabase 客户端（单例模式）
 * 注意：每次请求都会创建新的客户端实例
 */
export async function getServerSupabase() {
  return createServerClient();
}
