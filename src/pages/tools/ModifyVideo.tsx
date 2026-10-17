import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asString, shotUrl } from './shared/types'

/** /modify-video — describe a change and re-render an existing video. */
const config: ToolConfig = {
  slug: 'modify-video',
  title: 'Modify Video',
  tagline: 'Describe a change and re-render an existing video.',
  icon: <MixerHorizontalIcon width={22} height={22} />,
  fields: [
    {
      id: 'video',
      label: 'Video',
      type: 'upload',
      accept: 'video/*',
    },
    {
      id: 'prompt',
      label: 'Change description',
      type: 'textarea',
      rows: 4,
      placeholder: 'e.g. "Make it nighttime with neon reflections on the wet street"',
    },
  ],
  progressLines: [
    'Indexing frames…',
    'Applying described change…',
    'Re-rendering affected shots…',
    'Encoding video…',
  ],
  validate: (values) => {
    if (!asFile(values.video)) return 'Upload the video to modify.'
    if (!asString(values.prompt).trim()) return 'Describe the change you want.'
    return null
  },
  buildResults: (values) => {
    const prompt = asString(values.prompt).trim()
    const short = prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt
    return [
      {
        id: 'modify-video-result',
        kind: 'video',
        title: 'Modified video',
        subtitle: `Applied: “${short}”`,
        badge: 'Re-rendered',
        thumbnail: shotUrl('modify-video-scene', 640, 360),
        duration: '0:18',
      },
    ]
  },
  resultLayout: 'single',
}

export default () => <MiniToolPage config={config} />
