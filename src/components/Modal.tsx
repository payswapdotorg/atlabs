import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Cross1Icon } from '@radix-ui/react-icons'
import { cn } from '../lib/utils'

interface ModalProps {
  trigger?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  /** show the top-right X button (default true) */
  showClose?: boolean
}

/**
 * Modal dialog built on Radix Dialog. Either pass a `trigger` for
 * uncontrolled usage, or drive it with `open`/`onOpenChange`.
 */
const Modal: React.FC<ModalProps> = ({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  showClose = true,
}) => {
  return (
    <DialogPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger ? (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      ) : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/45" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-card bg-white p-6 shadow-xl',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-4',
            className,
          )}
        >
          {title ? (
            <DialogPrimitive.Title className="text-lg font-semibold text-gray-12">
              {title}
            </DialogPrimitive.Title>
          ) : (
            <DialogPrimitive.Title className="sr-only">
              Dialog
            </DialogPrimitive.Title>
          )}
          {description ? (
            <DialogPrimitive.Description className="mt-1.5 text-sm leading-relaxed text-gray-11">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          {children ? <div className="mt-4 text-sm text-gray-11">{children}</div> : null}
          {footer ? (
            <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>
          ) : null}
          {showClose ? (
            <DialogPrimitive.Close
              aria-label="Close"
              className={cn(
                'absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-control',
                'text-gray-11 transition-colors hover:bg-gray-2 hover:text-gray-12',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
            >
              <Cross1Icon width={14} height={14} />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default Modal
