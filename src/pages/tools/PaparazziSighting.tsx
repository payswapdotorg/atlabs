import { TimerIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asNumber, asString, pickN, shotUrl } from './shared/types'
import { SIGHTING_CAPTIONS } from './shared/fixtures'

/** /paparazzi-sighting — candid celebrity-style shots from one photo. */
const config: ToolConfig = {
  slug: 'paparazzi-sighting',
  title: 'Paparazzi Sighting',
  tagline: 'Generate candid celebrity-style sighting shots from one photo.',
  icon: <TimerIcon width={22} height={22} />,
  fields: [
    {
      id: 'photo',
      label: 'Subject photo',
      type: 'upload',
      accept: 'image/*',
      hint: 'A clear solo shot of the subject.',
    },
    {
      id: 'scenario',
      label: 'Scenario',
      type: 'textarea',
      rows: 3,
      placeholder: 'e.g. "spotted outside a Mumbai film studio late at night"',
    },
    {
      id: 'shots',
      label: 'Shot count',
      type: 'select',
      options: [
        { value: '3', label: '3 shots' },
        { value: '6', label: '6 shots' },
      ],
      placeholder: 'How many shots',
    },
  ],
  progressLines: [
    'Analyzing subject…',
    'Matching lighting to scenario…',
    'Composing candid frames…',
    'Grading shots…',
  ],
  validate: (values) => {
    if (!asFile(values.photo)) return 'Upload the subject photo.'
    if (!asString(values.scenario).trim()) return 'Describe the sighting scenario.'
    if (!asString(values.shots)) return 'Pick how many shots to generate.'
    return null
  },
  buildResults: (values) => {
    const scenario = asString(values.scenario).trim()
    const count = asNumber(values.shots, 3)
    const captions = pickN(SIGHTING_CAPTIONS, count, scenario.length)
    return captions.map((caption, i) => ({
      id: `sighting-${i}`,
      kind: 'image' as const,
      title: `Sighting #${i + 1}`,
      subtitle: `Subject ${caption} — ${scenario}`,
      badge: i === 0 ? 'Lead shot' : undefined,
      thumbnail: shotUrl(`sighting-${i}`, 480, 600),
    }))
  },
  resultLayout: 'grid',
  resultLabel: 'Sighting shots',
}

export default () => <MiniToolPage config={config} />
