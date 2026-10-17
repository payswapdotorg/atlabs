import type { ToolOption } from './types'

/* ------------------------------------------------------------------ */
/* Fixture voices (Voices tool + Avatar Video picker)                 */
/* ------------------------------------------------------------------ */

export interface VoiceFixture {
  id: string
  name: string
  tags: string
}

export const VOICES: VoiceFixture[] = [
  { id: 'ira', name: 'Ira', tags: 'Indian English · Warm narrator' },
  { id: 'aarav', name: 'Aarav', tags: 'Hindi · Deep baritone' },
  { id: 'maya', name: 'Maya', tags: 'US English · Neutral crisp' },
  { id: 'kabir', name: 'Kabir', tags: 'Indian English · Promo energy' },
  { id: 'tara', name: 'Tara', tags: 'Indian English · Soft storytelling' },
  { id: 'zoya', name: 'Zoya', tags: 'UK English · Youthful' },
  { id: 'vikram', name: 'Vikram', tags: 'Indian English · Documentary' },
  { id: 'nisha', name: 'Nisha', tags: 'Indian English · Bright ads' },
]

export const VOICE_OPTIONS: ToolOption[] = VOICES.map((v) => ({
  value: v.id,
  label: `${v.name} — ${v.tags}`,
}))

export const voiceName = (id: string): string =>
  VOICES.find((v) => v.id === id)?.name ?? 'Ira'

export const voiceTags = (id: string): string =>
  VOICES.find((v) => v.id === id)?.tags ?? 'Indian English · Warm narrator'

/* ------------------------------------------------------------------ */
/* Shared option sets                                                 */
/* ------------------------------------------------------------------ */

export const MOTION_PRESETS = [
  'Zoom In',
  'Zoom Out',
  'Pan Left',
  'Pan Right',
  'Orbit',
  'Parallax',
]

export const ASPECT_OPTIONS: ToolOption[] = [
  { value: '16:9', label: '16:9 — Landscape' },
  { value: '9:16', label: '9:16 — Vertical' },
  { value: '1:1', label: '1:1 — Square' },
  { value: '4:5', label: '4:5 — Portrait' },
]

export const ASPECT_DIMS: Record<string, [number, number]> = {
  '16:9': [640, 360],
  '9:16': [360, 640],
  '1:1': [480, 480],
  '4:5': [400, 500],
}

export const SCALE_OPTIONS: ToolOption[] = [
  { value: '2x', label: '2× — Fast' },
  { value: '4x', label: '4× — Max detail' },
]

export const COUNT_OPTIONS: ToolOption[] = [
  { value: '1', label: '1 image' },
  { value: '2', label: '2 images' },
  { value: '4', label: '4 images' },
  { value: '6', label: '6 images' },
]

export const GENRES = [
  'Cinematic',
  'Lo-fi',
  'EDM',
  'Ambient',
  'Orchestral',
  'Hip-hop',
  'Pop',
  'Folk',
]

export const MOODS = ['Uplifting', 'Calm', 'Dramatic', 'Playful', 'Nostalgic', 'Epic']

export const LORA_BASE_MODELS: ToolOption[] = [
  { value: 'sdxl', label: 'SDXL Base 1.0' },
  { value: 'flux', label: 'Flux Dev' },
  { value: 'atlabs', label: 'Atlabs Base' },
]

export const EPOCH_OPTIONS: ToolOption[] = [
  { value: '10', label: '10 epochs — quick' },
  { value: '20', label: '20 epochs — balanced' },
  { value: '30', label: '30 epochs — thorough' },
]

export const HEADING_FONTS: ToolOption[] = [
  { value: 'grotesk', label: 'Space Grotesk' },
  { value: 'serif-display', label: 'Fraunces Serif' },
  { value: 'condensed', label: 'Archivo Condensed' },
  { value: 'editorial', label: 'Playfair Display' },
]

export const BODY_FONTS: ToolOption[] = [
  { value: 'inter', label: 'Inter' },
  { value: 'reader', label: 'Source Serif' },
  { value: 'mono', label: 'IBM Plex Mono' },
]

export const FONT_NAME: Record<string, string> = {
  grotesk: 'Space Grotesk',
  'serif-display': 'Fraunces Serif',
  condensed: 'Archivo Condensed',
  editorial: 'Playfair Display',
  inter: 'Inter',
  reader: 'Source Serif',
  mono: 'IBM Plex Mono',
}

export const DECK_TEMPLATES: ToolOption[] = [
  { value: 'minimal', label: 'Minimal Bold' },
  { value: 'editorial', label: 'Editorial Serif' },
  { value: 'dark', label: 'Dark Pitch' },
  { value: 'classic', label: 'Startup Classic' },
]

export const DECK_TEMPLATE_NAME: Record<string, string> = {
  minimal: 'Minimal Bold',
  editorial: 'Editorial Serif',
  dark: 'Dark Pitch',
  classic: 'Startup Classic',
}

export const AUDIENCES = [
  'Gen Z',
  'Millennials',
  'Parents',
  'Fitness',
  'Foodies',
  'Students',
  'Travel',
  'Founders',
]

/* ------------------------------------------------------------------ */
/* Content pools for generated results                                */
/* ------------------------------------------------------------------ */

export const TRACK_TITLES = [
  'Monsoon Over Marine Drive',
  'Paper Lanterns at Dawn',
  'Slow Train to Kochi',
  'Neon Bazaar',
  'Salt and Static',
  'Kite Season',
  'Half-Light Harbour',
  'Copper Dust',
  'Tuesday Cyclone',
  'Rooftop Satellite',
  'Jasmine Frequency',
  'Tin Roof Rain',
]

export const SIGHTING_CAPTIONS = [
  'leaving the venue',
  'crossing the street',
  'laughing with friends',
  'signing autographs',
  'getting into the car',
  'outside the cafe',
  'under the marquee lights',
  'walking the dog',
]

export const AD_HOOKS = [
  'POV hook',
  'Problem-first hook',
  'Unboxing hook',
  'Testimonial hook',
]

export const BRAND_PRESET_COLORS = [
  '#f5c518',
  '#1f2937',
  '#0ea5e9',
  '#16a34a',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#f97316',
  '#14b8a6',
  '#111827',
  '#facc15',
  '#f8fafc',
]

export const DEFAULT_OUTLINE = `Atlabs: video production in one prompt
The problem: studios take weeks, creators take all night
How Atlabs works: script to storyboard to render
Why now: generative video finally crossed the quality bar
Traction: 40k stories rendered this quarter
The ask: partnering for the creator enterprise plan`
