import type React from 'react'

/* ------------------------------------------------------------------ */
/* Field values                                                       */
/* ------------------------------------------------------------------ */

/** Point in percent coordinates (0-100) inside a preview frame. */
export interface Point {
  x: number
  y: number
}

/**
 * Union of values a config field can hold. Custom widgets (motion path,
 * mask canvas, focus point, palette) store their data within these
 * shapes: path → Point[], focus → Point, palette → string[] (hex),
 * mask → string (dataURL).
 */
export type FieldValue = string | number | string[] | Point | Point[] | File | File[] | null

export type FieldValues = Record<string, FieldValue>

/* ------------------------------------------------------------------ */
/* Value coercion helpers (keep tool configs readable)                */
/* ------------------------------------------------------------------ */

export const asString = (v: FieldValue | undefined, fallback = ''): string =>
  typeof v === 'string' ? v : fallback

export const asNumber = (v: FieldValue | undefined, fallback = 0): number =>
  typeof v === 'number' ? v : fallback

export const asStringArray = (v: FieldValue | undefined): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

export const asFile = (v: FieldValue | undefined): File | null =>
  v instanceof File ? v : null

export const asFiles = (v: FieldValue | undefined): File[] =>
  Array.isArray(v) ? v.filter((x): x is File => x instanceof File) : []

export const asPoint = (v: FieldValue | undefined): Point | null =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && 'x' in v && 'y' in v
    ? (v as Point)
    : null

export const asPoints = (v: FieldValue | undefined): Point[] =>
  Array.isArray(v)
    ? v.filter(
        (p): p is Point =>
          typeof p === 'object' && p !== null && 'x' in p && 'y' in p,
      )
    : []

/* ------------------------------------------------------------------ */
/* Tool fields                                                        */
/* ------------------------------------------------------------------ */

export interface ToolOption {
  value: string
  label: string
}

export interface CustomFieldCtx {
  value: FieldValue
  setValue: (value: FieldValue) => void
  /** Full values bag — lets widgets read sibling fields (e.g. the
   * mask canvas drawing over the uploaded image). */
  values: FieldValues
}

export interface ToolFieldBase {
  id: string
  label: string
  hint?: string
}

export type ToolField =
  | (ToolFieldBase & { type: 'upload'; accept?: string; multiple?: boolean })
  | (ToolFieldBase & { type: 'text'; placeholder?: string })
  | (ToolFieldBase & { type: 'textarea'; placeholder?: string; rows?: number })
  | (ToolFieldBase & {
      type: 'select'
      options: ToolOption[]
      placeholder?: string
    })
  | (ToolFieldBase & { type: 'chips'; options: string[]; multi?: boolean })
  | (ToolFieldBase & {
      type: 'slider'
      min: number
      max: number
      step?: number
      unit?: string
    })
  | (ToolFieldBase & { type: 'custom'; render: (ctx: CustomFieldCtx) => React.ReactNode })

/* ------------------------------------------------------------------ */
/* Results                                                            */
/* ------------------------------------------------------------------ */

export type ResultKind = 'image' | 'video' | 'audio' | 'text'

export interface ToolResultItem {
  id: string
  kind: ResultKind
  title: string
  subtitle?: string
  badge?: string
  /** Image URL shown for image/video kinds. */
  thumbnail?: string
  /** Display duration for video/audio results ("0:12"). */
  duration?: string
  /** CSS aspect-ratio override for the single-result preview ("9 / 16"). */
  aspect?: string
}

export type ResultLayout = 'single' | 'grid' | 'list' | 'stepper'

/* ------------------------------------------------------------------ */
/* Tool config                                                        */
/* ------------------------------------------------------------------ */

export interface ToolConfig {
  slug: string
  title: string
  /** One-line description shown next to the title. */
  tagline: string
  icon: React.ReactNode
  /** Longer explainer rendered under the header (optional). */
  description?: string
  fields: ToolField[]
  /** Initial values for the fields bag (optional). */
  initialValues?: FieldValues
  /** Generate button label (default "Generate"). */
  generateLabel?: string
  /** Result area caption (default "Result"). */
  resultLabel?: string
  /**
   * Fake generation duration in ms. Defaults to a randomized
   * 2000-4000 ms window.
   */
  durationMs?: number
  /** Status lines rotated through while generating. */
  progressLines?: string[]
  /** Returns an error message when generation should be blocked. */
  validate?: (values: FieldValues) => string | null
  /** Builds the result items from the current values. */
  buildResults: (values: FieldValues) => ToolResultItem[]
  /** Result presentation (default "single"). */
  resultLayout?: ResultLayout
}

/* ------------------------------------------------------------------ */
/* Shared generation helpers                                          */
/* ------------------------------------------------------------------ */

/** Seeded picsum placeholder for generated shots. */
export const shotUrl = (seed: string, w: number, h: number): string =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

/** Rough voice-over duration estimate from a script. */
export const estimateDuration = (text: string): string => {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const seconds = Math.max(2, Math.round(words / 2.4))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

/** Pick n items from a pool deterministically. */
export const pickN = <T>(pool: T[], n: number, salt = 0): T[] =>
  Array.from({ length: Math.min(n, pool.length) }, (_, i) => pool[(i * 7 + salt) % pool.length])
