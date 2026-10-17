import React, { useState } from 'react'
import { cn } from '../../lib/utils'

/* ------------------------------------------------------------------ */
/* FixtureImage — external fixture image with offline fallback        */
/* ------------------------------------------------------------------ */

const hashSeed = (seed: string): number => {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) % 100000
  }
  return h
}

/**
 * Deterministic gradient SVG used when an external fixture image
 * (dicebear / picsum) fails to load — keeps grids meaningful offline.
 */
const fallbackThumb = (seed: string): string => {
  const h = hashSeed(seed)
  const hue = h % 360
  const hue2 = (hue + 40) % 360
  const initials = seed
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,78%)"/><stop offset="1" stop-color="hsl(${hue2},45%,45%)"/></linearGradient></defs><rect width="480" height="320" fill="url(#g)"/><text x="240" y="168" text-anchor="middle" font-family="system-ui,sans-serif" font-size="56" font-weight="700" fill="rgba(255,255,255,0.85)">${initials}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

interface FixtureImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  /** Stable fallback key (character name, style slug…) if `src` fails. */
  seed: string
}

/** Fixture <img> that degrades to a deterministic SVG on load error. */
export const FixtureImage: React.FC<FixtureImageProps> = ({
  src,
  seed,
  alt,
  className,
  ...rest
}) => {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={failed ? fallbackThumb(seed) : src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}

/* ------------------------------------------------------------------ */
/* SourceBadge — SYSTEM / USER origin pill                            */
/* ------------------------------------------------------------------ */

export const SourceBadge: React.FC<{ source: string; className?: string }> = ({
  source,
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
      source === 'USER'
        ? 'bg-yellow-2 text-yellow-11 border border-yellow-5'
        : 'bg-gray-3 text-gray-10',
      className,
    )}
  >
    {source === 'USER' ? 'User' : 'System'}
  </span>
)

/* ------------------------------------------------------------------ */
/* formatDate — "12 Mar" style short date                              */
/* ------------------------------------------------------------------ */

export const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

/* ------------------------------------------------------------------ */
/* durationLabel — ms → "0:06"                                        */
/* ------------------------------------------------------------------ */

export const durationLabel = (ms: number): string => {
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
