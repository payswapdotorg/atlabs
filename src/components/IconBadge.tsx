import React from 'react'
import { cn } from '../lib/utils'

interface IconBadgeProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  tone?: 'yellow' | 'gray'
  className?: string
}

const sizeStyles: Record<NonNullable<IconBadgeProps['size']>, string> = {
  sm: 'w-7 h-7 rounded-[6px]',
  md: 'w-9 h-9 rounded-card',
  lg: 'w-12 h-12 rounded-card',
}

const toneStyles: Record<NonNullable<IconBadgeProps['tone']>, string> = {
  yellow: 'bg-yellow-2 text-yellow-11 border border-yellow-4',
  gray: 'bg-gray-2 text-gray-11 border border-gray-a4',
}

/**
 * Square icon container used across empty states, page headers and cards.
 */
const IconBadge: React.FC<IconBadgeProps> = ({
  children,
  size = 'md',
  tone = 'gray',
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center shrink-0',
        sizeStyles[size],
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </div>
  )
}

export default IconBadge
