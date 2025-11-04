import { NextRequest, NextResponse } from "next/server";

// 生成 Google OAuth 授权 URL
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${
      process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    }/api/auth/google/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth client ID not configured" },
        { status: 500 }
      );
    }

    // 生成 state 参数用于 CSRF 保护
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const scope = "openid email profile";

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    // 将 state 存储到 cookie（实际应该存储到 session 或 Redis）
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 分钟
    });

    return response;
  } catch (error: any) {
    console.error("Error generating Google OAuth URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}
