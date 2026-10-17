import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileTextIcon, DiscIcon, LightningBoltIcon } from '@radix-ui/react-icons'
import { AtlabsWordmark } from '../auth/icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import IconBadge from '../../components/IconBadge'
import { useDocumentTitle } from '../../lib/useDocumentTitle'

const STYLE_CHIPS = ['Animated Explainer', 'Animated Cartoon', 'Realistic Drama']
const SONG_CHIPS = ["Kids' Edutainment", 'Indie Music', 'Faith & Gospel']

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
  <div className="flex flex-col rounded-card border border-gray-a6 bg-white p-8 shadow-sm">
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
    <h2 className="mt-6 text-xl font-semibold text-gray-12">{title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-gray-11">{description}</p>
    <div className="mt-5 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center rounded-full border border-gray-a6 bg-gray-1 px-3 py-1 text-xs font-medium text-gray-11"
        >
          {chip}
        </span>
      ))}
    </div>
    <div className="mt-8 pt-2">
      <AtlabsButton
        variant="primary"
        size="lg"
        className="w-full font-semibold uppercase tracking-wide"
        onClick={onStart}
      >
        Start Free
      </AtlabsButton>
    </div>
  </div>
)

/**
 * Welcome — first-run chooser shown after login. Two start paths:
 * Idea/Script (→ /new-story) and Song (→ /new-audio).
 */
const Welcome: React.FC = () => {
  useDocumentTitle('Get Started | Atlabs AI')
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-gray-1">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-gray-a6 bg-white px-4 md:px-8">
        <AtlabsWordmark />
        <div className="flex items-center gap-2 md:gap-3">
          <AtlabsButton
            variant="primary"
            size="md"
            className="font-semibold"
            onClick={() => navigate('/new-story')}
          >
            <LightningBoltIcon width={14} height={14} />
            Try for Free
          </AtlabsButton>
          <AtlabsButton
            variant="ghost"
            size="md"
            className="text-xs font-semibold uppercase tracking-wide"
            onClick={() => navigate('/tools')}
          >
            Skip - Browse All Tools
          </AtlabsButton>
        </div>
      </header>

      {/* Chooser */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-12">
              How do you want to start?
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-11">
              Pick a starting point below — you can always switch between
              formats, tools and styles later.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
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
        </div>
      </main>
    </div>
  )
}

export default Welcome
