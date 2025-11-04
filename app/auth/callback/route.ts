import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Google OAuth 回调处理
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // Supabase 会自动处理 OAuth 回调
    // 这里主要用于重定向到前端
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=oauth_error", request.url)
      );
    }

    // 重定向到首页或原来的页面
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
