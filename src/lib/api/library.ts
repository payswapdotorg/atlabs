/**
 * Library & tools mock API surface (WO-3 content surface).
 *
 * Extends — does not rewrite — the clients in `src/lib/api/index.ts` and
 * `src/lib/api/stories.ts`: library endpoints live here with their own
 * fixtures and ~300 ms of simulated latency so pages can build honest
 * loading states.
 *
 * Shapes follow the WO-3 brief:
 *
 *   GET character-library/?limit&offset&role&gender&age&ethnicity
 *     → { count, next, previous, results: Character[] }
 *
 *   Character = {
 *     id, name, portrait_url, portrait_media: { media_type, url },
 *     gender, ethnicity, age, source: 'SYSTEM' | 'USER'
 *   }
 *
 *   GET media-library/?limit
 *     → { count, next, previous, results: MediaAsset[] }  (same envelope)
 *
 *   GET image_style/all/
 *     → ImageStyle[] = { id, name, source: 'SYSTEM', slug, preview_url,
 *                        preview_media: { media_type: 'video',
 *                                         duration_in_ms } }
 *
 * Local fixture extensions (not in the captured API list, needed by the
 * Library tabs / mini tools): GET location/all/, GET character/<id>/,
 * POST character-library/ (add character), POST media-library/ (upload).
 * Portraits use api.dicebear.com personas seeded by name; location and
 * style previews use picsum.photos seeds (no licensed assets).
 */

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type CharacterSource = 'SYSTEM' | 'USER'
export type CharacterRole = 'ACTOR' | 'NARRATOR' | 'EXTRA'

export interface PortraitMedia {
  media_type: 'image'
  url: string
}

/** Public character shape returned by character-library/ (per brief). */
export interface Character {
  id: number
  name: string
  portrait_url: string
  portrait_media: PortraitMedia
  gender: string
  ethnicity: string
  age: string
  source: CharacterSource
}

/** DRF-style pagination envelope for character-library/ lists. */
export interface PaginatedCharacters {
  count: number
  next: string | null
  previous: string | null
  results: Character[]
}

/** Character detail (GET character/<id>/) adds role + description. */
export interface CharacterDetail extends Character {
  role: CharacterRole
  description: string
}

/** Internal fixture row: public shape + detail-only fields. */
type CharacterRecord = CharacterDetail

/** Payload accepted by createCharacter (Add Character modal). */
export interface CreateCharacterPayload {
  name: string
  gender: string
  age: string
  ethnicity: string
  description?: string
  role?: CharacterRole
  portrait_url?: string
}

export type MediaType = 'image' | 'audio' | 'video'

export interface MediaAsset {
  id: number
  file_name: string
  content_type: string
  media_type: MediaType
  url: string
  created_at: string
}

/** DRF-style pagination envelope for media-library/ lists. */
export interface PaginatedMedia {
  count: number
  next: string | null
  previous: string | null
  results: MediaAsset[]
}

export interface ImageStyle {
  id: number
  name: string
  source: 'SYSTEM'
  slug: string
  preview_url: string
  preview_media: {
    media_type: 'video'
    duration_in_ms: number
  }
}

export interface LibraryLocation {
  id: number
  name: string
  slug: string
  description: string
  image_url: string
}

export interface CharacterListParams {
  limit?: number
  offset?: number
  role?: string
  gender?: string
  age?: string
  ethnicity?: string
  source?: string
}

export interface MediaListParams {
  limit?: number
  offset?: number
  media_type?: string
}

export interface CreateMediaPayload {
  file_name: string
  content_type: string
  media_type: MediaType
  url: string
}

/* ------------------------------------------------------------------ */
/* Latency helper                                                     */
/* ------------------------------------------------------------------ */

const LIBRARY_LATENCY_MS = 300

const withLatency = <T>(payload: T): Promise<T> =>
  new Promise((resolve) =>
    window.setTimeout(() => resolve(payload), LIBRARY_LATENCY_MS),
  )

/* ------------------------------------------------------------------ */
/* Shared fixture helpers                                             */
/* ------------------------------------------------------------------ */

const portraitFor = (name: string): string =>
  `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}`

const picsum = (seed: string, w: number, h: number): string =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

const daysAgo = (d: number): string =>
  new Date(Date.now() - d * 24 * 3600 * 1000).toISOString()

/** Valid, silent, zero-byte WAV — lets <audio> elements honestly play. */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

/* ------------------------------------------------------------------ */
/* Character fixtures — 189 rows, deterministic                       */
/* ------------------------------------------------------------------ */

