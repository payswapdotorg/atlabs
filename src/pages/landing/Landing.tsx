import React from 'react'
import { Link } from 'react-router-dom'
import { FileTextIcon, DiscIcon, LightningBoltIcon } from '@radix-ui/react-icons'
import { AtlabsWordmark } from '../auth/icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import IconBadge from '../../components/IconBadge'
import { useDocumentTitle } from '../../lib/useDocumentTitle'

const STYLE_CHIPS = ['Animated Explainer', 'Animated Cartoon', 'Realistic Drama']
const SONG_CHIPS = ["Kids' Edutainment", 'Indie Music', 'Faith & Gospel']

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  chips: string[]
  to: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  chips,
  to,
}) => (
  <Link
    to={to}
    className="group flex flex-col rounded-card border border-gray-a6 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-yellow-4 hover:shadow-md"
  >
    <IconBadge size="lg" tone="yellow">
      {icon}
    </IconBadge>
    <h3 className="mt-6 text-xl font-semibold text-gray-12">{title}</h3>
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
    <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-11">
      Start for free
      <span className="transition-transform group-hover:translate-x-0.5">→</span>
    </span>
  </Link>
)

/**
 * Marketing landing page (public). Route: /
 */
const Landing: React.FC = () => {
  useDocumentTitle(
    'Atlabs - #1 AI Video Generator - Create Engaging Videos instantly',
  )

  return (
    <div className="flex min-h-screen flex-col bg-gray-1">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-gray-a6 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to="/" aria-label="atlabs home">
            <AtlabsWordmark />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-11 md:flex">
            <Link to="/pricing" className="transition-colors hover:text-gray-12">
              Pricing
            </Link>
            <Link to="/mcp" className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-12">
              MCP
              <span className="rounded-full bg-yellow-9 px-1.5 py-0.5 text-[10px] font-bold text-gray-1">
                NEW
              </span>
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-control px-3 text-sm font-medium text-gray-11 transition-colors hover:bg-gray-2 hover:text-gray-12"
            >
              Log in
            </Link>
            <Link to="/signup">
              <AtlabsButton
                variant="primary"
                size="md"
                className="font-semibold"
              >
                Try for Free
              </AtlabsButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 text-center md:px-6 md:pb-20 md:pt-24">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-gray-a6 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-11">
            <LightningBoltIcon width={13} height={13} className="text-yellow-9" />
            #1 AI Video Generator
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-gray-12 md:text-5xl">
            Create engaging videos{' '}
            <span className="text-yellow-11">instantly</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-11">
            Atlabs turns your ideas, scripts and songs into fully produced
            films — shots, voiceover, music and more. No crew, no camera,
            no editing timeline.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <AtlabsButton
                variant="primary"
                size="lg"
                className="font-semibold uppercase tracking-wide"
              >
                Try for Free
              </AtlabsButton>
            </Link>
            <Link to="/login">
              <AtlabsButton variant="secondary" size="lg">
                Log in
              </AtlabsButton>
            </Link>
          </div>
        </section>

        {/* Two start paths */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FeatureCard
              icon={<FileTextIcon width={22} height={22} />}
              title="Start with an Idea/Script"
              description="Paste a script. Get a fully produced film - shots, voiceover and more."
              chips={STYLE_CHIPS}
              to="/signup"
            />
            <FeatureCard
              icon={<DiscIcon width={22} height={22} />}
              title="Start with a Song"
              description="Drop a Song. Watch it become a cinematic music video in minutes."
              chips={SONG_CHIPS}
              to="/signup"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-a6 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-11 md:flex-row md:px-6">
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <span className="font-medium text-gray-12">Atlabs</span>
            <span className="hidden h-4 w-px bg-gray-a6 md:block" />
            <span className="text-xs text-gray-9">
              © {new Date().getFullYear()} Atlabs. All rights reserved.
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <a
              href="#"
              className="transition-colors hover:text-gray-12 hover:underline hover:decoration-gray-a6 hover:underline-offset-2"
            >
              Customer Terms of Service
            </a>
            <a
              href="#"
              className="transition-colors hover:text-gray-12 hover:underline hover:decoration-gray-a6 hover:underline-offset-2"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-gray-12 hover:underline hover:decoration-gray-a6 hover:underline-offset-2"
            >
              Dispute Policy
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default Landing
