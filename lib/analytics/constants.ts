export const ANALYTICS_STORAGE_KEY = "mindfit_analytics_queue"
export const ANALYTICS_DEVICE_KEY = "mindfit_device_id"
export const ANALYTICS_BATCH_SIZE = 10
export const ANALYTICS_FLUSH_INTERVAL = 3000
export const ANALYTICS_ENDPOINT = "/api/track"
export const ANALYTICS_DEBUG =
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true"
