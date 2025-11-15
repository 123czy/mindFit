import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE =
  process.env.ACCESS_TOKEN_COOKIE_NAME || "access_token";
const ACCESS_TOKEN_MAX_AGE = parseInt(
  process.env.ACCESS_TOKEN_MAX_AGE || "3600",
  10
);

const isProduction = process.env.NODE_ENV === "production";

export function setAccessTokenCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function clearAccessTokenCookie(response: NextResponse) {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAccessTokenFromRequest(): Promise<string | undefined> {
  const cookieStore = await cookies();
  console.log("cookieStore---", cookieStore);
  console.log("ACCESS_TOKEN_COOKIE---", ACCESS_TOKEN_COOKIE);
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}
