import { NextResponse } from "next/server"
import { clearAccessTokenCookie } from "@/lib/server/auth-cookies"

export async function POST() {
  const response = NextResponse.json({ success: true })
  clearAccessTokenCookie(response)
  return response
}

