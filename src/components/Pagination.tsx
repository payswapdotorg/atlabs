import React from 'react'
import { cn } from '../lib/utils'

interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  siblingCount?: number
  className?: string
}

const range = (start: number, end: number): number[] => {
  const length = Math.max(end - start + 1, 0)
  return Array.from({ length }, (_, i) => start + i)
}

const buildPages = (
  page: number,
  totalPages: number,
  siblingCount: number,
): (number | 'ellipsis-l' | 'ellipsis-r')[] => {
  if (totalPages <= 5 + siblingCount * 2) {
    return range(1, totalPages)
  }
  const leftSibling = Math.max(page - siblingCount, 1)
  const rightSibling = Math.min(page + siblingCount, totalPages)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, 3 + siblingCount * 2), 'ellipsis-r', totalPages]
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'ellipsis-l', ...range(totalPages - (2 + siblingCount * 2), totalPages)]
  }
  return [
    1,
    'ellipsis-l',
    ...range(leftSibling, rightSibling),
    'ellipsis-r',
    totalPages,
  ]
}

const pageButtonClass = (active: boolean): string =>
  cn(
    'inline-flex h-8 min-w-[2rem] items-center justify-center px-2 rounded-control text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    active
      ? 'bg-gray-12 text-gray-1'
      : 'text-gray-11 hover:bg-gray-3 hover:text-gray-12',
  )

/**
 * Numbered pagination for DRF-style list endpoints (count/next/previous/results).
 */
const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1)
  if (totalCount === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)
  const items = buildPages(page, totalPages, siblingCount)

  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 pt-4',
        className,
      )}
      aria-label="Pagination"
    >
      <p className="text-xs text-gray-11">
        Showing <span className="font-medium text-gray-12">{from}</span>–
        <span className="font-medium text-gray-12">{to}</span> of{' '}
        <span className="font-medium text-gray-12">{totalCount}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={pageButtonClass(false)}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        {items.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={pageButtonClass(item === page)}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="px-1.5 text-sm text-gray-9">
              …
            </span>
          ),
        )}
        <button
          type="button"
          className={pageButtonClass(false)}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </nav>
  )
}

export default Pagination
