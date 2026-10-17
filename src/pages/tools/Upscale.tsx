import { LayersIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asString, shotUrl } from './shared/types'
import { SCALE_OPTIONS } from './shared/fixtures'

/** /upscale — super-resolution for images and video stills. */
const config: ToolConfig = {
  slug: 'upscale',
  title: 'Upscale',
  tagline: 'Scale footage up to 4× with detail-restoring super resolution.',
  icon: <LayersIcon width={22} height={22} />,
  fields: [
    {
      id: 'media',
      label: 'Image or video',
      type: 'upload',
      accept: 'image/*,video/*',
    },
    {
      id: 'scale',
      label: 'Scale factor',
      type: 'select',
      options: SCALE_OPTIONS,
      placeholder: 'Choose a scale',
    },
  ],
  progressLines: [
    'Analyzing source detail…',
    'Restoring micro-textures…',
    'Sharpening edges…',
    'Encoding output…',
  ],
  validate: (values) => {
    if (!asFile(values.media)) return 'Upload an image or video to upscale.'
    if (!asString(values.scale)) return 'Pick a scale factor.'
    return null
  },
  buildResults: (values) => {
    const scale = asString(values.scale, '2x')
    const factor = scale === '4x' ? 4 : 2
    const isVideo = asFile(values.media)?.type.startsWith('video/') ?? false
    return [
      {
        id: 'upscale-result',
        kind: isVideo ? 'video' : 'image',
        title: `${scale} upscaled ${isVideo ? 'video' : 'image'}`,
        subtitle: `2048 × 1152 output from a ${1024 / factor} × ${576 / factor} source`,
        badge: scale,
        thumbnail: shotUrl('upscale-detail', 640, 360),
        duration: isVideo ? '0:09' : undefined,
      },
    ]
  },
  resultLayout: 'single',
}

export default () => <MiniToolPage config={config} />
