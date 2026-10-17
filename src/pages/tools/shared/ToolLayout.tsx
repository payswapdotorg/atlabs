import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from '@radix-ui/react-icons'
import IconBadge from '../../../components/IconBadge'
import { cn } from '../../../lib/utils'
import type { ToolConfig } from './types'

/**
 * Shared two-panel mini tool layout: header (back link + icon + title +
 * tagline) and a responsive config/preview grid. The config panel sits
 * left (~380px) and the preview panel fills the rest.
 */
const ToolLayout: React.FC<{
  config: ToolConfig
  children: React.ReactNode
}> = ({ config, children }) => (
  <div className="mx-auto w-full max-w-6xl">
    <header className="flex flex-col gap-3 pb-1">
      <Link
        to="/tools"
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-10 transition-colors hover:text-gray-12"
      >
        <ChevronLeftIcon width={12} height={12} />
        All tools
      </Link>
      <div className="flex items-start gap-3">
        <IconBadge size="lg" tone="yellow" className="mt-0.5 shrink-0">
          {config.icon}
        </IconBadge>
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-gray-12">
            {config.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-11">{config.tagline}</p>
          {config.description ? (
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-10">
              {config.description}
            </p>
          ) : null}
        </div>
      </div>
    </header>

    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(340px,400px)_1fr]">
      {children}
    </div>
  </div>
)

/** White card wrapper used by both panels. */
export const ToolPanel: React.FC<{
  title: string
  children: React.ReactNode
  className?: string
  footer?: React.ReactNode
}> = ({ title, children, className, footer }) => (
  <section
    className={cn(
      'flex flex-col overflow-hidden rounded-card border border-gray-a6 bg-white shadow-sm',
      className,
    )}
  >
    <h2 className="border-b border-gray-a6 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-10">
      {title}
    </h2>
    <div className="flex-1 p-4">{children}</div>
    {footer ? (
      <div className="border-t border-gray-a6 bg-gray-1 px-4 py-3">{footer}</div>
    ) : null}
  </section>
)

export default ToolLayout
