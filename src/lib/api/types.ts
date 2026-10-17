/**
 * Typed response shapes for the mock API surface.
 * Kept in sync with docs/api-surface.md.
 */

export interface GeoLocation {
  country_code: string
  country_name: string
  continent_code: string
  city: string
  region: string
}

export interface MetaResponse {
  location: GeoLocation
}

export interface NotificationPreferences {
  receive_updates: boolean
  email_on_video_export: boolean
}

export interface UserProfileResponse {
  first_name: string
  last_name: string
  name: string
  email: string
  date_joined: string
  notification_preferences: NotificationPreferences
  default_image_model: string
  is_premium: boolean
  current_subscription: SubscriptionSummary | null
}

export interface SubscriptionSummary {
  plan: string
  renews_at: string
}

export interface CreditSummary {
  amount: number
  balance: number
}

/** localStorage "user" shape — also the get_user_details/ response (plus pusher_id). */
export interface UserDetailsResponse {
  user_id: number
  username: string
  email: string
  name: string
  user_brand_settings: Record<string, unknown>
  credit_summary: CreditSummary
  is_premium: boolean
  default_image_model: string
  pusher_id: string
}

export interface UserUsageStatsResponse {
  credits_used: number
  stories_exported: number
  successful_mini_app_requests: number
}

export interface StorySummary {
  id: number
  title: string
  created_at: string
  updated_at: string
  status: 'draft' | 'generating' | 'ready' | 'failed'
  thumbnail_url: string | null
}

/** DRF-style pagination envelope used by story/ list requests. */
export interface PaginatedStories {
  count: number
  next: string | null
  previous: string | null
  results: StorySummary[]
}
