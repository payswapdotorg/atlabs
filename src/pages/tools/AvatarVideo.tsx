import { PersonIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asString, estimateDuration, shotUrl } from './shared/types'
import { VOICE_OPTIONS, voiceName } from './shared/fixtures'

/** /avatar-video — talking-head avatar from a portrait + script. */
const config: ToolConfig = {
  slug: 'avatar-video',
  title: 'Avatar Video',
  tagline: 'Turn a portrait photo into a talking-head video with a scripted voice.',
  icon: <PersonIcon width={22} height={22} />,
  fields: [
    {
      id: 'portrait',
      label: 'Portrait',
      type: 'upload',
      accept: 'image/*',
      hint: 'Front-facing photo with a clear mouth line works best.',
    },
    {
      id: 'script',
      label: 'Script',
      type: 'textarea',
      rows: 6,
      placeholder: 'What should your avatar say? e.g. "Hi, I am your Atlabs anchor…"',
    },
    {
      id: 'voice',
      label: 'Voice',
      type: 'select',
      options: VOICE_OPTIONS,
      placeholder: 'Choose a voice',
    },
  ],
  progressLines: [
    'Analyzing portrait…',
    'Synthesizing visemes…',
    'Rendering talking head…',
    'Finalizing video…',
  ],
  validate: (values) => {
    if (!asFile(values.portrait)) return 'Upload a portrait photo first.'
    if (!asString(values.script).trim()) return 'Write a script for your avatar.'
    return null
  },
  buildResults: (values) => {
    const voice = asString(values.voice, 'ira')
    const script = asString(values.script)
    return [
      {
        id: 'avatar-video-result',
        kind: 'video',
        title: 'Avatar talking-head',
        subtitle: `${voiceName(voice)} voice-over · ${script.trim().split(/\s+/).filter(Boolean).length} words`,
        badge: '1080p',
        thumbnail: shotUrl('avatar-video-portrait', 640, 360),
        duration: estimateDuration(script),
      },
    ]
  },
  resultLayout: 'single',
}

export default () => <MiniToolPage config={config} />
