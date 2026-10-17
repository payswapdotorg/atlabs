import React from 'react'
import { PlayIcon } from '@radix-ui/react-icons'

/** Google "G" logo (brand colors). */
export const GoogleLogoIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 18,
  height = 18,
}) => (
  <svg width={width} height={height} viewBox="0 0 48 48" aria-hidden focusable="false">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
)

/** Apple logo (single glyph, inherits currentColor). */
export const AppleLogoIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 18,
  height = 18,
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" aria-hidden focusable="false">
    <path
      fill="currentColor"
      d="M17.05 20.28c-.98.95-2.05.86-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.79-.16 1.98-.81 3.42-.74 1.17.06 2.05.56 2.65 1.49-2.42 1.45-2.03 4.64.42 5.53-.53 1.4-1.22 2.79-2.57 4.41l.02.02zM12.03 7.25c-.15-2.23 1.66-4.25 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
    />
  </svg>
)

/** Small brand wordmark (glyph + lowercase text). */
export const AtlabsWordmark: React.FC<{
  className?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ className, size = 'md' }) => {
  const box =
    size === 'lg' ? 'h-9 w-9' : size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const glyph = size === 'lg' ? 15 : size === 'sm' ? 10 : 13
  const text =
    size === 'lg'
      ? 'text-2xl'
      : size === 'sm'
        ? 'text-base'
        : 'text-xl'
  return (
    <span className={('inline-flex items-center gap-2 ' + (className ?? '')).trim()}>
      <span
        className={`flex ${box} items-center justify-center rounded-[6px] bg-yellow-9 shadow-sm`}
      >
        <PlayIcon width={glyph} height={glyph} className="text-gray-1" />
      </span>
      <span className={`${text} font-bold lowercase tracking-tight text-gray-12`}>
        atlabs
      </span>
    </span>
  )
}
