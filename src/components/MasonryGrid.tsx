import React from 'react'
import { cn } from '../lib/utils'

interface MasonryGridProps {
  children: React.ReactNode
  /** Base column count (mobile-first) */
  columns?: number
  /** Responsive overrides — must use literal Tailwind classes for JIT */
  sm?: number
  md?: number
  lg?: number
  /** Column gap in px */
  gap?: number
  className?: string
  itemClassName?: string
}

// Literal class maps (full names written out so Tailwind JIT picks them up)
const baseCols: Record<number, string> = {
  1: 'columns-1',
  2: 'columns-2',
  3: 'columns-3',
  4: 'columns-4',
  5: 'columns-5',
  6: 'columns-6',
}
const smCols: Record<number, string> = {
  1: 'sm:columns-1',
  2: 'sm:columns-2',
  3: 'sm:columns-3',
  4: 'sm:columns-4',
  5: 'sm:columns-5',
  6: 'sm:columns-6',
}
const mdCols: Record<number, string> = {
  1: 'md:columns-1',
  2: 'md:columns-2',
  3: 'md:columns-3',
  4: 'md:columns-4',
  5: 'md:columns-5',
  6: 'md:columns-6',
}
const lgCols: Record<number, string> = {
  1: 'lg:columns-1',
  2: 'lg:columns-2',
  3: 'lg:columns-3',
  4: 'lg:columns-4',
  5: 'lg:columns-5',
  6: 'lg:columns-6',
}

/**
 * Masonry layout via CSS columns. Each child is wrapped in a
 * break-inside-avoid block so cards never split across columns.
 */
const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = 1,
  sm,
  md,
  lg,
  gap = 16,
  className,
  itemClassName,
}) => {
  return (
    <div
      className={cn(
        'w-full',
        baseCols[columns] ?? baseCols[1],
        sm && smCols[sm],
        md && mdCols[md],
        lg && lgCols[lg],
        className,
      )}
      style={{ columnGap: `${gap}px` }}
    >
      {React.Children.map(children, (child, i) =>
        child == null ? null : (
          <div
            key={i}
            className={cn('break-inside-avoid', itemClassName)}
            style={{ marginBottom: `${gap}px` }}
          >
            {child}
          </div>
        ),
      )}
    </div>
  )
}

export default MasonryGrid
