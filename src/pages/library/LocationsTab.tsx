import React, { useEffect, useState } from 'react'
import Skeleton from '../../components/Skeleton'
import { getLocations } from '../../lib/api/library'
import type { LibraryLocation } from '../../lib/api/library'
import { FixtureImage } from './_shared'

/* ------------------------------------------------------------------ */
/* LocationCard                                                       */
/* ------------------------------------------------------------------ */

const LocationCard: React.FC<{ location: LibraryLocation }> = ({ location }) => (
  <article className="group overflow-hidden rounded-card border border-gray-a6 bg-white shadow-sm transition-shadow hover:shadow-md">
    <div className="aspect-[16/10] w-full overflow-hidden bg-gray-2">
      <FixtureImage
        src={location.image_url}
        seed={location.slug}
        alt={location.name}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      />
    </div>
    <div className="p-3">
      <h3 className="truncate text-sm font-semibold text-gray-12">{location.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-10">
        {location.description}
      </p>
    </div>
  </article>
)

/* ------------------------------------------------------------------ */
/* LocationsTab                                                       */
/* ------------------------------------------------------------------ */

const LocationsTab: React.FC = () => {
  const [locations, setLocations] = useState<LibraryLocation[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getLocations().then((rows) => {
      if (!cancelled) setLocations(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!locations) {
    return (
      <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-gray-a6 bg-white">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((loc) => (
        <LocationCard key={loc.id} location={loc} />
      ))}
    </div>
  )
}

export default LocationsTab
