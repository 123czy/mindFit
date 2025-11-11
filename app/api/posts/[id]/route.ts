import { NextRequest, NextResponse } from "next/server"
import { getPostById } from "@/lib/supabase/api/posts"
import { getProductsByPostId } from "@/lib/supabase/api/products"

interface RouteParams {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = params

  const [{ data: post, error: postError }, { data: products, error: productsError }] =
    await Promise.all([getPostById(id), getProductsByPostId(id)])

  if (postError || !post) {
    const message =
      typeof postError === "string" ? postError : postError?.message || "Post not found"
    return NextResponse.json({ error: message }, { status: 404 })
  }

  if (productsError) {
    const message =
      typeof productsError === "string"
        ? productsError
        : productsError?.message || "Failed to load products"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      post,
      products: products || [],
    },
  })
}
