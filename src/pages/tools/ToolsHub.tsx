import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import IconBadge from '../../components/IconBadge'
import { AtlabsButton } from '../../components/AtlabsButton'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { TOOL_GROUPS } from './shared/catalog'
import { textInputClass } from '../app/_shared'

/**
 * /tools — the tools hub. The live product currently links tools
 * through /welcome, but the hub is the intended surface; this clone
 * restores it. Grouped grid with icon, name, one-liner and OPEN.
 */
const ToolsHub: React.FC = () => {
  useDocumentTitle('Tools | Atlabs AI')
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return TOOL_GROUPS
    return TOOL_GROUPS.map((g) => ({
      ...g,
      tools: g.tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      ),
    })).filter((g) => g.tools.length > 0)
  }, [query])

  const totalCount = TOOL_GROUPS.reduce((n, g) => n + g.tools.length, 0)

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-gray-11">
              {totalCount} production tools for video, audio, image and brand work —
              every generation is fixture-backed while the backend is offline.
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon
              width={14}
              height={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-9"
            />
            <input
              type="search"
              aria-label="Search tools"
              placeholder="Search tools…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${textInputClass} pl-8`}
            />
          </div>
        </div>
      </header>

      {groups.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-gray-a6 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-12">No tools match “{query}”</p>
          <p className="mt-1 text-sm text-gray-11">Try a different keyword.</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="mt-8">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-10">
              {group.label}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <article
                  key={tool.slug}
                  className="flex flex-col rounded-card border border-gray-a6 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <IconBadge tone="yellow" className="shrink-0">
                      {tool.icon}
                    </IconBadge>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-12">{tool.name}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-10">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link to={tool.to} className="inline-flex">
                      <AtlabsButton variant="secondary" size="sm">
                        Open
                      </AtlabsButton>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

export default ToolsHub
