import { NextRequest, NextResponse } from "next/server"
import { createPost, getPostsWithProducts } from "@/lib/supabase/api/posts"

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

  const { data, error } = await getPostsWithProducts({
    limit: Number.isNaN(limit) ? undefined : limit,
    offset: Number.isNaN(offset) ? undefined : offset,
    userId,
    tags,
  })

  if (error) {
    const message = typeof error === "string" ? error : error?.message || "Failed to load posts"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const payload = await request.json()

  const { data, error } = await createPost(payload)

  if (error) {
    const message = typeof error === "string" ? error : error?.message || "Failed to create post"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json({ data })
}

