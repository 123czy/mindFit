import { NextRequest, NextResponse } from "next/server"
import { getPostsWithProductsSSR } from "@/lib/supabase/api/posts-server"

function parseTags(param: string | null): string[] | undefined {
  if (!param) return undefined
  return param
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get("limit") ?? "20")
  const offset = Number(searchParams.get("offset") ?? "0")
  const userId = searchParams.get("userId") || undefined
  const tags = parseTags(searchParams.get("tags"))

  try {
    const data = await getPostsWithProductsSSR({
      limit: Number.isNaN(limit) ? undefined : limit,
      offset: Number.isNaN(offset) ? undefined : offset,
      userId,
      tags,
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[Supabase Posts] Failed to load posts", error)
    return NextResponse.json(
      { error: error?.message || "Failed to load posts" },
      { status: 500 }
    )
  }
}

