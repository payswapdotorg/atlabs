import React, { useMemo, useState } from 'react'
import {
  DownloadIcon,
  PlayIcon,
  SpeakerLoudIcon,
  StopIcon,
} from '@radix-ui/react-icons'
import { AtlabsButton } from '../../../components/AtlabsButton'
import { cn } from '../../../lib/utils'
import { useToast } from '../../../components/Toast'
import { FixtureImage } from '../../library/_shared'
import { useFileUrl } from './customFields'
import type { FieldValue, ToolConfig, ToolResultItem } from './types'
import { asFile, asFiles } from './types'

export type GenerationStatus = 'idle' | 'generating' | 'done'

const DEFAULT_PROGRESS_LINES = [
  'Uploading inputs…',
  'Queuing on the render farm…',
  'Generating…',
  'Finalizing…',
]

/* ------------------------------------------------------------------ */
/* InputPreview — honest local preview of the uploaded media          */
/* ------------------------------------------------------------------ */

const InputPreview: React.FC<{ value: FieldValue }> = ({ value }) => {
  const file = asFile(value) ?? asFiles(value)[0] ?? null
  const url = useFileUrl(file)

  if (!file || !url) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-gray-a6 bg-gray-1 text-gray-9">
        <PlayIcon width={26} height={26} />
        <p className="text-sm font-medium">Preview will appear here</p>
        <p className="text-xs">Upload your input, then generate.</p>
      </div>
    )
  }

  if (file.type.startsWith('video/')) {
    return (
      <video
        src={url}
        controls
        muted
        className="aspect-video w-full rounded-card border border-gray-a6 bg-black object-contain"
      />
    )
  }
  if (file.type.startsWith('audio/')) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-card border border-gray-a6 bg-gradient-to-br from-gray-3 to-gray-2">
        <SpeakerLoudIcon width={34} height={34} className="text-gray-10" />
        <p className="max-w-xs truncate px-6 text-sm font-medium text-gray-11">{file.name}</p>
        <audio controls src={url} className="w-full max-w-xs" />
      </div>
    )
  }
  return (
    <img
      src={url}
      alt={file.name}
      className="aspect-video w-full rounded-card border border-gray-a6 bg-gray-2 object-contain"
    />
  )
}

/* ------------------------------------------------------------------ */
/* GeneratingView — progress bar + rotating status lines              */
/* ------------------------------------------------------------------ */

