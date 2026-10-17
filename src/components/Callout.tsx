import React from 'react'
import { cn } from '../lib/utils'
import {
  InfoCircledIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons'

type CalloutVariant = 'info' | 'warning' | 'success' | 'error'

interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<CalloutVariant, string> = {
  info: 'bg-gray-2 border-gray-a6 text-gray-11',
  warning: 'bg-yellow-1 border-yellow-4 text-yellow-12',
  success: 'bg-gray-1 border-gray-a6 text-gray-11',
  error: 'bg-gray-1 border-red-200 text-red-700',
}

const iconMap: Record<CalloutVariant, React.ReactNode> = {
  info: <InfoCircledIcon />,
  warning: <ExclamationTriangleIcon />,
  success: <CheckCircledIcon />,
  error: <CrossCircledIcon />,
}

const iconTone: Record<CalloutVariant, string> = {
  info: 'text-gray-11',
  warning: 'text-yellow-11',
  success: 'text-gray-12',
  error: 'text-red-600',
}

/**
 * Inline banner for contextual hints, warnings and confirmations.
 */
const Callout: React.FC<CalloutProps> = ({
  variant = 'info',
  title,
  children,
  className,
}) => {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-card border px-4 py-3 text-sm leading-relaxed',
        variantStyles[variant],
        className,
      )}
    >
      <span className={cn('mt-0.5 shrink-0 w-4 h-4', iconTone[variant])}>
        {iconMap[variant]}
      </span>
      <div className="min-w-0">
        {title ? (
          <p className="font-semibold text-gray-12">{title}</p>
        ) : null}
        <div className={cn(title && 'mt-0.5')}>{children}</div>
      </div>
    </div>
  )
}

export default Callout
