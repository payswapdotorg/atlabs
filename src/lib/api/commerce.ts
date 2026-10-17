/**
 * Commerce mock API surface (WO-4).
 *
 * Extends — does not rewrite — the client in `src/lib/api/index.ts`.
 * Commerce endpoints live here with their own fixtures and a shared
 * ~250ms simulated latency so pages can build honest loading states.
 *
 * Shapes reproduce the captured live payloads:
 *
 *   GET payments/subscriptions/meta/  → { provider, credit_purchase_provider, will_require_confirmation }
 *   GET get_products_prices/          → Plan[] (PRO / PLUS / FREE with monthly+annual plans)
 *   GET credits/packages/             → CreditPackage[] (six add-on packs)
 *   GET credits_summary/              → { remaining_credits, total_credits, expiring_text, buckets, breakdown }
 *   GET|PUT user_profile/             → AccountProfile
 *
 * Mutations (pack purchase, subscribe, redeem, onboarding save) mutate the
 * in-memory fixtures, persist the mock user's credit_summary / is_premium to
 * the localStorage "user" auth store, and emit `atlabs:user-updated` so the
 * commerce pages can re-read state without a reload.
 */

import type { NotificationPreferences, SubscriptionSummary } from './types'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type BillingCycle = 'monthly' | 'annual'
export type PlanType = 'FREE' | 'PRO' | 'PLUS'

export interface PaymentsMeta {
  provider: string
  credit_purchase_provider: string
  will_require_confirmation: boolean
}

export interface PlanPrice {
  id: number
  slug: string
  billing_cycle: BillingCycle
  amount: number
  currency: string
  currency_symbol: string
  credits: number
  credit_level: string
  bonus_grants: number
}

export interface Plan {
  id: number
  name: string
  type: PlanType
  order: number
  is_active: boolean
  highlight_text: string
  features: string[]
  included_support_calls: number
  recommended_upgrade: number
  plans: PlanPrice[]
}

export interface CreditPackage {
  id: number
  credits: number
  base_price: number
  discount_amount: number
  price: number
  currency: string
  currency_symbol: string
}

export interface CreditBucket {
  pool_id: number
  name: string
  description: string
  balance: number
  granted: number
  used: number
  expiring_credits: number
  expires_at: string | null
  is_unlimited: boolean
  service_keys: string[]
}

export interface CreditsSummary {
  remaining_credits: number
  total_credits: number
  expiring_text: string
  buckets: CreditBucket[]
  breakdown: {
    total: number
    buckets: CreditBucket[]
  }
}

/**
 * Extended profile shape captured from the live user_profile/ endpoint.
 * Supersedes the leaner UserProfileResponse sketch in docs/api-surface.md —
 * adds company / phone / referral fields while keeping the shared keys.
 */
export interface AccountProfile {
  first_name: string
  last_name: string
  name: string
  email: string
  company: string
  phone: string
  dial_code: string
  how_did_you_hear_about_us: string
  referred_by_name: string
  date_joined: string
  notification_preferences: NotificationPreferences
  default_image_model: string
  scene_pace_preference: string
  is_premium: boolean
  current_subscription: SubscriptionSummary | null
}

export interface AccountProfileUpdate {
  first_name?: string
  last_name?: string
  company?: string
  phone?: string
  dial_code?: string
  how_did_you_hear_about_us?: string
  referred_by_name?: string
  notification_preferences?: NotificationPreferences
}

export interface OnboardingPreferencesPayload {
  first_name?: string
  last_name?: string
  company?: string
  default_image_model?: string
  scene_pace_preference?: string
  notification_preferences?: NotificationPreferences
}

export interface RedeemResult {
  ok: boolean
  message: string
  credits_granted: number
}

/* ------------------------------------------------------------------ */
/* Latency helper                                                     */
/* ------------------------------------------------------------------ */

const COMMERCE_LATENCY_MS = 250