/**
 * 20 actor names captured from the live product, plus invented siblings
 * in the same cultural range. The remaining rows (up to the fixture
 * total of 189) are generated deterministically from name pools.
 */
const CAPTURED_ACTORS: string[] = [
  'Sanjana Rao',
  'Riya Malhotra',
  'Rituparna Das',
  'Rhea Dasgupta',
  'Priya Menon',
  'Nandita Rao',
  'Nandini Pawar',
  'Naina Reddy',
  'Meera Nair',
  'Mary Lalrinpuii',
  'Lakshmi Pillai',
  'Kiara Ahuja',
  'Kavya Subramanian',
  'Kavitha Suresh',
  'Zoya Khan',
  'Vanya Rajput',
  'Thoibi Devi',
  'Tara Sharma',
  'Sneha Patel',
  'Simran Gill',
]

const INVENTED_ACTORS: Array<[string, string, string, string, CharacterRole]> = [
  ['Aarav Mehta', 'Male', '25-34', 'Indian', 'ACTOR'],
  ['Arjun Iyer', 'Male', '18-24', 'South Asian', 'ACTOR'],
  ['Rohan Kulkarni', 'Male', '25-34', 'Indian', 'NARRATOR'],
  ['Vikram Nair', 'Male', '35-44', 'Indian', 'ACTOR'],
  ['Aditya Reddy', 'Male', '18-24', 'Indian', 'EXTRA'],
  ['Karthik Subramanian', 'Male', '25-34', 'South Asian', 'ACTOR'],
  ['Dev Pillai', 'Male', '45-54', 'Indian', 'NARRATOR'],
  ['Kabir Chowdhury', 'Male', '25-34', 'South Asian', 'ACTOR'],
  ['Nikhil Banerjee', 'Male', '35-44', 'Indian', 'EXTRA'],
  ['Sameer Osman', 'Male', '25-34', 'Middle Eastern', 'ACTOR'],
  ['Siddharth Menon', 'Male', '18-24', 'Indian', 'ACTOR'],
  ['Rahul Malhotra', 'Male', '35-44', 'Indian', 'NARRATOR'],
  ['Ishita Bose', 'Female', '25-34', 'Indian', 'ACTOR'],
  ['Ananya Krishnan', 'Female', '18-24', 'South Asian', 'ACTOR'],
  ['Dia Mirza Kaur', 'Female', '25-34', 'Mixed', 'ACTOR'],
  ['Aditi Deshmukh', 'Female', '35-44', 'Indian', 'NARRATOR'],
  ['Shreya Ghosal Rao', 'Female', '18-24', 'Indian', 'EXTRA'],
  ['Natasha Fernandes', 'Female', '25-34', 'Mixed', 'ACTOR'],
  ['Leela Varghese', 'Female', '45-54', 'South Asian', 'ACTOR'],
  ['Asha Bhosale Nair', 'Female', '55+', 'Indian', 'NARRATOR'],
]

const FEMALE_FIRST = [
  'Aarti', 'Bhavna', 'Chitra', 'Deepa', 'Esha', 'Farah', 'Gauri', 'Hema',
  'Indira', 'Jaya', 'Kiran', 'Lavanya', 'Maya', 'Nikita', 'Oviya', 'Pooja',
  'Radhika', 'Sagarika', 'Tanvi', 'Urvashi', 'Vanaja', 'Yamini',
]
const MALE_FIRST = [
  'Abhay', 'Bharat', 'Chetan', 'Dinesh', 'Farhan', 'Ganesh', 'Harsh',
  'Imran', 'Jatin', 'Kunal', 'Lokesh', 'Manav', 'Naveen', 'Omkar', 'Pranav',
  'Rishi', 'Sushant', 'Tarun', 'Uday', 'Varun',
]
const LAST_NAMES = [
  'Bhatt', 'Chauhan', 'Dutta', 'Gokhale', 'Hegde', 'Joshi', 'Kapoor',
  'Lodha', 'Mishra', 'Nayak', 'Pandit', 'Rathore', 'Saxena', 'Thakur',
  'Upadhyay', 'Varma', 'Warrier', 'Yadav', 'Zaveri', 'Bhandari',
]

