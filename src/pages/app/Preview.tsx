import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import EmptyState from '../../components/EmptyState'
import Skeleton from '../../components/Skeleton'
import { getStory } from '../../lib/api/stories'
import type { StoryDetail } from '../../lib/api/stories'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { SectionLabel, StatusBadge } from './_shared'

const fmt = (s: number): string => `${Math.floor(s / 60)}m ${s % 60}s`

/**
 * Preview — read-only story view (?storyId=123). No editing affordances;
 * used for share links and quick reviews inside the app.
 */
const Preview: React.FC = () => {
  useDocumentTitle('Preview | Atlabs AI')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const storyId = Number(searchParams.get('storyId'))
  const [story, setStory] = useState<StoryDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (!Number.isFinite(storyId) || storyId <= 0) {
      setLoading(false)
      return
    }
    getStory(storyId).then((result) => {
      if (cancelled) return
      setStory(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [storyId])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl" aria-busy="true">
        <Skeleton className="aspect-video w-full rounded-card" />
        <Skeleton className="mt-4 h-5 w-56" />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<EyeOpenIcon width={22} height={22} />}
          title="Nothing to preview"
          description="Open a preview from a story's share menu, or pick a story in My Stories."
          action={
            <AtlabsButton variant="primary" size="md" onClick={() => navigate('/projects')}>
              Go to My Stories
            </AtlabsButton>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-card border border-gray-a6 bg-gray-12 shadow-sm">
        {story.thumbnail_url ? (
          <img src={story.thumbnail_url} alt="" className="aspect-video w-full object-cover opacity-80" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center">
            <p className="text-sm text-gray-10">Preview will appear after rendering</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-gray-12">{story.title}</h2>
          <p className="mt-0.5 text-sm text-gray-10">{story.description}</p>
        </div>
        <StatusBadge status={story.status} />
      </div>

      <div className="mt-4 rounded-card border border-gray-a6 bg-white p-4 shadow-sm">
        <SectionLabel>Transcript</SectionLabel>
        <ul className="mt-2 flex max-h-56 flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {story.transcript.map((t) => (
            <li key={t.id} className="text-sm leading-relaxed text-gray-11">
              <span className="mr-2 text-xs tabular-nums text-gray-9">{t.start_seconds}s</span>
              <span className="text-xs font-bold uppercase tracking-wide text-gray-10">{t.speaker}</span>{' '}
              “{t.text}”
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-xs text-gray-10">
        Read-only preview · {fmt(story.duration_seconds)} · {story.shots.length} shots · {story.style}
      </p>
    </div>
  )
}

export default Preview
