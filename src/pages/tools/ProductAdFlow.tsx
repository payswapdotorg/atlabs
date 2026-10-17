import { Share1Icon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig, ToolResultItem } from './shared/types'
import { asFiles, asString } from './shared/types'

const FLOW_BEATS: Array<[string, string]> = [
  ['Hook', 'A 2-second pattern interrupt built from your strongest USP.'],
  ['Product reveal', 'Hero product beat — the uploaded shots cut to music.'],
  ['USP cascade', 'Each USP gets a 3-second proof moment.'],
  ['Social proof', 'Review pull-quotes and rating badges.'],
  ['Call to action', 'Offer, urgency and a single decisive tap target.'],
]

/** /product-ad-flow — build a sequenced product ad from images and USPs. */
const config: ToolConfig = {
  slug: 'product-ad-flow',
  title: 'Product Ad Flow',
  tagline: 'Build a sequenced product ad from images and USPs.',
  icon: <Share1Icon width={22} height={22} />,
  fields: [
    {
      id: 'images',
      label: 'Product images',
      type: 'upload',
      accept: 'image/*',
      multiple: true,
      hint: '3-6 shots: hero, detail, in-use.',
    },
    {
      id: 'usps',
      label: 'USPs',
      type: 'textarea',
      rows: 5,
      placeholder: 'One USP per line, strongest first —\nShips cold in 24 hours\nZero-sugar recipe\nChef-designed menu',
    },
  ],
  progressLines: [
    'Sequencing beats…',
    'Matching shots to USPs…',
    'Adding proof moments…',
    'Rendering flow…',
  ],
  validate: (values) => {
    if (asFiles(values.images).length < 2) return 'Upload at least 2 product images.'
    if (!asString(values.usps).trim()) return 'List at least one USP.'
    return null
  },
  buildResults: (values) => {
    const usps = asString(values.usps)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const images = asFiles(values.images).length
    return FLOW_BEATS.map(([title, blurb], i): ToolResultItem => {
      const usp = usps[i % Math.max(usps.length, 1)]
      return {
        id: `flow-beat-${i}`,
        kind: 'text',
        title,
        subtitle:
          i === 2 && usp
            ? `${blurb} First up: “${usp}”.`
            : `${blurb} (${images} shots available)`,
      }
    })
  },
  resultLayout: 'stepper',
  resultLabel: 'Ad flow',
}

export default () => <MiniToolPage config={config} />