const withLatency = <T>(payload: T): Promise<T> =>
  new Promise((resolve) =>
    window.setTimeout(() => resolve(payload), COMMERCE_LATENCY_MS),
  )

/* ------------------------------------------------------------------ */
/* Auth-store sync (localStorage "user" + change event)               */
/* ------------------------------------------------------------------ */

/**
 * Fired whenever a commerce mutation changes the mock user. AppShell is not
 * owned by WO-4, so it does not subscribe yet — pages under /credits,
 * /subscribe and /redeem listen and refresh their local state.
 */
export const USER_UPDATED_EVENT = 'atlabs:user-updated'

interface StoredUserPatch {
  credit_summary?: { amount: number; balance: number }
  is_premium?: boolean
  default_image_model?: string
}

const syncAuthStoreUser = (patch: StoredUserPatch): void => {
  try {
    const raw = window.localStorage.getItem('user')
    if (!raw) return
    const user = JSON.parse(raw) as Record<string, unknown>
    const creditSummary = (user.credit_summary ?? {}) as Record<string, number>
    const next = {
      ...user,
      credit_summary: patch.credit_summary
        ? { ...creditSummary, ...patch.credit_summary }
        : creditSummary,
      is_premium: patch.is_premium ?? (user.is_premium as boolean),
      default_image_model:
        patch.default_image_model ?? (user.default_image_model as string),
    }
    window.localStorage.setItem('user', JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: next }))
  } catch {
    // No stored user (not signed in) — nothing to sync.
  }
}

/* ------------------------------------------------------------------ */
/* Fixtures — payments meta                                           */
/* ------------------------------------------------------------------ */

export const paymentsMetaFixture: PaymentsMeta = {
  provider: 'DODO',
  credit_purchase_provider: 'DODO',
  will_require_confirmation: false,
}

export const getPaymentsMeta = (): Promise<PaymentsMeta> =>
  withLatency(paymentsMetaFixture)

/* ------------------------------------------------------------------ */
/* Fixtures — products & prices (get_products_prices/)                */
/* ------------------------------------------------------------------ */

const PRO_FEATURES = [
  'Music to Video workflows (kids music / indie music etc.)',
  'Text to Video workflows (script to video / animated video etc.)',
  '30+ visual styles',
  '40+ languages',
  '300+ Ultra-realistic voices',
  'Access to 100+ AI models including Seedance 2.5 / H3 / GPT 2.5',
  'Auto animated Subtitles',
  'AI Motion & Lip Sync videos',
  'Add consistent Characters / Objects / Products',
  'Upto 5-min videos',
  'Export your videos (1080p)',
]

const PLUS_FEATURES = [
  'Everything in Pro +',
  'Train your own models',
  'Add Locations & maintain consistency',
  'Premium Explainer Videos',
  'Multi-Character Music Videos',
  'Clone & Customize Product Ads (upto 15s)',
  'Add emotions to AI Voices',
  'Upto 10-min videos',
  'Multi-Character Animated Videos',
  '200+ Ad Template Library',
]

const FREE_FEATURES = [
  '5 one-time trial credits',
  'Text to Video workflow (preview)',
  '30+ visual styles',
  '40+ languages',
  'Community support',
]

