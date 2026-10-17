import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../lib/utils'

interface AtlabsTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
}

/**
 * Thin wrapper around Radix Tooltip styled with the gray radix scale.
 * Wrap disabled controls in a span so pointer events still reach Radix.
 */
const AtlabsTooltip: React.FC<AtlabsTooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className,
}) => {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            className={cn(
              'z-50 px-2.5 py-1.5 rounded-control text-xs font-medium',
              'bg-gray-12 text-gray-1 shadow-md select-none',
              'max-w-[220px] leading-relaxed text-center',
              className,
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-12" width={10} height={5} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export default AtlabsTooltip
