import { PaperPlaneIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig, ToolResultItem } from './shared/types'
import { asNumber, asString } from './shared/types'
import { DEFAULT_OUTLINE, DECK_TEMPLATES } from './shared/fixtures'

const CLOSING_SECTIONS = [
  ['Market', 'Why this market, why this decade — with the numbers that prove it.'],
  ['Traction', 'Growth curve, retention and the story behind the metrics.'],
  ['Team', 'The people who ship, and the gaps hiring will close.'],
  ['The Ask', 'What you are raising, what it buys, and the milestone it unlocks.'],
]

/** /deck — turn an outline into a structured pitch deck. */
const config: ToolConfig = {
  slug: 'deck',
  title: 'Deck',
  tagline: 'Turn an outline into a structured pitch deck.',
  icon: <PaperPlaneIcon width={22} height={22} />,
  fields: [
    {
      id: 'outline',
      label: 'Outline',
      type: 'textarea',
      rows: 8,
      placeholder: 'One line per slide — first line becomes the title slide.',
    },
    {
      id: 'template',
      label: 'Template',
      type: 'select',
      options: DECK_TEMPLATES,
      placeholder: 'Choose a template',
    },
    {
      id: 'slides',
      label: 'Slide count',
      type: 'select',
      options: [
        { value: '8', label: '8 slides — tight' },
        { value: '10', label: '10 slides — standard' },
        { value: '12', label: '12 slides — detailed' },
      ],
      placeholder: 'Choose a length',
    },
  ],
  initialValues: { outline: DEFAULT_OUTLINE },
  progressLines: [
    'Parsing outline…',
    'Designing master slides…',
    'Laying out content…',
    'Rendering deck…',
  ],
  validate: (values) => {
    if (!asString(values.outline).trim()) return 'Write an outline — one line per slide.'
    if (!asString(values.template)) return 'Pick a template.'
    if (!asString(values.slides)) return 'Pick a slide count.'
    return null
  },
  buildResults: (values) => {
    const lines = asString(values.outline)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const target = asNumber(values.slides, 10)
    const items: ToolResultItem[] = []

    items.push({
      id: 'deck-slide-title',
      kind: 'text',
      title: lines[0] ?? 'Title',
      subtitle: 'Title slide — brand mark, tagline, presenter',
    })

    const body = lines.slice(1)
    body.forEach((line, i) => {
      const [head, ...rest] = line.split(/[:—-]/)
      items.push({
        id: `deck-slide-${i}`,
        kind: 'text',
        title: head.trim() || `Point ${i + 1}`,
        subtitle: rest.join(':').trim() || line,
      })
    })

    let slot = 0
    while (items.length < target && slot < CLOSING_SECTIONS.length) {
      const [name, blurb] = CLOSING_SECTIONS[slot]
      items.push({
        id: `deck-slide-closing-${slot}`,
        kind: 'text',
        title: name,
        subtitle: blurb,
      })
      slot += 1
    }

    return items.slice(0, target)
  },
  resultLayout: 'stepper',
  resultLabel: 'Deck outline',
}

export default () => <MiniToolPage config={config} />