const GeneratingView: React.FC<{ progress: number; lines: string[] }> = ({
  progress,
  lines,
}) => {
  const active = Math.min(
    lines.length - 1,
    Math.floor((progress / 100) * lines.length),
  )
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-card border border-gray-a6 bg-gray-1 px-6">
      <div className="w-full max-w-sm" aria-live="polite">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-11">
          <span>{lines[active]}</span>
          <span className="tabular-nums text-gray-12">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-a6">
          <div
            className="h-full rounded-full bg-yellow-9 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-10">
        This is a fixture pipeline — it completes in a few seconds.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Result pieces                                                      */
/* ------------------------------------------------------------------ */

const KindBadge: React.FC<{ item: ToolResultItem }> = ({ item }) =>
  item.badge ? (
    <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      {item.badge}
    </span>
  ) : null

const MediaThumb: React.FC<{
  item: ToolResultItem
  className?: string
  style?: React.CSSProperties
}> = ({ item, className, style }) => (
  <div
    style={style}
    className={cn('relative overflow-hidden rounded-card bg-gray-2', className)}
  >
    {item.thumbnail ? (
      <FixtureImage
        src={item.thumbnail}
        seed={item.id}
        alt={item.title}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-3 to-gray-2 text-gray-10">
        <SpeakerLoudIcon width={22} height={22} />
      </div>
    )}
    <KindBadge item={item} />
    {item.kind === 'video' ? (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow">
          <PlayIcon width={17} height={17} className="text-gray-12" />
        </span>
      </span>
    ) : null}
    {item.duration ? (
      <span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white">
        {item.duration}
      </span>
    ) : null}
  </div>
)

const FakePlayRow: React.FC<{ item: ToolResultItem }> = ({ item }) => {
  const [playing, setPlaying] = useState(false)
  const isAudio = item.kind === 'audio'
  return (
    <button
      type="button"
      aria-label={playing ? `Stop ${item.title}` : `Play ${item.title}`}
      onClick={() => setPlaying((p) => !p)}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-a6 bg-white text-gray-11 transition-colors hover:bg-gray-2"
    >
      {playing ? (
        <StopIcon width={13} height={13} />
      ) : (
        <PlayIcon width={13} height={13} />
      )}
      {playing && isAudio ? (
        <span className="ml-2 flex h-4 items-end gap-0.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-0.5 animate-pulse rounded-full bg-yellow-9"
              style={{ height: `${6 + ((i * 5) % 9)}px`, animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
      ) : null}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Result layouts                                                     */
/* ------------------------------------------------------------------ */

const SingleResult: React.FC<{ item: ToolResultItem }> = ({ item }) => (
  <div className="flex flex-col gap-3">
    <MediaThumb
      item={item}
      className={item.aspect ? 'w-full' : 'aspect-video'}
      style={item.aspect ? { aspectRatio: item.aspect } : undefined}
    />
    <div>
      <h3 className="text-sm font-semibold text-gray-12">{item.title}</h3>
      {item.subtitle ? (
        <p className="mt-0.5 text-xs text-gray-10">{item.subtitle}</p>
      ) : null}
    </div>
  </div>
)

const GridResult: React.FC<{ items: ToolResultItem[] }> = ({ items }) => (
  <div className="grid grid-cols-2 gap-3">
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        className="group overflow-hidden rounded-card border border-gray-a6 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <MediaThumb item={item} className="aspect-video" />
        <div className="p-2.5">
          <h3 className="truncate text-xs font-semibold text-gray-12">{item.title}</h3>
          {item.subtitle ? (
            <p className="mt-0.5 truncate text-[11px] text-gray-10">{item.subtitle}</p>
          ) : null}
        </div>
      </button>
    ))}
  </div>
)

const ListResult: React.FC<{ items: ToolResultItem[] }> = ({ items }) => (
  <ul className="flex flex-col divide-y divide-gray-a4">
    {items.map((item) => (
      <li key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
        <MediaThumb item={item} className="h-12 w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-12">{item.title}</h3>
          <p className="mt-0.5 truncate text-xs text-gray-10">
            {item.subtitle}
            {item.duration ? ` · ${item.duration}` : ''}
          </p>
        </div>
        {item.kind === 'audio' || item.kind === 'video' ? (
          <FakePlayRow item={item} />
        ) : null}
      </li>
    ))}
  </ul>
)

const StepperResult: React.FC<{ items: ToolResultItem[] }> = ({ items }) => (
  <ol className="flex flex-col gap-0">
    {items.map((item, i) => (
      <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
        {i < items.length - 1 ? (
          <span
            aria-hidden
            className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-gray-a6"
          />
        ) : null}
        <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-12 text-[10px] font-bold text-gray-1">
          {i + 1}
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-sm font-semibold text-gray-12">{item.title}</h3>
          {item.subtitle ? (
            <p className="mt-0.5 text-xs leading-relaxed text-gray-10">{item.subtitle}</p>
          ) : null}
        </div>
      </li>
    ))}
  </ol>
)

/* ------------------------------------------------------------------ */
/* ToolPreviewPanel                                                   */
/* ------------------------------------------------------------------ */

const ToolPreviewPanel: React.FC<{
  config: ToolConfig
  values: Record<string, FieldValue>
  status: GenerationStatus
  progress: number
  items: ToolResultItem[]
  onReset: () => void
}> = ({ config, values, status, progress, items, onReset }) => {
  const { toast } = useToast()

  const firstUploadValue = useMemo(() => {
    for (const field of config.fields) {
      if (field.type !== 'upload') continue
      const v = values[field.id]
      if (v instanceof File || (Array.isArray(v) && v.length > 0)) return v
    }
    return null
  }, [config.fields, values])

  const lines = config.progressLines ?? DEFAULT_PROGRESS_LINES
  const layout = config.resultLayout ?? 'single'

  const download = (item: ToolResultItem) => {
    toast({
      title: 'Download started (mock)',
      description: `${item.title} would export from the real pipeline.`,
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {status === 'idle' ? <InputPreview value={firstUploadValue} /> : null}

      {status === 'generating' ? (
        <GeneratingView progress={progress} lines={lines} />
      ) : null}

      {status === 'done' ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-10">
              {config.resultLabel ?? 'Result'}
            </h2>
            <div className="flex items-center gap-2">
              {items.length > 0 ? (
                <AtlabsButton
                  variant="secondary"
                  size="sm"
                  onClick={() => download(items[0])}
                >
                  <DownloadIcon width={13} height={13} />
                  Download
                </AtlabsButton>
              ) : null}
              <AtlabsButton variant="ghost" size="sm" onClick={onReset}>
                Start over
              </AtlabsButton>
            </div>
          </div>

          {layout === 'single' && items[0] ? <SingleResult item={items[0]} /> : null}
          {layout === 'grid' ? <GridResult items={items} /> : null}
          {layout === 'list' ? <ListResult items={items} /> : null}
          {layout === 'stepper' ? <StepperResult items={items} /> : null}

          <p className="text-xs text-gray-9">
            Fixture output — the real pipeline replaces these placeholders.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default ToolPreviewPanel
