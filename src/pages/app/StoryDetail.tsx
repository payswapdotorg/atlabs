import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DownloadIcon,
  PlayIcon,
  RocketIcon,
} from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Modal from '../../components/Modal'
import Skeleton from '../../components/Skeleton'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../components/Toast'
import { usePageHeader } from '../../AppShell'
import { getStory } from '../../lib/api/stories'
import type { StoryDetail } from '../../lib/api/stories'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { cn } from '../../lib/utils'
import { PageSelect, SectionLabel, StatusBadge } from './_shared'

const fmtDuration = (s: number): string =>
  `${Math.floor(s / 60)}m ${s % 60}s`

/**
 * StoryDetail — read/edit surface for one story: mock preview player,
 * shot strip, transcript panel, version selector and Export (which
 * opens the credits modal when the balance is 0, matching live behavior).
 */
const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { setTitle } = usePageHeader()
  const [story, setStory] = useState<StoryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [version, setVersion] = useState('0')

  const balance = user?.credit_summary?.balance ?? 0
  const storyId = Number(id)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    if (!Number.isFinite(storyId)) {
      navigate('/projects', { replace: true })
      return
    }
    getStory(storyId).then((result) => {
      if (cancelled) return
      if (!result) {
        navigate('/projects', { replace: true })
        return
      }
      setStory(result)
      setTitle(result.title)
      setLoading(false)
    })
    return () => {
      cancelled = true
      setTitle(null)
    }
  }, [storyId, navigate, setTitle])

  const title = story?.title ?? 'Story'

  useDocumentTitle(`${title} | Atlabs AI`)

  const onExport = () => {
    if (balance === 0) {
      setExportOpen(true)
      return
    }
    toast({
      title: 'Export queued',
      description: 'We will email you when the MP4 is ready.',
      variant: 'success',
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl" aria-busy="true" aria-label="Loading story">
        <Skeleton className="aspect-video w-full rounded-card" />
        <Skeleton className="mt-4 h-5 w-64" />
        <div className="mt-4 flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-44 shrink-0 rounded-control" />
          ))}
        </div>
      </div>
    )
  }

  if (!story) return null

  return (
    <div className="mx-auto max-w-5xl">
      {/* Preview player (mock) */}
      <div className="relative overflow-hidden rounded-card border border-gray-a6 bg-gray-12 shadow-sm">
        {story.thumbnail_url ? (
          <img
            src={story.thumbnail_url}
            alt=""
            className="aspect-video w-full object-cover opacity-80"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-gray-12">
            <p className="text-sm text-gray-10">Preview will appear after rendering</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause preview' : 'Play preview'}
          className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-gray-12 shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-9"
        >
          {playing ? (
            <span className="flex gap-1" aria-hidden>
              <span className="h-4 w-1.5 rounded bg-gray-12" />
              <span className="h-4 w-1.5 rounded bg-gray-12" />
            </span>
          ) : (
            <PlayIcon width={20} height={20} />
          )}
        </button>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={story.status} />
            <span className="text-xs font-medium text-white/90">
              {fmtDuration(story.duration_seconds)}
            </span>
          </div>
          <span className="text-xs text-white/70">
            {playing ? 'Playing preview…' : `${story.shots.length} shots`}
          </span>
        </div>
      </div>

      {/* Header row */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-gray-12">{title}</h2>
          <p className="mt-0.5 text-sm text-gray-10">{story.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <PageSelect
            ariaLabel="Story version"
            value={version}
            onValueChange={setVersion}
            className="min-w-[9rem]"
            options={story.versions.map((v, i) => ({ value: String(i), label: v }))}
          />
          <AtlabsButton
            variant="primary"
            size="md"
            className="text-xs font-semibold uppercase tracking-wide"
            onClick={onExport}
          >
            <DownloadIcon width={13} height={13} />
            Export
          </AtlabsButton>
        </div>
      </div>

      {/* Shot strip — FilmStrip */}
      <section className="mt-6" aria-label="Shots">
        <SectionLabel>Shot list</SectionLabel>
        <div className="mt-2 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {story.shots.map((shot) => (
            <article
              key={shot.id}
              className="w-44 shrink-0 overflow-hidden rounded-control border border-gray-a6 bg-white shadow-sm"
            >
              <div className="relative">
                {shot.thumbnail_url ? (
                  <img src={shot.thumbnail_url} alt="" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video w-full bg-gray-2" />
                )}
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
                  {shot.duration_seconds}s
                </span>
              </div>
              <p className="px-2.5 py-2 text-xs leading-relaxed text-gray-11">
                <span className="font-bold text-gray-12">#{shot.index}</span> {shot.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Transcript panel */}
      <section className="mt-4 rounded-card border border-gray-a6 bg-white p-4 shadow-sm md:p-5" aria-label="Transcript">
        <SectionLabel>Transcript</SectionLabel>
        <ul className="mt-3 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {story.transcript.map((t) => (
            <li key={t.id} className="flex gap-3 text-sm">
              <span className="w-14 shrink-0 pt-0.5 text-xs tabular-nums text-gray-9">
                {t.start_seconds}s
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-10">{t.speaker}</p>
                <p className="leading-relaxed text-gray-11">“{t.text}”</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Meta footer */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-10">
        <span>Style: {story.style}</span>
        <span>Language: {story.language}</span>
        <span>Voice: {story.voice}</span>
        <span>Pace: {story.scene_pace}</span>
        <span>
          Credits used: <span className="tabular-nums">{story.credits_used}</span>
        </span>
      </div>

      {/* Credits modal when balance is 0 */}
      <Modal
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="Out of credits"
        description="Exporting a finished film costs credits. Upgrade your plan to keep the final cut."
        footer={
          <div className="flex justify-end gap-2">
            <AtlabsButton variant="ghost" size="sm" onClick={() => setExportOpen(false)}>
              Maybe later
            </AtlabsButton>
            <AtlabsButton
              variant="primary"
              size="sm"
              className="font-semibold"
              onClick={() => navigate('/subscribe')}
            >
              <RocketIcon width={13} height={13} />
              Upgrade
            </AtlabsButton>
          </div>
        }
      >
        <div className={cn('rounded-control border border-yellow-4 bg-yellow-1 p-4 text-sm text-gray-11')}>
          Your balance is <span className="font-bold text-gray-12">0 credits</span>. Plans start at
          100 credits/month — enough for several exports like this one
          {story.credits_used > 0 ? ` (~${Math.max(4, Math.round(story.credits_used / 8))} credits per export)` : ''}.
        </div>
      </Modal>
    </div>
  )
}

export default StoryDetail
