import React from 'react'
import { cn } from '../lib/utils'

interface SkeletonProps {
  className?: string
}

/** Base rectangular skeleton block. Size it via className (h-4 w-52 etc). */
const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    aria-hidden
    className={cn('animate-pulse rounded-control bg-gray-4', className)}
  />
)

export const SkeletonCircle: React.FC<SkeletonProps> = ({ className }) => (
  <div aria-hidden className={cn('animate-pulse rounded-full bg-gray-4', className)} />
)

interface SkeletonTextProps {
  lines?: number
  className?: string
}

/** Multi-line paragraph skeleton; last line is shortened. */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('space-y-2', className)} aria-hidden>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')}
      />
    ))}
  </div>
)

export default Skeleton