let PRODUCTS_FIXTURE: Plan[] = [
  {
    id: 0,
    name: 'Free',
    type: 'FREE',
    order: 0,
    is_active: true,
    highlight_text: '5 credits / one-time trial',
    features: FREE_FEATURES,
    included_support_calls: 0,
    recommended_upgrade: 1,
    plans: [
      {
        id: 900,
        slug: 'free',
        billing_cycle: 'monthly',
        amount: 0,
        currency: 'USD',
        currency_symbol: '$',
        credits: 5,
        credit_level: 'trial',
        bonus_grants: 0,
      },
    ],
  },
  {
    id: 1,
    name: 'Pro',
    type: 'PRO',
    order: 1,
    is_active: true,
    highlight_text: '350 credits / month',
    features: PRO_FEATURES,
    included_support_calls: 0,
    recommended_upgrade: 2,
    plans: [
      {
        id: 901,
        slug: 'pro-monthly',
        billing_cycle: 'monthly',
        amount: 39,
        currency: 'USD',
        currency_symbol: '$',
        credits: 4200,
        credit_level: 'standard',
        bonus_grants: 0,
      },
      {
        id: 902,
        slug: 'pro-annual',
        billing_cycle: 'annual',
        amount: 29,
        currency: 'USD',
        currency_symbol: '$',
        credits: 4200,
        credit_level: 'standard',
        bonus_grants: 0,
      },
    ],
  },
  {
    id: 2,
    name: 'Plus',
    type: 'PLUS',
    order: 2,
    is_active: true,
    highlight_text: '750 credits / month',
    features: PLUS_FEATURES,
    included_support_calls: 0,
    recommended_upgrade: 0,
    plans: [
      {
        id: 903,
        slug: 'plus-monthly',
        amount: 79,
        billing_cycle: 'monthly',
        currency: 'USD',
        currency_symbol: '$',
        credits: 9000,
        credit_level: 'standard',
        bonus_grants: 0,
      },
      {
        id: 904,
        slug: 'plus-annual',
        amount: 59,
        billing_cycle: 'annual',
        currency: 'USD',
        currency_symbol: '$',
        credits: 9000,
        credit_level: 'standard',
        bonus_grants: 0,
      },
    ],
  },
]

export const getProductsPrices = (): Promise<Plan[]> =>
  withLatency(PRODUCTS_FIXTURE.map((p) => ({ ...p, plans: [...p.plans] })))

/* ------------------------------------------------------------------ */
/* Fixtures — credit packages (credits/packages/)                     */
/* ------------------------------------------------------------------ */

const CREDIT_PACKAGES_FIXTURE: CreditPackage[] = [
  { id: 1, credits: 80, base_price: 10, discount_amount: 0, price: 10, currency: 'USD', currency_symbol: '$' },
  { id: 2, credits: 250, base_price: 31, discount_amount: 4, price: 27, currency: 'USD', currency_symbol: '$' },
  { id: 3, credits: 500, base_price: 62, discount_amount: 9, price: 53, currency: 'USD', currency_symbol: '$' },
  { id: 4, credits: 1000, base_price: 125, discount_amount: 27, price: 98, currency: 'USD', currency_symbol: '$' },
  { id: 5, credits: 3000, base_price: 375, discount_amount: 100, price: 275, currency: 'USD', currency_symbol: '$' },
  { id: 6, credits: 6000, base_price: 750, discount_amount: 225, price: 525, currency: 'USD', currency_symbol: '$' },
]

export const getCreditPackages = (): Promise<CreditPackage[]> =>
  withLatency(CREDIT_PACKAGES_FIXTURE.map((p) => ({ ...p })))

/** Percentage saved vs base price for a pack (0 when undiscounted). */
export const creditPackageSavePercent = (pack: CreditPackage): number =>
  pack.base_price > 0 && pack.discount_amount > 0
    ? Math.round((pack.discount_amount / pack.base_price) * 100)
    : 0

/* ------------------------------------------------------------------ */
/* Credits summary store (credits_summary/)                           */
/* ------------------------------------------------------------------ */

const nextYearIso = (): string => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
}

let CREDIT_POOLS: CreditBucket[] = []
let NEXT_POOL_ID = 1

const buildCreditsSummary = (): CreditsSummary => {
  const total = CREDIT_POOLS.reduce((sum, b) => sum + b.balance, 0)
  const granted = CREDIT_POOLS.reduce((sum, b) => sum + b.granted, 0)
  return {
    remaining_credits: total,
    total_credits: granted,
    expiring_text: '',
    buckets: [],
    breakdown: {
      total,
      buckets: CREDIT_POOLS.map((b) => ({ ...b })),
    },
  }
}

