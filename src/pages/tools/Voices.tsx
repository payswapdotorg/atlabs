import { SpeakerLoudIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asString, estimateDuration } from './shared/types'
import { VoiceListField } from './shared/customFields'
import { voiceName, voiceTags } from './shared/fixtures'

/** /voices — render any script with studio-grade AI voice-over. */
const config: ToolConfig = {
  slug: 'voices',
  title: 'Voices',
  tagline: 'Render any script with studio-grade AI voice-over.',
  icon: <SpeakerLoudIcon width={22} height={22} />,
  fields: [
    {
      id: 'text',
      label: 'Script',
      type: 'textarea',
      rows: 7,
      placeholder: 'Paste or write the narration text to render…',
    },
    {
      id: 'voice',
      label: 'Voice',
      type: 'custom',
      hint: 'Preview a sample, then select the voice to render with.',
      render: (ctx) => <VoiceListField {...ctx} />,
    },
  ],
  progressLines: [
    'Normalizing script…',
    'Synthesizing speech…',
    'Applying studio EQ…',
    'Encoding audio…',
  ],
  validate: (values) => {
    if (!asString(values.text).trim()) return 'Write the script to voice.'
    if (!asString(values.voice)) return 'Select a voice.'
    return null
  },
  buildResults: (values) => {
    const voice = asString(values.voice, 'ira')
    const text = asString(values.text)
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return [
      {
        id: 'voiceover-result',
        kind: 'audio',
        title: `voiceover-${voice}.mp3`,
        subtitle: `${voiceName(voice)} · ${voiceTags(voice)} · ${words} words`,
        badge: 'Studio',
        duration: estimateDuration(text),
      },
    ]
  },
  resultLayout: 'single',
  resultLabel: 'Voice-over',
}

export default () => <MiniToolPage config={config} />
