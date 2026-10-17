import type React from 'react'
import {
  CameraIcon,
  CropIcon,
  GearIcon,
  IdCardIcon,
  ImageIcon,
  LayersIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  PaperPlaneIcon,
  PersonIcon,
  PlayIcon,
  ReaderIcon,
  Share1Icon,
  SpeakerLoudIcon,
  SymbolIcon,
  TimerIcon,
} from '@radix-ui/react-icons'

/** Hub metadata only — the mini tool configs live in their route files. */
export interface ToolCardSpec {
  slug: string
  name: string
  description: string
  to: string
  icon: React.ReactNode
}

export const TOOL_GROUPS: Array<{ label: string; tools: ToolCardSpec[] }> = [
  {
    label: 'Video tools',
    tools: [
      {
        slug: 'avatar-video',
        name: 'Avatar Video',
        description: 'Turn a portrait into a talking-head video with a scripted voice.',
        to: '/avatar-video',
        icon: <PersonIcon width={20} height={20} />,
      },
      {
        slug: 'lip-sync',
        name: 'Lip Sync',
        description: 'Match any audio track to a performance video, with adjustable strength.',
        to: '/lip-sync',
        icon: <SpeakerLoudIcon width={20} height={20} />,
      },
      {
        slug: 'motion',
        name: 'Motion',
        description: 'Bring a still image to life with preset camera moves.',
        to: '/motion',
        icon: <PlayIcon width={20} height={20} />,
      },
      {
        slug: 'motion-control',
        name: 'Motion Control',
        description: 'Draw an exact motion path and animate your image along it.',
        to: '/motion-control',
        icon: <SymbolIcon width={20} height={20} />,
      },
      {
        slug: 'modify-video',
        name: 'Modify Video',
        description: 'Describe a change and re-render an existing video.',
        to: '/modify-video',
        icon: <MixerHorizontalIcon width={20} height={20} />,
      },
      {
        slug: 'reframe',
        name: 'Reframe',
        description: 'Convert video between aspect ratios while keeping the subject in frame.',
        to: '/reframe',
        icon: <CropIcon width={20} height={20} />,
      },
      {
        slug: 'inpaint',
        name: 'Inpaint',
        description: 'Brush over an area and regenerate it from a prompt.',
        to: '/inpaint',
        icon: <MagnifyingGlassIcon width={20} height={20} />,
      },
      {
        slug: 'upscale',
        name: 'Upscale',
        description: 'Scale footage up to 4× with detail-restoring super resolution.',
        to: '/upscale',
        icon: <LayersIcon width={20} height={20} />,
      },
      {
        slug: 'video-captions',
        name: 'Video Captions',
        description: 'Add burned-in captions to an uploaded video.',
        to: '/new-video-captions',
        icon: <ReaderIcon width={20} height={20} />,
      },
    ],
  },
  {
    label: 'Audio tools',
    tools: [
      {
        slug: 'music',
        name: 'Music',
        description: 'Generate royalty-free tracks from genre, mood and duration cues.',
        to: '/music',
        icon: <PlayIcon width={20} height={20} />,
      },
      {
        slug: 'voices',
        name: 'Voices',
        description: 'Render any script with studio-grade AI voice-over.',
        to: '/voices',
        icon: <SpeakerLoudIcon width={20} height={20} />,
      },
    ],
  },
  {
    label: 'Image tools',
    tools: [
      {
        slug: 'image',
        name: 'Image Studio',
        description: 'Generate styled images from prompts, in any aspect ratio.',
        to: '/image',
        icon: <ImageIcon width={20} height={20} />,
      },
      {
        slug: 'lora-training',
        name: 'LoRA Training',
        description: 'Train a personal LoRA on a set of subject images.',
        to: '/lora-training',
        icon: <GearIcon width={20} height={20} />,
      },
    ],
  },
  {
    label: 'Brand tools',
    tools: [
      {
        slug: 'brand',
        name: 'Brand Kit',
        description: 'Store your logo, palette, fonts and tone for consistent generation.',
        to: '/brand',
        icon: <IdCardIcon width={20} height={20} />,
      },
      {
        slug: 'deck',
        name: 'Deck',
        description: 'Turn an outline into a structured pitch deck.',
        to: '/deck',
        icon: <PaperPlaneIcon width={20} height={20} />,
      },
      {
        slug: 'ugc-ads',
        name: 'UGC Ads',
        description: 'Spin a product into scroll-stopping creator-style ad variants.',
        to: '/ugc-ads',
        icon: <CameraIcon width={20} height={20} />,
      },
      {
        slug: 'product-ad-flow',
        name: 'Product Ad Flow',
        description: 'Build a sequenced product ad from images and USPs.',
        to: '/product-ad-flow',
        icon: <Share1Icon width={20} height={20} />,
      },
      {
        slug: 'paparazzi-sighting',
        name: 'Paparazzi Sighting',
        description: 'Generate candid celebrity-style sighting shots from one photo.',
        to: '/paparazzi-sighting',
        icon: <TimerIcon width={20} height={20} />,
      },
    ],
  },
]

/** Flat list for counts / search — Video Captions included. */
export const ALL_TOOLS: ToolCardSpec[] = TOOL_GROUPS.flatMap((g) => g.tools)