export const getCreditsSummary = (): Promise<CreditsSummary> =>
  withLatency(buildCreditsSummary())

const grantCreditPool = (
  name: string,
  description: string,
  credits: number,
  expiresInOneYear: boolean,
): CreditBucket => {
  const bucket: CreditBucket = {
    pool_id: NEXT_POOL_ID++,
    name,
    description,
    balance: credits,
    granted: credits,
    used: 0,
    expiring_credits: expiresInOneYear ? credits : 0,
    expires_at: expiresInOneYear ? nextYearIso() : null,
    is_unlimited: false,
    service_keys: ['video', 'image', 'voice'],
  }
  CREDIT_POOLS = [bucket, ...CREDIT_POOLS]
  return bucket
}

/* ------------------------------------------------------------------ */
/* Account profile store (user_profile/)                              */
/* ------------------------------------------------------------------ */

/**
 * Profile edits persist to localStorage ("atlabs:user-profile") so the
 * PUT flow survives reloads — same idea as the localStorage "user" auth
 * store, scoped to this module.
 */
const PROFILE_STORAGE_KEY = 'atlabs:user-profile'

const defaultProfile: AccountProfile = {
  first_name: 'yaslen',
  last_name: 'Catty',
  name: 'yaslen Catty',
  email: 'yaslencatty@gmail.com',
  company: '',
  phone: '',
  dial_code: '+1',
  how_did_you_hear_about_us: '',
  referred_by_name: '',
  date_joined: '2023-10-01',
  notification_preferences: {
    receive_updates: true,
    email_on_video_export: false,
  },
  default_image_model: 'MagicX',
  scene_pace_preference: 'Cinematic (slow)',
  is_premium: false,
  current_subscription: null,
}

const readStoredProfile = (): AccountProfile => {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return defaultProfile
    const stored = JSON.parse(raw) as Partial<AccountProfile>
    return {
      ...defaultProfile,
      ...stored,
      notification_preferences: {
        ...defaultProfile.notification_preferences,
        ...(stored.notification_preferences ?? {}),
      },
    }
  } catch {
    return defaultProfile
  }
}

const persistProfile = (): void => {
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(PROFILE_FIXTURE))
  } catch {
    // Storage unavailable — in-memory fixture still works for this session.
  }
}

let PROFILE_FIXTURE: AccountProfile = readStoredProfile()

export const getAccountProfile = (): Promise<AccountProfile> =>
  withLatency({ ...PROFILE_FIXTURE })

export const updateAccountProfile = (
  payload: AccountProfileUpdate,
): Promise<AccountProfile> => {
  const firstName = payload.first_name ?? PROFILE_FIXTURE.first_name
  const lastName = payload.last_name ?? PROFILE_FIXTURE.last_name
  PROFILE_FIXTURE = {
    ...PROFILE_FIXTURE,
    ...payload,
    name: `${firstName} ${lastName}`.trim(),
  }
  persistProfile()
  return withLatency({ ...PROFILE_FIXTURE })
}

export const saveOnboardingPreferences = (
  payload: OnboardingPreferencesPayload,
): Promise<AccountProfile> => {
  const firstName = payload.first_name ?? PROFILE_FIXTURE.first_name
  const lastName = payload.last_name ?? PROFILE_FIXTURE.last_name
  PROFILE_FIXTURE = {
    ...PROFILE_FIXTURE,
    ...payload,
    name: `${firstName} ${lastName}`.trim(),
  }
  if (payload.default_image_model) {
    syncAuthStoreUser({ default_image_model: payload.default_image_model })
  }
  persistProfile()
  return withLatency({ ...PROFILE_FIXTURE })
}

/* ------------------------------------------------------------------ */
/* Mutations — purchase pack / subscribe / redeem                     */
/* ------------------------------------------------------------------ */

