import { NextRequest, NextResponse } from "next/server"
import { getProductById } from "@/lib/supabase/api/products"

interface RouteParams {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = params

  const { data, error } = await getProductById(id)

  if (error || !data) {
    const message = typeof error === "string" ? error : error?.message || "Product not found"
    return NextResponse.json({ error: message }, { status: 404 })
  }

  return NextResponse.json({ data })
}
