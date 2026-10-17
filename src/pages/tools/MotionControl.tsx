import { SymbolIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asPoints, shotUrl } from './shared/types'
import { MotionPathField } from './shared/customFields'

/** /motion-control — draw an exact motion path over an image. */
const config: ToolConfig = {
  slug: 'motion-control',
  title: 'Motion Control',
  tagline: 'Draw an exact motion path and animate your image along it.',
  icon: <SymbolIcon width={22} height={22} />,
  fields: [
    {
      id: 'image',
      label: 'Image',
      type: 'upload',
      accept: 'image/*',
    },
    {
      id: 'path',
      label: 'Motion path',
      type: 'custom',
      hint: 'Click on the frame to add keyframes; drag points to adjust.',
      render: (ctx) => <MotionPathField {...ctx} />,
    },
    {
      id: 'speed',
      label: 'Traversal speed',
      type: 'slider',
      min: 1,
      max: 10,
      unit: '×',
    },
  ],
  initialValues: { speed: 4 },
  progressLines: [
    'Smoothing path spline…',
    'Stabilizing background…',
    'Rendering camera move…',
    'Encoding clip…',
  ],
  validate: (values) => {
    if (!asFile(values.image)) return 'Upload an image first.'
    if (asPoints(values.path).length < 2) return 'Draw a path with at least 2 keyframes.'
    return null
  },
  buildResults: (values) => {
    const keyframes = asPoints(values.path).length
    return [
      {
        id: 'motion-control-result',
        kind: 'video',
        title: 'Path-driven motion clip',
        subtitle: `${keyframes} keyframes · spline-smoothed camera`,
        badge: 'Custom path',
        thumbnail: shotUrl('motion-control-path', 640, 360),
        duration: '0:10',
      },
    ]
  },
  resultLayout: 'single',
}

export default () => <MiniToolPage config={config} />
