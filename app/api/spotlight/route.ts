import { NextRequest, NextResponse } from "next/server"
import { getSpotlightPosts } from "@/lib/supabase/api/spotlight"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get("limit")
  const limit = Number(limitParam ?? "6")

  const { data, error } = await getSpotlightPosts(Number.isNaN(limit) ? 6 : limit)

  if (error) {
    const message = typeof error === "string" ? error : error?.message || "Failed to load spotlight posts"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

