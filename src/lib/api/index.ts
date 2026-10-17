/**
 * Mock API client for the Atlabs frontend.
 *
 * Every network call in the app goes through this module (see AGENTS.md —
 * pages never hardcode raw fetch URLs). Endpoints return typed fixtures
 * after ~200ms of simulated latency so loading/error states can be built
 * and exercised before the real backend is wired in.
 *
 * The endpoint inventory and response shapes are documented in
 * docs/api-surface.md.
 */

import type {
  MetaResponse,
  UserDetailsResponse,
  UserProfileResponse,
  UserUsageStatsResponse,
  PaginatedStories,
} from './types'
import {
  metaFixture,
  userProfileFixture,
  userDetailsFixture,
  userUsageStatsFixture,
  emptyStoriesFixture,
} from './fixtures'

export type {
  MetaResponse,
  GeoLocation,
  UserProfileResponse,
  NotificationPreferences,
  SubscriptionSummary,
  CreditSummary,
  UserDetailsResponse,
  UserUsageStatsResponse,
  StorySummary,
  PaginatedStories,
} from './types'

/** Simulated network latency applied to every mock call. */
const MOCK_LATENCY_MS = 200

const withLatency = <T>(payload: T): Promise<T> =>
  new Promise((resolve) =>
    window.setTimeout(() => resolve(payload), MOCK_LATENCY_MS),
  )

/** GET meta/ — request-scoped geo metadata. */
export const getMeta = (): Promise<MetaResponse> => withLatency(metaFixture)

/** GET user_profile/ — editable profile fields + preferences. */
export const getUserProfile = (): Promise<UserProfileResponse> =>
  withLatency(userProfileFixture)

/** GET get_user_details/ — localStorage "user" shape plus pusher_id. */
export const getUserDetails = (): Promise<UserDetailsResponse> =>
  withLatency(userDetailsFixture)

/** GET get_user_usage_stats/ — lifetime usage counters. */
export const getUserUsageStats = (): Promise<UserUsageStatsResponse> =>
  withLatency(userUsageStatsFixture)

/** GET story/?page=<n>&page_size=<n> — DRF-paginated story list. */
export const getStories = (
  _page = 1,
  _pageSize = 5,
): Promise<PaginatedStories> => withLatency(emptyStoriesFixture)