const ETHNICITIES = [
  'Indian', 'South Asian', 'Southeast Asian', 'East Asian',
  'Middle Eastern', 'Hispanic/Latino', 'Caucasian', 'Black', 'Mixed',
]
const AGE_BUCKETS = ['18-24', '25-34', '35-44', '45-54', '55+']
const ROLES: CharacterRole[] = ['ACTOR', 'NARRATOR', 'EXTRA']
const DESCRIPTIONS = [
  'Warm screen presence with natural comic timing.',
  'Classical theatre training; precise diction and calm authority.',
  'Commercial-friendly face, strong with product reactions.',
  'Documentary narrator register, unhurried and trustworthy.',
  'Expressive eyes; excels in close-up emotional beats.',
  'Physical performer — dance and stage-combat background.',
  'Crisp corporate read; ideal for explainers and demos.',
  'Youthful energy with believable teen/college casting.',
  'Bilingual delivery; switches accents mid-script without seams.',
  'Character actor range — plays quirky authority figures well.',
]

/** Deterministic pool pick — stable across reloads (no Math.random). */
const pick = <T>(pool: T[], i: number, salt: number): T =>
  pool[(i * 31 + salt * 17) % pool.length]

const CHARACTER_TOTAL = 189

const buildCharacterRows = (): CharacterRecord[] => {
  const rows: CharacterRecord[] = []

  const push = (
    name: string,
    gender: string,
    age: string,
    ethnicity: string,
    role: CharacterRole,
    i: number,
  ) => {
    rows.push({
      id: i,
      name,
      portrait_url: portraitFor(name),
      portrait_media: { media_type: 'image', url: portraitFor(name) },
      gender,
      ethnicity,
      age,
      source: 'SYSTEM',
      role,
      description: pick(DESCRIPTIONS, i, 3),
    })
  }

  // 20 captured names — female leads, varied ages/ethnicities/roles.
  CAPTURED_ACTORS.forEach((name, i) => {
    push(
      name,
      'Female',
      pick(AGE_BUCKETS, i, 1),
      pick(['Indian', 'South Asian', 'Southeast Asian', 'Mixed'], i, 2),
      pick(ROLES, i, 5),
      i + 1,
    )
  })

  // 20 invented siblings with hand-set attributes.
  INVENTED_ACTORS.forEach(([name, gender, age, ethnicity, role], i) => {
    push(name, gender, age, ethnicity, role, i + 21)
  })

  // Deterministic fill up to 189.
  for (let i = 41; i <= CHARACTER_TOTAL; i += 1) {
    const male = i % 3 === 0
    const first = male ? pick(MALE_FIRST, i, 1) : pick(FEMALE_FIRST, i, 2)
    const last = pick(LAST_NAMES, i, 4)
    push(
      `${first} ${last}`,
      male ? 'Male' : 'Female',
      pick(AGE_BUCKETS, i, 6),
      pick(ETHNICITIES, i, 7),
      pick(ROLES, i, 8),
      i,
    )
  }

  return rows
}

let CHARACTERS: CharacterRecord[] = buildCharacterRows()

const nextCharacterId = (): number =>
  Math.max(...CHARACTERS.map((c) => c.id), 1000) + 1

/* ------------------------------------------------------------------ */
/* Media library fixtures                                             */
/* ------------------------------------------------------------------ */

type MediaSpec = [string, MediaType, string]

const MEDIA_SPECS: MediaSpec[] = [
  ['brand-hero-dusk.jpg', 'image', 'image/jpeg'],
  ['poster-paper-cutout.png', 'image', 'image/png'],
  ['market-b-roll-01.mp4', 'video', 'video/mp4'],
  ['vo-warm-narration.mp3', 'audio', 'audio/mpeg'],
  ['lighthouse-frame-04.png', 'image', 'image/png'],
  ['alley-chase-clip.mp4', 'video', 'video/mp4'],
  ['jingle-hook-idea.wav', 'audio', 'audio/wav'],
  ['avatar-portrait-a.png', 'image', 'image/png'],
  ['product-turntable.mp4', 'video', 'video/mp4'],
  ['score-ambient-pad.mp3', 'audio', 'audio/mpeg'],
  ['style-ref-claymation.jpg', 'image', 'image/jpeg'],
  ['neon-alley-still.jpg', 'image', 'image/jpeg'],
  ['ugc-selfie-batch-3.mp4', 'video', 'video/mp4'],
  ['vo-promo-cut.mp3', 'audio', 'audio/mpeg'],
  ['deck-cover-gradient.png', 'image', 'image/png'],
  ['backwaters-drone.mp4', 'video', 'video/mp4'],
  ['old-logo-sketch.png', 'image', 'image/png'],
  ['stinger-whoosh.wav', 'audio', 'audio/wav'],
  ['cafe-ambience.mp3', 'audio', 'audio/mpeg'],
  ['titles-card-4x5.png', 'image', 'image/png'],
  ['kitchen-b-roll.mp4', 'video', 'video/mp4'],
  ['inpaint-before.jpg', 'image', 'image/jpeg'],
  ['sighting-rough-cut.mp4', 'video', 'video/mp4'],
  ['vo-kids-story.mp3', 'audio', 'audio/mpeg'],
  ['style-board-anime.png', 'image', 'image/png'],
  ['founder-interview.mp4', 'video', 'video/mp4'],
  ['palette-swatch.png', 'image', 'image/png'],
  ['bass-loop-90bpm.wav', 'audio', 'audio/wav'],
  ['metro-rush-clip.mp4', 'video', 'video/mp4'],
  ['moodboard-collage.jpg', 'image', 'image/jpeg'],
]

