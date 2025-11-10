import { z } from "zod"
import type { Json } from "@/lib/supabase/types"

export const analyticsItemSchema = z.object({
  item_type: z.string(),
  item_value: z.string(),
  item_meta: z.record(z.any()).optional(),
})

export type AnalyticsItem = z.infer<typeof analyticsItemSchema>

export const analyticsReferSchema = z.enum([
  "home",
  "post_detail",
  "product_detail",
  "publish",
  "notifications",
  "profile",
  "search",
  "other",
])

export type AnalyticsRefer = z.infer<typeof analyticsReferSchema>

export const analyticsEventInputSchema = z.object({
  event_name: z.string(),
  ap_name: z.string(),
  refer: analyticsReferSchema.optional(),
  action_type: z.string().optional(),
  time: z.number().optional(),
  items: z.array(analyticsItemSchema).optional(),
  extra: z.record(z.any()).optional(),
})

export type AnalyticsEventInput = z.infer<typeof analyticsEventInputSchema>

export const analyticsEventPayloadSchema = analyticsEventInputSchema.extend({
  refer: analyticsReferSchema,
  user_id: z.string(),
  device_id: z.string(),
  platform: z.string(),
  version: z.string(),
  time: z.number(),
  items: z.array(analyticsItemSchema).default([]),
})

export type AnalyticsEventPayload = z.infer<typeof analyticsEventPayloadSchema>

export type AnalyticsEventRecord = Omit<AnalyticsEventPayload, "time"> & {
  time: string
  extra?: Json
}
