import { NextRequest, NextResponse } from "next/server"
import { hasUserPurchasedProduct } from "@/lib/supabase/api/purchases"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const buyerId = searchParams.get("buyerId")
  const productId = searchParams.get("productId")

  if (!buyerId || !productId) {
    return NextResponse.json(
      { error: "buyerId and productId are required" },
      { status: 400 }
    )
  }

  const { hasPurchased, error } = await hasUserPurchasedProduct(buyerId, productId)

  if (error) {
    const message = typeof error === "string" ? error : error?.message || "Failed to check purchase"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ data: { hasPurchased } })
}

