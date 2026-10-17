import { PlayIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asStringArray, shotUrl } from './shared/types'
import { MOTION_PRESETS } from './shared/fixtures'

/** /motion — bring a still image to life with preset camera moves. */
const config: ToolConfig = {
  slug: 'motion',
  title: 'Motion',
  tagline: 'Bring a still image to life with a preset camera move.',
  icon: <PlayIcon width={22} height={22} />,
  fields: [
    {
      id: 'image',
      label: 'Image',
      type: 'upload',
      accept: 'image/*',
      hint: 'Landscapes, product shots and portraits all animate well.',
    },
    {
      id: 'preset',
      label: 'Motion preset',
      type: 'chips',
      options: MOTION_PRESETS,
    },
  ],
  progressLines: [
    'Estimating depth…',
    'Solving camera path…',
    'Rendering motion…',
    'Encoding clip…',
  ],
  validate: (values) => {
    if (!asFile(values.image)) return 'Upload an image to animate.'
    if (asStringArray(values.preset).length === 0) return 'Pick a motion preset.'
    return null
  },
  buildResults: (values) => {
    const preset = asStringArray(values.preset)[0] ?? 'Zoom In'
    return [
      {
        id: 'motion-result',
        kind: 'video',
        title: `${preset} motion clip`,
        subtitle: 'Depth-aware camera move · 24 fps',
        badge: preset,
        thumbnail: shotUrl(`motion-${preset.toLowerCase().replace(/\s+/g, '-')}`, 640, 360),
        duration: '0:08',
      },
    ]
  },
  resultLayout: 'single',
}

export default () => <MiniToolPage config={config} />
