import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asString, shotUrl } from './shared/types'
import { MaskCanvasField } from './shared/customFields'

/** /inpaint — brush a mask over an image and regenerate that region. */
const config: ToolConfig = {
  slug: 'inpaint',
  title: 'Inpaint',
  tagline: 'Brush over an area and regenerate it from a prompt.',
  icon: <MagnifyingGlassIcon width={22} height={22} />,
  fields: [
    {
      id: 'image',
      label: 'Image',
      type: 'upload',
      accept: 'image/*',
    },
    {
      id: 'mask',
      label: 'Mask',
      type: 'custom',
      hint: 'Drag on the canvas to paint the region to regenerate.',
      render: (ctx) => <MaskCanvasField {...ctx} />,
    },
    {
      id: 'prompt',
      label: 'Prompt',
      type: 'textarea',
      rows: 3,
      placeholder: 'e.g. "Replace the background with a misty mountain ridge"',
    },
  ],
  progressLines: [
    'Segmenting masked region…',
    'Generating fill content…',
    'Blending edges…',
    'Compositing result…',
  ],
  validate: (values) => {
    if (!asFile(values.image)) return 'Upload an image to inpaint.'
    if (typeof values.mask !== 'string') return 'Paint a mask over the region to change.'
    if (!asString(values.prompt).trim()) return 'Describe what should replace the masked area.'
    return null
  },
  buildResults: (values) => {
    const prompt = asString(values.prompt).trim()
    const short = prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt
    return [
      {
        id: 'inpaint-result',
        kind: 'image',
        title: 'Inpainted image',
        subtitle: `Masked region regenerated: “${short}”`,
        badge: 'Edited',
        thumbnail: shotUrl('inpaint-result', 640, 400),
      },
    ]
  },
  resultLayout: 'single',
}

export default () => <MiniToolPage config={config} />