const buildMediaRows = (): MediaAsset[] =>
  MEDIA_SPECS.map(([file_name, media_type, content_type], i) => {
    const slug = file_name.replace(/\.[a-z0-9]+$/i, '')
    const url =
      media_type === 'image'
        ? picsum(`asset-${slug}`, 640, 480)
        : media_type === 'video'
          ? picsum(`asset-${slug}`, 640, 360)
          : SILENT_WAV
    return {
      id: 500 + i,
      file_name,
      content_type,
      media_type,
      url,
      created_at: daysAgo((i * 3) % 60 + 1),
    }
  })

let MEDIA: MediaAsset[] = buildMediaRows()

const nextMediaId = (): number =>
  Math.max(...MEDIA.map((m) => m.id), 900) + 1

/* ------------------------------------------------------------------ */
/* Image style fixtures                                               */
/* ------------------------------------------------------------------ */

const STYLE_SPECS: Array<[string, string, number]> = [
  ['Paper Cutout', 'paper-cutout', 6000],
  ['Cinematic 3D', 'cinematic-3d', 8000],
  ['Watercolor Story', 'watercolor-story', 5200],
  ['Comic Pop', 'comic-pop', 4400],
  ['Claymation', 'claymation', 7500],
  ['Neon Anime', 'neon-anime', 6800],
  ['Documentary Real', 'documentary-real', 9000],
  ['Vintage Film', 'vintage-film', 5600],
  ['Line Art', 'line-art', 4800],
]

/** Style catalog shared by the Library STYLES tab and mini tools. */
export const imageStylesFixture: ImageStyle[] = STYLE_SPECS.map(
  ([name, slug, duration], i) => ({
    id: 700 + i,
    name,
    source: 'SYSTEM',
    slug,
    preview_url: picsum(`style-${slug}`, 480, 320),
    preview_media: { media_type: 'video', duration_in_ms: duration },
  }),
)

/* ------------------------------------------------------------------ */
/* Location fixtures (local extension for the LOCATIONS tab)          */
/* ------------------------------------------------------------------ */

const LOCATION_SPECS: Array<[string, string]> = [
  ['Marine Drive Dusk', 'Promenade sweep at golden hour, city lights waking behind the railing.'],
  ['Kerala Backwaters', 'Slow boat drift through palm-lined canals, mist on the water.'],
  ['Monsoon Market Alley', 'Crowded bazaar lane under dripping awnings and hanging bulbs.'],
  ['Himalayan Ridge Camp', 'Wind-flapped tents above the treeline, peaks catching first light.'],
  ['Old City Bazaar', 'Narrow stone lanes, spice sacks, shafts of dusty sunlight.'],
  ['Coastal Lighthouse', 'White tower on black rocks, beam sweeping a dark sea.'],
  ['Rooftop Garden Party', 'String lights, planted beds, skyline bokeh behind guests.'],
  ['Desert Fortress', 'Sun-baked ramparts rippling heat over an empty horizon.'],
  ['Neon Arcade Street', 'Rain-slick crossing washed in animated signage.'],
  ['Tea Estate Morning', 'Terraced green rows emerging from low valley fog.'],
  ['Haveli Courtyard', 'Carved arches, jharokha balconies, a single peepal tree.'],
  ['Metro Platform Rush', 'Arriving train blur, commuters streaking past pillars.'],
]

/** Location catalog (fixture extension for the Library LOCATIONS tab). */
export const libraryLocationsFixture: LibraryLocation[] =
  LOCATION_SPECS.map(([name, description], i) => ({
    id: 800 + i,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description,
    image_url: picsum(
      `location-${name.toLowerCase().replace(/\s+/g, '-')}`,
      640,
      400,
    ),
  }))

/* ------------------------------------------------------------------ */
/* API functions                                                      */
/* ------------------------------------------------------------------ */

