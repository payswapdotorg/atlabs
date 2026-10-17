import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircledIcon, Cross2Icon, TextIcon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import { useToast } from '../../components/Toast'
import { createStory } from '../../lib/api/stories'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { cn } from '../../lib/utils'
import { DropZone, PageSelect, SectionLabel } from './_shared'

const CAPTION_STYLES = [
  { id: 'bold-yellow', name: 'Bold Yellow', from: '#facc15', to: '#a16207' },
  { id: 'clean-white', name: 'Clean White', from: '#f8fafc', to: '#475569' },
  { id: 'karaoke-pop', name: 'Karaoke Pop', from: '#f472b6', to: '#9d174d' },
  { id: 'terminal', name: 'Terminal', from: '#86efac', to: '#14532d' },
  { id: 'retro-vhs', name: 'Retro VHS', from: '#c4b5fd', to: '#5b21b6' },
  { id: 'minimal-box', name: 'Minimal Box', from: '#e2e8f0', to: '#1e293b' },
]

const styleThumb = (from: string, to: string, name: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="124"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="220" height="124" fill="url(#g)"/><rect x="35" y="88" width="150" height="20" rx="4" fill="rgba(0,0,0,0.55)"/><text x="110" y="102" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="11" fill="#fff">${name.toUpperCase()}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const BURN_IN_OPTIONS = [
  { value: 'burned', label: 'Burn into video (baked-in)' },
  { value: 'sidecar', label: 'Sidecar .srt file' },
  { value: 'both', label: 'Both' },
]

const POSITIONS = [
  { value: 'bottom', label: 'Bottom center' },
  { value: 'lower-third', label: 'Lower third' },
  { value: 'top', label: 'Top center' },
]

/**
 * NewVideoCaptions — upload a video, pick a caption style, choose
 * burn-in behavior, then produce a captioned cut.
 */
const NewVideoCaptions: React.FC = () => {
  useDocumentTitle('New Video Captions | Atlabs AI')
  const navigate = useNavigate()
  const { toast } = useToast()

  const [video, setVideo] = useState<{ name: string; size: string } | null>(null)
  const [style, setStyle] = useState('bold-yellow')
  const [burnIn, setBurnIn] = useState('burned')
  const [position, setPosition] = useState('bottom')
  const [creating, setCreating] = useState(false)

  const create = async () => {
    if (!video) {
      toast({ title: 'Add a video first', description: 'Drop an mp4 or mov to continue.', variant: 'error' })
      return
    }
    setCreating(true)
    try {
      const story = await createStory({
        title: video.name.replace(/\.(mp4|mov|webm)$/i, ''),
        script: `Captions pass — ${CAPTION_STYLES.find((s) => s.id === style)?.name}`,
        style: CAPTION_STYLES.find((s) => s.id === style)?.name ?? 'Bold Yellow',
        language: 'English (US)',
        voice: 'Original audio',
        scene_pace: 'As uploaded',
        workflow_type: 'CAPTIONS',
        song_name: video.name,
      })
      toast({ title: 'Captioning started', description: 'Transcribing and timing captions…', variant: 'success' })
      navigate('/generating', { state: { storyId: story.id } })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-9 text-gray-1">
          <TextIcon width={18} height={18} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-gray-12">Caption a Video</h2>
          <p className="text-sm text-gray-10">
            Upload a cut, pick a caption look, and burn it in or export a sidecar file.
          </p>
        </div>
      </div>

      {/* Video upload */}
      <section className="mt-5" aria-label="Video upload">
        <SectionLabel>Video</SectionLabel>
        {video ? (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-card border border-gray-a6 bg-white px-4 py-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <CheckCircledIcon width={18} height={18} className="shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-12">{video.name}</p>
                <p className="text-xs text-gray-10">{video.size} · uploaded</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Remove video"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-gray-10 transition-colors hover:bg-gray-2 hover:text-gray-12"
              onClick={() => setVideo(null)}
            >
              <Cross2Icon width={14} height={14} />
            </button>
          </div>
        ) : (
          <DropZone
            className="mt-2"
            accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
            label="Drop your video here (mp4 / mov / webm)"
            hint="Up to 20 minutes"
            onFiles={(files) => {
              const f = files[0]
              setVideo({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` })
            }}
          />
        )}
      </section>

      {/* Caption style */}
      <section className="mt-5" aria-label="Caption style">
        <SectionLabel>Caption style</SectionLabel>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CAPTION_STYLES.map((s) => {
            const selected = style === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                aria-pressed={selected}
                className={cn(
                  'overflow-hidden rounded-control border bg-white text-left text-xs font-semibold text-gray-12 transition-all',
                  selected
                    ? 'border-yellow-9 ring-1 ring-yellow-9'
                    : 'border-gray-a6 hover:border-gray-8',
                )}
              >
                <img
                  src={styleThumb(s.from, s.to, s.name)}
                  alt={`${s.name} caption style preview`}
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
                <span className="block px-2.5 py-2">{s.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Burn-in options */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Burn-in options">
        <div>
          <SectionLabel>Output</SectionLabel>
          <PageSelect
            className="mt-2 w-full"
            ariaLabel="Caption output"
            value={burnIn}
            onValueChange={setBurnIn}
            options={BURN_IN_OPTIONS}
          />
        </div>
        <div>
          <SectionLabel>Position</SectionLabel>
          <PageSelect
            className="mt-2 w-full"
            ariaLabel="Caption position"
            value={position}
            onValueChange={setPosition}
            options={POSITIONS}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-a6 pt-4">
        <AtlabsButton variant="ghost" size="md" onClick={() => navigate('/app')}>
          Back to home
        </AtlabsButton>
        <AtlabsButton
          variant="primary"
          size="lg"
          className="text-xs font-bold uppercase tracking-wider"
          disabled={creating || !video}
          onClick={create}
        >
          {creating ? 'Starting…' : 'Create Captioned Video'}
        </AtlabsButton>
      </div>
    </div>
  )
}

export default NewVideoCaptions
