import { SpeakerLoudIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asNumber, shotUrl } from './shared/types'

/** /lip-sync — match an audio track to a performance video. */
const config: ToolConfig = {
  slug: 'lip-sync',
  title: 'Lip Sync',
  tagline: 'Match any audio track to a performance video, with adjustable strength.',
  icon: <SpeakerLoudIcon width={22} height={22} />,
  fields: [
    {
      id: 'video',
      label: 'Video',
      type: 'upload',
      accept: 'video/*',
      hint: 'The performance clip — ideally a mostly frontal face.',
    },
    {
      id: 'audio',
      label: 'Audio',
      type: 'upload',
      accept: 'audio/*',
      hint: 'The dialogue or song to sync to.',
    },
    {
      id: 'strength',
      label: 'Sync strength',
      type: 'slider',
      min: 0,
      max: 100,
      unit: '%',
    },
  ],
  initialValues: { strength: 70 },
  progressLines: [
    'Extracting facial landmarks…',
    'Aligning phonemes to frames…',
    'Rendering mouth region…',
    'Blending and encoding…',
  ],
  validate: (values) => {
    if (!asFile(values.video)) return 'Upload the performance video first.'
    if (!asFile(values.audio)) return 'Upload the audio track to sync.'
    return null
  },
  buildResults: (values) => [
    {
      id: 'lip-sync-result',
      kind: 'video',
      title: 'Lip-synced video',
      subtitle: `Sync strength ${asNumber(values.strength, 70)}% · mouth region re-rendered`,
      badge: 'Synced',
      thumbnail: shotUrl('lip-sync-frames', 640, 360),
      duration: '0:14',
    },
  ],
  resultLayout: 'single',
}

export default () => <MiniToolPage config={config} />