const isSet = (v: string | undefined): v is string =>
  Boolean(v) && v !== 'ALL' && v !== ''

/**
 * GET character-library/?limit&offset&role&gender&age&ethnicity
 * DRF-paginated character list with optional attribute filters.
 */
export const getCharacters = (
  params: CharacterListParams = {},
): Promise<PaginatedCharacters> => {
  const { limit = 12, offset = 0, role, gender, age, ethnicity, source } = params
  const filtered = CHARACTERS.filter(
    (c) =>
      (!isSet(role) || c.role === role) &&
      (!isSet(gender) || c.gender === gender) &&
      (!isSet(age) || c.age === age) &&
      (!isSet(ethnicity) || c.ethnicity === ethnicity) &&
      (!isSet(source) || c.source === source),
  )
  const results = filtered.slice(offset, offset + limit)
  const qs = (o: number) =>
    `/api/character-library/?limit=${limit}&offset=${o}` +
    (isSet(role) ? `&role=${role}` : '') +
    (isSet(gender) ? `&gender=${gender}` : '') +
    (isSet(age) ? `&age=${encodeURIComponent(age)}` : '') +
    (isSet(ethnicity) ? `&ethnicity=${encodeURIComponent(ethnicity)}` : '') +
    (isSet(source) ? `&source=${source}` : '')
  return withLatency({
    count: filtered.length,
    next: offset + limit < filtered.length ? qs(offset + limit) : null,
    previous: offset > 0 ? qs(Math.max(offset - limit, 0)) : null,
    results: results.map(({ role: _r, description: _d, ...pub }) => pub),
  })
}

/** GET character/<id>/ — public fields plus role and description. */
export const getCharacter = (id: number): Promise<CharacterDetail | null> => {
  const found = CHARACTERS.find((c) => c.id === id)
  return withLatency(found ?? null)
}

/**
 * POST character-library/ — Add Character flow (fixture-backed; new
 * rows persist in the in-memory store with source "USER").
 */
export const createCharacter = (
  payload: CreateCharacterPayload,
): Promise<Character> => {
  const portrait =
    payload.portrait_url && payload.portrait_url.length > 0
      ? payload.portrait_url
      : portraitFor(payload.name)
  const record: CharacterRecord = {
    id: nextCharacterId(),
    name: payload.name,
    portrait_url: portrait,
    portrait_media: { media_type: 'image', url: portrait },
    gender: payload.gender,
    ethnicity: payload.ethnicity,
    age: payload.age,
    source: 'USER',
    role: payload.role ?? 'ACTOR',
    description: payload.description ?? 'Custom character added from the Library.',
  }
  CHARACTERS = [record, ...CHARACTERS]
  const { role: _r, description: _d, ...pub } = record
  return withLatency(pub)
}

/**
 * GET media-library/?limit — DRF-paginated uploaded media list with
 * optional media_type filter (image | audio | video).
 */
export const getMediaLibrary = (
  params: MediaListParams = {},
): Promise<PaginatedMedia> => {
  const { limit = 24, offset = 0, media_type } = params
  const filtered = MEDIA.filter(
    (m) => !isSet(media_type) || m.media_type === media_type,
  )
  const results = filtered.slice(offset, offset + limit)
  const qs = (o: number) =>
    `/api/media-library/?limit=${limit}&offset=${o}` +
    (isSet(media_type) ? `&media_type=${media_type}` : '')
  return withLatency({
    count: filtered.length,
    next: offset + limit < filtered.length ? qs(offset + limit) : null,
    previous: offset > 0 ? qs(Math.max(offset - limit, 0)) : null,
    results,
  })
}

/**
 * POST media-library/ — register an uploaded file (fixture-backed; the
 * page passes an object URL for real local preview).
 */
export const addMediaAsset = (payload: CreateMediaPayload): Promise<MediaAsset> => {
  const asset: MediaAsset = {
    id: nextMediaId(),
    file_name: payload.file_name,
    content_type: payload.content_type,
    media_type: payload.media_type,
    url: payload.url,
    created_at: new Date().toISOString(),
  }
  MEDIA = [asset, ...MEDIA]
  return withLatency(asset)
}

/** GET image_style/all/ — the full style catalog. */
export const getImageStyles = (): Promise<ImageStyle[]> =>
  withLatency(imageStylesFixture)

/** GET location/all/ — fixture extension for the LOCATIONS tab. */
export const getLocations = (): Promise<LibraryLocation[]> =>
  withLatency(libraryLocationsFixture)
