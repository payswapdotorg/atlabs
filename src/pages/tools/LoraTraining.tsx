import { GearIcon } from '@radix-ui/react-icons'
import MiniToolPage from './shared/MiniToolPage'
import type { ToolConfig } from './shared/types'
import { asFiles, asNumber, asString, shotUrl } from './shared/types'
import { EPOCH_OPTIONS, LORA_BASE_MODELS } from './shared/fixtures'
import { SubjectGridField } from './shared/customFields'

/** /lora-training — train a personal LoRA on a set of subject images. */
const config: ToolConfig = {
  slug: 'lora-training',
  title: 'LoRA Training',
  tagline: 'Train a personal LoRA on a set of subject images.',
  icon: <GearIcon width={22} height={22} />,
  description:
    'Upload 6-20 shots of the same subject, pick a base model and epoch budget, then run training. The fixture run completes in seconds.',
  fields: [
    {
      id: 'images',
      label: 'Subject images',
      type: 'upload',
      accept: 'image/*',
      multiple: true,
      hint: '6-20 varied shots: angles, distances, lighting.',
    },
    {
      id: 'grid',
      label: 'Training set',
      type: 'custom',
      render: (ctx) => <SubjectGridField {...ctx} />,
    },
    {
      id: 'trigger',
      label: 'Trigger word',
      type: 'text',
      placeholder: 'e.g. my_subject',
    },
    {
      id: 'base',
      label: 'Base model',
      type: 'select',
      options: LORA_BASE_MODELS,
      placeholder: 'Choose a base model',
    },
    {
      id: 'epochs',
      label: 'Epochs',
      type: 'select',
      options: EPOCH_OPTIONS,
      placeholder: 'Choose an epoch budget',
    },
  ],
  durationMs: 3600,
  progressLines: [
    'Preparing dataset…',
    'Training LoRA weights — epoch 1/2…',
    'Training LoRA weights — epoch 2/2…',
    'Validating checkpoints…',
    'Packaging model…',
  ],
  validate: (values) => {
    if (asFiles(values.images).length < 3) return 'Upload at least 3 subject images.'
    if (!asString(values.trigger).trim()) return 'Choose a trigger word.'
    if (!asString(values.base)) return 'Pick a base model.'
    if (!asString(values.epochs)) return 'Pick an epoch budget.'
    return null
  },
  buildResults: (values) => {
    const trigger = asString(values.trigger).trim()
    const epochs = asNumber(values.epochs, 10)
    const images = asFiles(values.images).length
    const base = asString(values.base, 'sdxl')
    const baseLabel =
      LORA_BASE_MODELS.find((o) => o.value === base)?.label ?? 'SDXL Base 1.0'
    return [
      {
        id: 'lora-checkpoint',
        kind: 'image',
        title: `lora_${trigger}_${epochs}e.safetensors`,
        subtitle: `${baseLabel} · ${images} source images · ${epochs} epochs · loss 0.032`,
        badge: 'LoRA ready',
        thumbnail: shotUrl(`lora-${trigger}`, 640, 360),
      },
    ]
  },
  resultLayout: 'single',
  resultLabel: 'Trained checkpoint',
}

export default () => <MiniToolPage config={config} />
