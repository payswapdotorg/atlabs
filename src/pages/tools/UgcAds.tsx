import { CameraIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asString, asStringArray, shotUrl } from './shared/types'
import { AD_HOOKS, AUDIENCES } from './shared/fixtures'

/** /ugc-ads — spin a product into creator-style ad variants. */
const config: ToolConfig = {
  slug: 'ugc-ads',
  title: 'UGC Ads',
  tagline: 'Spin a product into scroll-stopping creator-style ad variants.',
  icon: <CameraIcon width={22} height={22} />,
  fields: [
    {
      id: 'product',
      label: 'Product shot',
      type: 'upload',
      accept: 'image/*',
      hint: 'A clean product photo on a simple background.',
    },
    {
      id: 'audience',
      label: 'Audience',
      type: 'chips',
      options: AUDIENCES,
      multi: true,
      hint: 'Who should the ad speak to?',
    },
    {
      id: 'script',
      label: 'Ad script',
      type: 'textarea',
      rows: 5,
      placeholder: 'e.g. "POV: you finally found a protein bar that tastes like dessert…"',
    },
  ],
  progressLines: [
    'Analyzing product…',
    'Casting creator persona…',
    'Shooting variants…',
    'Cutting edits…',
  ],
  validate: (values) => {
    if (!asFile(values.product)) return 'Upload a product shot.'
    if (asStringArray(values.audience).length === 0) return 'Pick at least one audience.'
    if (!asString(values.script).trim()) return 'Write the ad script.'
    return null
  },
  buildResults: (values) => {
    const audiences = asStringArray(values.audience)
    const script = asString(values.script).trim()
    const first = script.split('\n')[0] ?? script
    const short = first.length > 44 ? `${first.slice(0, 44)}…` : first
    return AD_HOOKS.map((hook, i) => ({
      id: `ugc-ad-${i}`,
      kind: 'video' as const,
      title: `${hook} — ${audiences[i % audiences.length]}`,
      subtitle: short,
      badge: i === 0 ? '0:15' : '0:09',
      thumbnail: shotUrl(`ugc-ad-${i}`, 480, 600),
      duration: i === 0 ? '0:15' : '0:09',
    }))
  },
  resultLayout: 'grid',
  resultLabel: 'Ad variants',
}

export default () => <MiniToolPage config={config} />
