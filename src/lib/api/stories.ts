/**
 * Story-related mock API surface (WO-2 creation core).
 *
 * Extends — does not rewrite — the client in `src/lib/api/index.ts`:
 * story endpoints live here with their own fixtures and a shared
 * ~300ms simulated latency so pages can build honest loading states.
 *
 * Shapes follow the WO-2 brief (supersedes the older StorySummary sketch
 * in docs/api-surface.md):
 *
 *   GET story/?page=<n>&page_size=<n>&state=<state>
 *     → { count, next, previous, results: Story[] }
 *
 *   Story = {
 *     id, title, status: 'DRAFT'|'GENERATING'|'COMPLETED'|'EDITOR',
 *     thumbnail_url, created_at, updated_at, credits_used,
 *     duration_seconds, workflow_type: 'SCRIPT'|'SONG'|'CAPTIONS'
 *   }
 */

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type StoryStatus = 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'EDITOR'
export type WorkflowType = 'SCRIPT' | 'SONG' | 'CAPTIONS'

export interface Story {
  id: number
  title: string
  status: StoryStatus
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  credits_used: number
  duration_seconds: number
  workflow_type: WorkflowType
}

/** DRF-style pagination envelope for story/ list requests. */
export interface PaginatedStories {
  count: number
  next: string | null
  previous: string | null
  results: Story[]
}

export interface Shot {
  id: number
  index: number
  description: string
  duration_seconds: number
  thumbnail_url: string | null
}

export interface TranscriptEntry {
  id: number
  start_seconds: number
  end_seconds: number
  speaker: string
  text: string
}

export interface StoryDetail extends Story {
  description: string
  style: string
  language: string
  voice: string
  scene_pace: string
  shots: Shot[]
  transcript: TranscriptEntry[]
  versions: string[]
}

/** Payload accepted by createStory (script wizard step 1-3 state). */
export interface CreateStoryPayload {
  title?: string
  script: string
  style: string
  language: string
  voice: string
  scene_pace: string
  characters?: Array<{
    name: string
    gender: string
    age: string
    ethnicity: string
    description: string
  }>
  workflow_type?: WorkflowType
  song_name?: string
  lyrics?: string
}

/* ------------------------------------------------------------------ */
/* Latency helper                                                     */
/* ------------------------------------------------------------------ */

const STORY_LATENCY_MS = 300

const withLatency = <T>(payload: T): Promise<T> =>
  new Promise((resolve) =>
    window.setTimeout(() => resolve(payload), STORY_LATENCY_MS),
  )

/* ------------------------------------------------------------------ */
/* Fixture thumbnails — inline SVG data URIs (offline-safe)           */
/* ------------------------------------------------------------------ */

