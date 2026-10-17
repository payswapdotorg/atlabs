import { ImageIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asNumber, asString, shotUrl } from './shared/types'
import { imageStylesFixture } from '../../lib/api/library'
import { ASPECT_DIMS, ASPECT_OPTIONS, COUNT_OPTIONS } from './shared/fixtures'

const STYLE_OPTIONS = imageStylesFixture.map((s) => ({
  value: s.slug,
  label: s.name,
}))

const styleName = (slug: string): string =>
  imageStylesFixture.find((s) => s.slug === slug)?.name ?? 'Paper Cutout'

/** /image — styled image generation from prompts. */
const config: ToolConfig = {
  slug: 'image',
  title: 'Image Studio',
  tagline: 'Generate styled images from prompts, in any aspect ratio.',
  icon: <ImageIcon width={22} height={22} />,
  fields: [
    {
      id: 'prompt',
      label: 'Prompt',
      type: 'textarea',
      rows: 4,
      placeholder: 'e.g. "a paper-cutout fox delivery scooter in a monsoon alley"',
    },
    {
      id: 'style',
      label: 'Style',
      type: 'select',
      options: STYLE_OPTIONS,
      placeholder: 'Choose a style',
    },
    {
      id: 'aspect',
      label: 'Aspect ratio',
      type: 'select',
      options: ASPECT_OPTIONS,
      placeholder: 'Choose an aspect ratio',
    },
    {
      id: 'count',
      label: 'Count',
      type: 'select',
      options: COUNT_OPTIONS,
      placeholder: 'How many images',
    },
  ],
  progressLines: [
    'Encoding prompt…',
    'Sampling latents…',
    'Refining composition…',
    'Upscaling frames…',
  ],
  validate: (values) => {
    if (!asString(values.prompt).trim()) return 'Describe the image you want.'
    if (!asString(values.style)) return 'Pick a style.'
    if (!asString(values.aspect)) return 'Pick an aspect ratio.'
    if (!asString(values.count)) return 'Choose how many images to generate.'
    return null
  },
  buildResults: (values) => {
    const prompt = asString(values.prompt).trim()
    const style = asString(values.style, 'paper-cutout')
    const aspect = asString(values.aspect, '16:9')
    const count = asNumber(values.count, 2)
    const [w, h] = ASPECT_DIMS[aspect] ?? [640, 360]
    const short = prompt.length > 34 ? `${prompt.slice(0, 34)}…` : prompt
    return Array.from({ length: count }, (_, i) => ({
      id: `image-${style}-${i}`,
      kind: 'image' as const,
      title: `${styleName(style)} · ${short}`,
      subtitle: `${aspect} · variation ${i + 1}`,
      badge: i === 0 ? 'Best match' : undefined,
      thumbnail: shotUrl(`image-${style}-${i}`, w, h),
      aspect: `${w} / ${h}`,
    }))
  },
  resultLayout: 'grid',
  resultLabel: 'Generated images',
}

export default () => <MiniToolPage config={config} />
