import React from 'react'
import { cn } from '../lib/utils'
import IconBadge from './IconBadge'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Centered empty state: icon + title + description + optional action.
 * Used for empty story lists, empty library, filter dead-ends, etc.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      {icon ? (
        <IconBadge size="lg" tone="yellow" className="mb-5">
          {icon}
        </IconBadge>
      ) : null}
      <h3 className="text-lg font-semibold text-gray-12">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-11">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export default EmptyState
