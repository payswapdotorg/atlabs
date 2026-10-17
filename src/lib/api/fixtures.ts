import type {
  MetaResponse,
  UserDetailsResponse,
  UserProfileResponse,
  UserUsageStatsResponse,
  PaginatedStories,
} from './types'

/**
 * Fixture data for the mock API surface. Values reproduce the shapes
 * documented in docs/api-surface.md.
 */

export const metaFixture: MetaResponse = {
  location: {
    country_code: 'US',
    country_name: 'United States',
    continent_code: 'NA',
    city: 'San Francisco',
    region: 'California',
  },
}

export const userProfileFixture: UserProfileResponse = {
  first_name: 'yaslen',
  last_name: 'Catty',
  name: 'yaslen Catty',
  email: 'yaslencatty@gmail.com',
  date_joined: '2023-10-01',
  notification_preferences: {
    receive_updates: true,
    email_on_video_export: false,
  },
  default_image_model: 'MagicX',
  is_premium: false,
  current_subscription: null,
}

export const userDetailsFixture: UserDetailsResponse = {
  user_id: 179398,
  username: 'yaslencatty@gmail.com',
  email: 'yaslencatty@gmail.com',
  name: 'yaslen Catty',
  user_brand_settings: {},
  credit_summary: {
    amount: 0,
    balance: 0,
  },
  is_premium: false,
  default_image_model: 'MagicX',
  pusher_id: '1234567890',
}

export const userUsageStatsFixture: UserUsageStatsResponse = {
  credits_used: 0,
  stories_exported: 0,
  successful_mini_app_requests: 0,
}

export const emptyStoriesFixture: PaginatedStories = {
  count: 0,
  next: null,
  previous: null,
  results: [],
}
