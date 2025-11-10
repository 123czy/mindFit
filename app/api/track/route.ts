import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  analyticsEventPayloadSchema,
  type AnalyticsEventPayload,
} from "@/lib/analytics/types"

const requestSchema = z.object({
  events: z.array(analyticsEventPayloadSchema).min(1).max(100),
})

export async function POST(request: Request) {
  let payload: { events: AnalyticsEventPayload[] }
  try {
    const json = await request.json()
    payload = requestSchema.parse(json)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "invalid_payload" },
      { status: 400 }
    )
  }

  const rows = payload.events.map((event) => ({
    event_name: event.event_name,
    ap_name: event.ap_name,
    refer: event.refer,
    action_type: event.action_type ?? null,
    user_id: event.user_id,
    device_id: event.device_id,
    platform: event.platform,
    version: event.version,
    time: new Date(event.time).toISOString(),
    items: event.items ?? [],
    extra: event.extra ?? null,
  }))

  try {
    const { error } = await supabaseAdmin.from("analytics_events").insert(rows)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Analytics] Failed to persist events", error)
    return NextResponse.json(
      { success: false, error: "storage_error" },
      { status: 503 }
    )
  }
}