const thumb = (from: string, to: string, glyph: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="160" cy="90" r="30" fill="rgba(255,255,255,0.85)"/><path d="M152 76 L152 104 L174 90 Z" fill="${to}"/><text x="160" y="150" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="rgba(255,255,255,0.92)">${glyph}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/* ------------------------------------------------------------------ */
/* In-memory story store (fixtures)                                   */
/* ------------------------------------------------------------------ */

const hoursAgo = (h: number): string =>
  new Date(Date.now() - h * 3600 * 1000).toISOString()

let STORIES: Story[] = [
  {
    id: 101,
    title: 'The Lighthouse Keeper',
    status: 'COMPLETED',
    thumbnail_url: thumb('#f5c518', '#b45309', 'Realistic Drama'),
    created_at: hoursAgo(72),
    updated_at: hoursAgo(4),
    credits_used: 48,
    duration_seconds: 184,
    workflow_type: 'SCRIPT',
  },
  {
    id: 102,
    title: 'Milo Learns the Moon Song',
    status: 'COMPLETED',
    thumbnail_url: thumb('#7dd3fc', '#4338ca', "Kids' Edutainment"),
    created_at: hoursAgo(96),
    updated_at: hoursAgo(20),
    credits_used: 36,
    duration_seconds: 132,
    workflow_type: 'SONG',
  },
  {
    id: 103,
    title: 'Sunday Service — Grace Title Reel',
    status: 'GENERATING',
    thumbnail_url: null,
    created_at: hoursAgo(28),
    updated_at: hoursAgo(0.4),
    credits_used: 0,
    duration_seconds: 0,
    workflow_type: 'SONG',
  },
  {
    id: 104,
    title: 'Paper Planes — Explainer Draft',
    status: 'DRAFT',
    thumbnail_url: null,
    created_at: hoursAgo(50),
    updated_at: hoursAgo(26),
    credits_used: 0,
    duration_seconds: 0,
    workflow_type: 'SCRIPT',
  },
  {
    id: 105,
    title: 'Neon Market Chase',
    status: 'EDITOR',
    thumbnail_url: thumb('#fda4af', '#7f1d1d', 'Anime Cel'),
    created_at: hoursAgo(120),
    updated_at: hoursAgo(9),
    credits_used: 61,
    duration_seconds: 210,
    workflow_type: 'SCRIPT',
  },
  {
    id: 106,
    title: 'Product Launch — Captions Cut',
    status: 'COMPLETED',
    thumbnail_url: thumb('#86efac', '#14532d', 'Burned-in Captions'),
    created_at: hoursAgo(200),
    updated_at: hoursAgo(48),
    credits_used: 12,
    duration_seconds: 95,
    workflow_type: 'CAPTIONS',
  },
]

const nextStoryId = (): number => Math.max(...STORIES.map((s) => s.id), 100) + 1

/* ------------------------------------------------------------------ */
/* Story detail fixtures (shots, transcript, versions)                */
/* ------------------------------------------------------------------ */

const buildDetail = (story: Story): StoryDetail => {
  const scriptShots: Array<[string, number]> = [
    ['Exterior dawn — waves crash against the lighthouse rocks, gulls scatter.', 12],
    ['Interior — the keeper winds the brass clock, lamplight flickers across his face.', 9],
    ['Wide shot — storm clouds gather on the horizon, the beam begins to rotate.', 15],
    ['Close-up — a letter half-written on the desk, ink drying beside the lamp.', 8],
    ['Exterior night — the beam sweeps over black water, rain streaking the glass.', 14],
  ]
  const shots: Shot[] = scriptShots.map(([description, duration], i) => ({
    id: story.id * 10 + i,
    index: i + 1,
    description,
    duration_seconds: duration,
    thumbnail_url: thumb(
      ['#fde68a', '#fca5a5', '#a5b4fc', '#fbcfe8', '#99f6e4'][i % 5],
      ['#92400e', '#7f1d1d', '#312e81', '#831843', '#134e4a'][i % 5],
      `Shot ${i + 1}`,
    ),
  }))

  const transcript: TranscriptEntry[] = [
    { id: 1, start_seconds: 0, end_seconds: 11, speaker: 'Narrator', text: 'The sea keeps its own time, and Elias kept his by the light.' },
    { id: 2, start_seconds: 11, end_seconds: 24, speaker: 'Elias', text: 'Forty winters I have wound this clock. Forty more, if it asks.' },
    { id: 3, start_seconds: 24, end_seconds: 40, speaker: 'Narrator', text: 'But tonight the horizon carried a weight the almanac never named.' },
    { id: 4, start_seconds: 40, end_seconds: 55, speaker: 'Elias', text: 'A letter for a keeper who no longer answers — I write it anyway.' },
  ]

  return {
    ...story,
    description: 'A solitary lighthouse keeper faces his final storm season and the letter he never sent.',
    style: 'Realistic Drama',
    language: 'English (US)',
    voice: 'Marcus — warm baritone',
    scene_pace: 'Cinematic (slow)',
    shots,
    transcript,
    versions: ['v3 — current', 'v2', 'v1'],
  }
}

/* ------------------------------------------------------------------ */
/* API functions                                                      */
/* ------------------------------------------------------------------ */

export type StoryStateFilter = StoryStatus | 'ALL'
export type StoryWorkflowFilter = WorkflowType | 'ALL'

/**
 * GET story/?page=<n>&page_size=<n>&state=<s>&workflow=<w>
 * DRF-paginated story list with optional status/workflow filters.
 */
export const getStories = (
  page = 1,
  pageSize = 6,
  state: StoryStateFilter = 'ALL',
  workflow: StoryWorkflowFilter = 'ALL',
): Promise<PaginatedStories> => {
  const filtered = STORIES.filter(
    (s) =>
      (state === 'ALL' || s.status === state) &&
      (workflow === 'ALL' || s.workflow_type === workflow),
  )
  const start = (page - 1) * pageSize
  const results = filtered.slice(start, start + pageSize)
  const qs = (p: number) =>
    `/api/story/?page=${p}&page_size=${pageSize}` +
    (state !== 'ALL' ? `&state=${state}` : '') +
    (workflow !== 'ALL' ? `&workflow=${workflow}` : '')
  return withLatency({
    count: filtered.length,
    next: start + pageSize < filtered.length ? qs(page + 1) : null,
    previous: page > 1 ? qs(page - 1) : null,
    results,
  })
}

/** GET story/<id>/ — full story with shots, transcript and versions. */
export const getStory = (id: number): Promise<StoryDetail | null> => {
  const story = STORIES.find((s) => s.id === id)
  if (!story) return withLatency(null)
  return withLatency(buildDetail(story))
}

/** POST story/ — create a story from the wizard payload (fixture-backed). */
export const createStory = (payload: CreateStoryPayload): Promise<Story> => {
  const now = new Date().toISOString()
  const words = payload.script.trim().split(/\s+/).filter(Boolean).length
  const duration = Math.max(0, Math.round(words / 2.4))
  const story: Story = {
    id: nextStoryId(),
    title: payload.title || payload.song_name || 'Untitled story',
    // The fixture simulates the full pipeline instantly, so the story
    // lands in the editor rather than stuck on GENERATING.
    status: 'EDITOR',
    thumbnail_url: null,
    created_at: now,
    updated_at: now,
    credits_used: 0,
    duration_seconds: payload.workflow_type === 'SCRIPT' ? duration : 120,
    workflow_type: payload.workflow_type ?? 'SCRIPT',
  }
  STORIES = [story, ...STORIES]
  return withLatency(story)
}

/** POST story/<id>/duplicate/ — copy a story (fixture-backed). */
export const duplicateStory = (id: number): Promise<Story | null> => {
  const source = STORIES.find((s) => s.id === id)
  if (!source) return withLatency(null)
  const now = new Date().toISOString()
  const copy: Story = {
    ...source,
    id: nextStoryId(),
    title: `${source.title} (copy)`,
    status: 'DRAFT',
    thumbnail_url: source.thumbnail_url,
    credits_used: 0,
    created_at: now,
    updated_at: now,
  }
  STORIES = [copy, ...STORIES]
  return withLatency(copy)
}

/** POST story/<id>/archive/ — archive a story (fixture-backed). */
export const archiveStory = (id: number): Promise<Story | null> => {
  const story = STORIES.find((s) => s.id === id)
  if (!story) return withLatency(null)
  STORIES = STORIES.filter((s) => s.id !== id)
  return withLatency(story)
}

/** DELETE story/<id>/ — remove a story (fixture-backed; used by projects menu). */
export const deleteStory = (id: number): Promise<Story | null> => {
  const story = STORIES.find((s) => s.id === id)
  if (!story) return withLatency(null)
  STORIES = STORIES.filter((s) => s.id !== id)
  return withLatency(story)
}
