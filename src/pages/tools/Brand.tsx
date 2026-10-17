import { IdCardIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFile, asString, asStringArray, shotUrl } from './shared/types'
import { BODY_FONTS, FONT_NAME, HEADING_FONTS } from './shared/fixtures'
import { PaletteField } from './shared/customFields'

/** /brand — brand kit: logo, palette, fonts and tone of voice. */
const config: ToolConfig = {
  slug: 'brand',
  title: 'Brand Kit',
  tagline: 'Store your logo, palette, fonts and tone for consistent generation.',
  icon: <IdCardIcon width={22} height={22} />,
  generateLabel: 'Save Brand Kit',
  fields: [
    {
      id: 'logo',
      label: 'Logo',
      type: 'upload',
      accept: 'image/*',
      hint: 'PNG or SVG on a transparent background.',
    },
    {
      id: 'palette',
      label: 'Color palette',
      type: 'custom',
      hint: 'Toggle swatches or add a custom color.',
      render: (ctx) => <PaletteField {...ctx} />,
    },
    {
      id: 'headingFont',
      label: 'Heading font',
      type: 'select',
      options: HEADING_FONTS,
      placeholder: 'Choose a heading font',
    },
    {
      id: 'bodyFont',
      label: 'Body font',
      type: 'select',
      options: BODY_FONTS,
      placeholder: 'Choose a body font',
    },
    {
      id: 'tone',
      label: 'Tone of voice',
      type: 'textarea',
      rows: 3,
      placeholder: 'e.g. "Confident, warm, never corporate. Speaks like a helpful senior editor."',
    },
  ],
  validate: (values) => {
    if (!asFile(values.logo)) return 'Upload your logo.'
    if (asStringArray(values.palette).length === 0) return 'Pick at least one brand color.'
    if (!asString(values.headingFont)) return 'Choose a heading font.'
    if (!asString(values.bodyFont)) return 'Choose a body font.'
    if (!asString(values.tone).trim()) return 'Describe your tone of voice.'
    return null
  },
  buildResults: (values) => {
    const palette = asStringArray(values.palette)
    const heading = FONT_NAME[asString(values.headingFont, 'grotesk')] ?? 'Space Grotesk'
    const body = FONT_NAME[asString(values.bodyFont, 'inter')] ?? 'Inter'
    return [
      {
        id: 'brand-kit-summary',
        kind: 'image',
        title: 'Brand kit saved',
        subtitle: `${palette.length} colors · ${heading} / ${body} · tone captured`,
        badge: 'Saved',
        thumbnail: shotUrl('brand-kit-card', 640, 360),
      },
    ]
  },
  resultLayout: 'single',
  resultLabel: 'Brand kit',
}

export default () => <MiniToolPage config={config} />
