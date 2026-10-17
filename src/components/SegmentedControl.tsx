import React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../lib/utils'

export interface SegmentedControlItem {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

interface SegmentedControlProps {
  items: SegmentedControlItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
}

/**
 * Segmented control built on Radix Tabs — one active segment at a time.
 */
const SegmentedControl: React.FC<SegmentedControlProps> = ({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
}) => {
  return (
    <TabsPrimitive.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
      className={cn('w-full', className)}
    >
      <TabsPrimitive.List
        aria-label="Segmented control"
        className={cn(
          'inline-flex items-center gap-0.5 rounded-control bg-gray-2 p-0.5',
        )}
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              'inline-flex h-7 items-center justify-center whitespace-nowrap rounded-[4px]',
              'px-3 text-sm font-medium transition-colors',
              'text-gray-11 hover:text-gray-12',
              'data-[state=active]:bg-white data-[state=active]:text-gray-12 data-[state=active]:shadow-sm',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  )
}

export default SegmentedControl
