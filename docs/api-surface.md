# Atlabs mock API surface

All app network access goes through `src/lib/api/` (typed client + fixtures).
Pages never hardcode raw fetch URLs — this is a review-level rule (see
AGENTS.md, "Mock data discipline").

Until the real backend is wired, every call below resolves against an
in-repo fixture after **~200 ms of simulated latency** so loading, empty
and error states can be built and exercised honestly.

## Endpoints

### `meta/` → `getMeta(): Promise<MetaResponse>`

Request-scoped geo metadata derived from the caller IP.

```json
{
  "location": {
    "country_code": "US",
    "country_name": "United States",
    "continent_code": "NA",
    "city": "San Francisco",
    "region": "California"
  }
}
```

### `user_profile/` → `getUserProfile(): Promise<UserProfileResponse>`

Editable profile fields and preferences for the signed-in user.

```json
{
  "first_name": "yaslen",
  "last_name": "Catty",
  "name": "yaslen Catty",
  "email": "yaslencatty@gmail.com",
  "date_joined": "2023-10-01",
  "notification_preferences": {
    "receive_updates": true,
    "email_on_video_export": false
  },
  "default_image_model": "MagicX",
  "is_premium": false,
  "current_subscription": null
}
```

`current_subscription` is `null` for free users; for subscribed users the
shape is `{ "plan": "<plan id>", "renews_at": "<ISO date>" }` (typed as
`SubscriptionSummary`).

### `get_user_details/` → `getUserDetails(): Promise<UserDetailsResponse>`

The same object that is persisted in `localStorage` under the `"user"` key
(see `src/lib/auth.tsx`), plus the realtime channel id.

```json
{
  "user_id": 179398,
  "username": "yaslencatty@gmail.com",
  "email": "yaslencatty@gmail.com",
  "name": "yaslen Catty",
  "user_brand_settings": {},
  "credit_summary": { "amount": 0, "balance": 0 },
  "is_premium": false,
  "default_image_model": "MagicX",
  "pusher_id": "1234567890"
}
```

### `get_user_usage_stats/` → `getUserUsageStats(): Promise<UserUsageStatsResponse>`

Lifetime usage counters.

```json
{
  "credits_used": 0,
  "stories_exported": 0,
  "successful_mini_app_requests": 0
}
```

### `story/?page=1&page_size=5` → `getStories(page, pageSize): Promise<PaginatedStories>`

Django REST Framework pagination envelope for the user's stories.

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

Each item in `results` is a `StorySummary`:

```json
{
  "id": 1,
  "title": "My first film",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z",
  "status": "draft | generating | ready | failed",
  "thumbnail_url": null
}
```

## Conventions

- Every exported function returns a typed promise (`src/lib/api/types.ts`).
- Latency is applied by the shared `withLatency` helper — 200 ms today.
- Fixtures live in `src/lib/api/fixtures.ts`; extend them there, not in pages.
- When the real backend lands, replace the fixture reads inside
  `src/lib/api/index.ts` with fetch calls of the same signature.
