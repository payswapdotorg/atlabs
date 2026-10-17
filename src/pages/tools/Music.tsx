import { SpeakerLoudIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig, ToolResultItem } from './shared/types'
import { asNumber, asString, asStringArray, pickN } from './shared/types'
import { GENRES, MOODS, TRACK_TITLES } from './shared/fixtures'

const secondsLabel = (s: number): string =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** /music — generate royalty-free tracks from genre/mood/duration cues. */
const config: ToolConfig = {
  slug: 'music',
  title: 'Music',
  tagline: 'Generate royalty-free tracks from genre, mood and duration cues.',
  icon: <SpeakerLoudIcon width={22} height={22} />,
  fields: [
    {
      id: 'prompt',
      label: 'Prompt',
      type: 'textarea',
      rows: 3,
      placeholder: 'e.g. "a slow monsoon evening walk through the old city"',
    },
    {
      id: 'genres',
      label: 'Genre',
      type: 'chips',
      options: GENRES,
      multi: true,
      hint: 'Pick one or more — the fixture blends them.',
    },
    {
      id: 'moods',
      label: 'Mood',
      type: 'chips',
      options: MOODS,
      multi: true,
    },
    {
      id: 'duration',
      label: 'Duration',
      type: 'slider',
      min: 15,
      max: 120,
      unit: 's',
    },
  ],
  initialValues: { duration: 45 },
  progressLines: [
    'Composing chord bed…',
    'Arranging instruments…',
    'Rendering stems…',
    'Mixing master…',
  ],
  validate: (values) => {
    if (asStringArray(values.genres).length === 0) return 'Pick at least one genre.'
    if (asStringArray(values.moods).length === 0) return 'Pick at least one mood.'
    return null
  },
  buildResults: (values) => {
    const genres = asStringArray(values.genres)
    const moods = asStringArray(values.moods)
    const prompt = asString(values.prompt).trim()
    const duration = asNumber(values.duration, 45)
    const titles = pickN(TRACK_TITLES, 5, genres.length + moods.length)
    const items: ToolResultItem[] = titles.map((title, i) => {
      const trimmed = Math.max(8, duration - i * 3)
      return {
        id: `music-track-${i}`,
        kind: 'audio',
        title,
        subtitle: `${genres[i % genres.length]} · ${moods[i % moods.length]}${
          prompt ? ` · “${prompt.slice(0, 34)}”` : ''
        }`,
        badge: i === 0 ? 'Best match' : undefined,
        duration: secondsLabel(trimmed),
      }
    })
    return items
  },
  resultLayout: 'list',
  resultLabel: 'Generated tracks',
}

export default () => <MiniToolPage config={config} />
