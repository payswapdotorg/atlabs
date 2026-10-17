import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import ActorsTab from './ActorsTab'
import AssetsTab from './AssetsTab'
import StylesTab from './StylesTab'
import LocationsTab from './LocationsTab'

/**
 * /library — the asset Library. Tab bar order matches the live product
 * capture: ASSETS | ACTORS | STYLES | LOCATIONS, with ACTORS active by
 * default (served from /library/actors). Non-actor tabs keep the tab in
 * the URL query (?tab=styles) so reloads and deep links behave.
 */
const TABS = [
  { value: 'assets', label: 'Assets' },
  { value: 'actors', label: 'Actors' },
  { value: 'styles', label: 'Styles' },
  { value: 'locations', label: 'Locations' },
]

const Library: React.FC = () => {
  useDocumentTitle('Library | Atlabs AI')
  const location = useLocation()
  const navigate = useNavigate()

  const queryTab = new URLSearchParams(location.search).get('tab')
  const tab =
    location.pathname === '/library/actors'
      ? 'actors'
      : TABS.some((t) => t.value === queryTab)
        ? (queryTab as string)
        : 'actors'

  const onTabChange = (value: string) => {
    navigate(value === 'actors' ? '/library/actors' : `/library?tab=${value}`)
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <TabsPrimitive.Root value={tab} onValueChange={onTabChange}>
        <TabsPrimitive.List
          aria-label="Library sections"
          className="flex flex-wrap items-center gap-1 border-b border-gray-a6"
        >
          {TABS.map((t) => (
            <TabsPrimitive.Trigger
              key={t.value}
              value={t.value}
              className={cn(
                '-mb-px border-b-2 border-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-wide',
                'text-gray-10 transition-colors hover:text-gray-12',
                'data-[state=active]:border-yellow-9 data-[state=active]:text-gray-12',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
            >
              {t.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        <TabsPrimitive.Content value="assets" className="focus:outline-none">
          <AssetsTab />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="actors" className="focus:outline-none">
          <ActorsTab />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="styles" className="focus:outline-none">
          <StylesTab />
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="locations" className="focus:outline-none">
          <LocationsTab />
        </TabsPrimitive.Content>
      </TabsPrimitive.Root>
    </div>
  )
}

export default Library
