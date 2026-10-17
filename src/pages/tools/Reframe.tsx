import { CropIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asPoint, asString, shotUrl } from './shared/types'
import { ASPECT_DIMS, ASPECT_OPTIONS } from './shared/fixtures'
import { FocusPointField } from './shared/customFields'

/** /reframe — convert between aspect ratios while tracking the subject. */
const config: ToolConfig = {
  slug: 'reframe',
  title: 'Reframe',
  tagline: 'Convert video between aspect ratios while keeping the subject in frame.',
  icon: <CropIcon width={22} height={22} />,
  fields: [
    {
      id: 'video',
      label: 'Video',
      type: 'upload',
      accept: 'video/*',
    },
    {
      id: 'aspect',
      label: 'Target aspect ratio',
      type: 'select',
      options: ASPECT_OPTIONS,
      placeholder: 'Choose an aspect ratio',
    },
    {
      id: 'focus',
      label: 'Focus point',
      type: 'custom',
      hint: 'Click the frame to lock the subject Atlabs keeps centered.',
      render: (ctx) => <FocusPointField {...ctx} />,
    },
  ],
  progressLines: [
    'Detecting subjects per frame…',
    'Computing crop windows…',
    'Tracking focus point…',
    'Encoding reframed video…',
  ],
  validate: (values) => {
    if (!asFile(values.video)) return 'Upload the video to reframe.'
    if (!asString(values.aspect)) return 'Pick a target aspect ratio.'
    return null
  },
  buildResults: (values) => {
    const aspect = asString(values.aspect, '16:9')
    const [w, h] = ASPECT_DIMS[aspect] ?? [640, 360]
    const focus = asPoint(values.focus)
    return [
      {
        id: 'reframe-result',
        kind: 'video',
        title: `Reframed to ${aspect}`,
        subtitle: focus
          ? `Subject tracked at ${Math.round(focus.x)}%, ${Math.round(focus.y)}%`
          : 'Center-weighted crop',
        badge: aspect,
        thumbnail: shotUrl(`reframe-${aspect.replace(':', 'x')}`, w, h),
        duration: '0:12',
        aspect: `${w} / ${h}`,
      },
    ]
  },
  resultLayout: 'single',
}

export default () => <MiniToolPage config={config} />
