import { NextRequest, NextResponse } from "next/server"
import { createProduct, getProducts } from "@/lib/supabase/api/products"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get("limit") ?? "20")
  const offset = Number(searchParams.get("offset") ?? "0")
  const userId = searchParams.get("userId") || undefined
  const category = searchParams.get("category") || undefined
  const isActiveParam = searchParams.get("isActive")
  const isActive =
    isActiveParam === null ? undefined : isActiveParam === "true" || isActiveParam === "1"

  const { data, error } = await getProducts({
    limit: Number.isNaN(limit) ? undefined : limit,
    offset: Number.isNaN(offset) ? undefined : offset,
    userId,
    category,
    isActive,
  })

  if (error) {
    const message = typeof error === "string" ? error : error?.message || "Failed to load products"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const payload = await request.json()

  const { data, error } = await createProduct(payload)

  if (error) {
    const message = typeof error === "string" ? error : error?.message || "Failed to create product"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json({ data })
}

