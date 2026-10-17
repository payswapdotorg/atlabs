import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DiscIcon,
  FileTextIcon,
  LightningBoltIcon,
  PaperPlaneIcon,
  PersonIcon,
  PlusIcon,
  SymbolIcon,
} from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import IconBadge from '../../components/IconBadge'
import Skeleton from '../../components/Skeleton'
import { getUserDetails } from '../../lib/api'
import { getStories } from '../../lib/api/stories'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { DropZone, SectionLabel } from './_shared'

const STYLE_CHIPS = ['Animated Explainer', 'Animated Cartoon', 'Realistic Drama']
const SONG_CHIPS = ["Kids' Edutainment", 'Indie Music', 'Faith & Gospel']

/* ------------------------------------------------------------------ */
/* Start card — big creation entry (Most Popular / Trending)          */
/* ------------------------------------------------------------------ */

interface StartCardProps {
  badge: string
  badgeTone: 'yellow' | 'dark'
  icon: React.ReactNode
  title: string
  description: string
  chips: string[]
  onStart: () => void
}

const StartCard: React.FC<StartCardProps> = ({
  badge,
  badgeTone,
  icon,
  title,
  description,
  chips,
  onStart,
}) => (
  <div className="flex flex-col rounded-card border border-gray-a6 bg-white p-6 shadow-sm md:p-8">
    <div className="flex items-center justify-between">
      <IconBadge size="lg" tone="yellow">
        {icon}
      </IconBadge>
      <span
        className={
          badgeTone === 'yellow'
            ? 'rounded-full bg-yellow-9 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-1'
            : 'rounded-full bg-gray-12 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-1'
        }
      >
        {badge}
      </span>
    </div>
    <h2 className="mt-5 text-lg font-semibold text-gray-12 md:text-xl">{title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-gray-11">{description}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center rounded-full border border-gray-a6 bg-gray-1 px-3 py-1 text-xs font-medium text-gray-11"
        >
          {chip}
        </span>
      ))}
    </div>
    <div className="mt-6 flex-1" />
    <AtlabsButton
      variant="primary"
      size="lg"
      className="w-full font-semibold uppercase tracking-wide"
      onClick={onStart}
    >
      Start Free
    </AtlabsButton>
  </div>
)

/**
 * AppHome — authenticated landing ("START CREATING"). Redirects to
 * /welcome only when the account has zero credits AND zero stories,
 * mirroring the live first-run behavior.
 */
const AppHome: React.FC = () => {
  useDocumentTitle('Home | Atlabs AI')
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  // First-run gate: 0 credits + 0 stories → the live app lands on /welcome.
  useEffect(() => {
    let cancelled = false
    Promise.all([getUserDetails(), getStories(1, 1)])
      .then(([details, stories]) => {
        if (cancelled) return
        if (
          (details.credit_summary?.balance ?? 0) === 0 &&
          stories.count === 0
        ) {
          navigate('/welcome', { replace: true })
          return
        }
        setChecking(false)
      })
      .catch(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  if (checking) {
    return (
      <div className="mx-auto max-w-5xl" aria-busy="true" aria-label="Loading home">
        <Skeleton className="h-5 w-44" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Skeleton className="h-72 rounded-card" />
          <Skeleton className="h-72 rounded-card" />
        </div>
        <Skeleton className="mt-6 h-28 rounded-card" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <SectionLabel className="text-gray-11">Start Creating</SectionLabel>
      <p className="mt-1 hidden text-sm text-gray-10 sm:block">
        Pick a starting point — script, song or a blank canvas.
      </p>

      {/* Two big start cards */}
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <StartCard
          badge="Most Popular"
          badgeTone="yellow"
          icon={<FileTextIcon width={22} height={22} />}
          title="Start with an Idea/Script"
          description="Paste a script. Get a fully produced film - shots, voiceover and more."
          chips={STYLE_CHIPS}
          onStart={() => navigate('/new-story')}
        />
        <StartCard
          badge="Trending"
          badgeTone="dark"
          icon={<DiscIcon width={22} height={22} />}
          title="Start with a Song"
          description="Drop a Song. Watch it become a cinematic music video in minutes."
          chips={SONG_CHIPS}
          onStart={() => navigate('/new-audio')}
        />
      </div>

      {/* Reference drop zone */}
      <section className="mt-6 rounded-card border border-gray-a6 bg-white p-4 shadow-sm md:p-6" aria-label="Reference uploads">
        <DropZone
          className="py-7"
          multiple
          label="Add characters, locations, objects or other files/references"
          hint="PNG, JPG or PDF — dropped files attach to your next story"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <AtlabsButton
            variant="secondary"
            size="sm"
            className="text-xs font-semibold uppercase tracking-wide"
            onClick={() => navigate('/library/actors')}
          >
            <PersonIcon width={13} height={13} />
            Character
          </AtlabsButton>
          <AtlabsButton
            variant="secondary"
            size="sm"
            className="text-xs font-semibold uppercase tracking-wide"
            onClick={() => navigate('/library')}
          >
            <SymbolIcon width={13} height={13} />
            Reference
          </AtlabsButton>
        </div>
      </section>

      {/* Upsell strip + blank story */}
      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 rounded-card border border-yellow-4 bg-yellow-1 p-4 md:flex-row md:items-center md:p-5">
        <div className="flex items-center gap-3">
          <IconBadge tone="yellow">
            <LightningBoltIcon width={16} height={16} />
          </IconBadge>
          <div>
            <p className="text-sm font-semibold text-gray-12">
              Try for free
            </p>
            <p className="text-xs text-gray-11">
              Generate your first film on us — no credit card needed.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <AtlabsButton
            variant="primary"
            size="md"
            className="text-xs font-semibold uppercase tracking-wide"
            onClick={() => navigate('/new-story')}
          >
            <PaperPlaneIcon width={13} height={13} />
            Try for Free
          </AtlabsButton>
          <AtlabsButton
            variant="ghost"
            size="md"
            className="border border-gray-a6 text-xs font-semibold uppercase tracking-wide"
            onClick={() => navigate('/new-story?blank=1')}
          >
            <PlusIcon width={13} height={13} />
            Create a Blank Story
          </AtlabsButton>
        </div>
      </div>
    </div>
  )
}

export default AppHome