/**
 * POST payments/subscriptions/credit-purchase/ — buy an add-on pack.
 * Fixture: grants a new one-year credit pool, updates the auth-store user's
 * credit_summary and returns the refreshed summary.
 */
export const purchaseCreditPack = (packageId: number): Promise<CreditsSummary> => {
  const pack = CREDIT_PACKAGES_FIXTURE.find((p) => p.id === packageId)
  if (!pack) {
    return Promise.reject(new Error(`Unknown credit package ${packageId}`))
  }
  grantCreditPool(
    'Add-on credits',
    `${pack.credits} credits purchased (${pack.currency_symbol}${pack.price})`,
    pack.credits,
    true,
  )
  const summary = buildCreditsSummary()
  syncAuthStoreUser({
    credit_summary: { amount: summary.remaining_credits, balance: summary.remaining_credits },
  })
  return withLatency(summary)
}

/**
 * POST payments/subscriptions/ — start (or change) a subscription.
 * Fixture: sets is_premium + current_subscription on the profile, grants the
 * plan's credit pool and updates the auth-store user.
 */
export const subscribeToPlan = (
  planType: PlanType,
  billingCycle: BillingCycle,
): Promise<AccountProfile> => {
  const plan = PRODUCTS_FIXTURE.find((p) => p.type === planType)
  if (!plan) {
    return Promise.reject(new Error(`Unknown plan ${planType}`))
  }
  const price = plan.plans.find((p) => p.billing_cycle === billingCycle) ?? plan.plans[0]
  const renewsAt = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()

  if (planType !== 'FREE') {
    grantCreditPool(
      `${plan.name} subscription credits`,
      `${price.credits.toLocaleString()} credits — ${plan.name} ${billingCycle}`,
      price.credits,
      true,
    )
  } else {
    grantCreditPool('Trial credits', 'Welcome trial — 5 credits', 5, false)
  }

  PROFILE_FIXTURE = {
    ...PROFILE_FIXTURE,
    is_premium: planType !== 'FREE',
    current_subscription: { plan: planType, renews_at: renewsAt },
  }
  persistProfile()
  const summary = buildCreditsSummary()
  syncAuthStoreUser({
    credit_summary: { amount: summary.remaining_credits, balance: summary.remaining_credits },
    is_premium: planType !== 'FREE',
  })
  return withLatency({ ...PROFILE_FIXTURE })
}

/** Fixture redeem codes → granted credits. */
export const REDEEM_CODES: Record<string, number> = {
  'ATLABS-WELCOME': 10,
}

const REDEEMED_KEY = 'atlabs:redeemed-codes'

const readRedeemedCodes = (): string[] => {
  try {
    const raw = window.localStorage.getItem(REDEEMED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/**
 * POST credits/redeem/ — redeem a promo code.
 * Fixture: "ATLABS-WELCOME" grants 10 credits once per browser; anything
 * else (or a double redemption) returns ok:false with an error message.
 */
export const redeemCode = (rawCode: string): Promise<RedeemResult> => {
  const code = rawCode.trim().toUpperCase()
  const granted = REDEEM_CODES[code]
  if (!granted) {
    return withLatency({
      ok: false,
      message: 'Invalid code. Please check the code and try again.',
      credits_granted: 0,
    })
  }
  const redeemed = readRedeemedCodes()
  if (redeemed.includes(code)) {
    return withLatency({
      ok: false,
      message: 'This code has already been redeemed on this account.',
      credits_granted: 0,
    })
  }
  window.localStorage.setItem(REDEEMED_KEY, JSON.stringify([...redeemed, code]))
  grantCreditPool('Redeemed credits', `Promo code ${code}`, granted, true)
  const summary = buildCreditsSummary()
  syncAuthStoreUser({
    credit_summary: { amount: summary.remaining_credits, balance: summary.remaining_credits },
  })
  return withLatency({
    ok: true,
    message: `Success — ${granted} credits have been added to your balance.`,
    credits_granted: granted,
  })
}
