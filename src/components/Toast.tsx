import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { Cross1Icon, CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { cn } from '../lib/utils'

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error'
  duration?: number
}

interface ToastEntry extends ToastOptions {
  id: number
  open: boolean
}

interface ToastContextType {
  toast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

/** `const { toast } = useToast()` — requires <ToastProvider> above the router. */
export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

const variantStyles: Record<NonNullable<ToastOptions['variant']>, string> = {
  default: 'bg-gray-12 text-gray-1',
  success: 'bg-gray-12 text-gray-1',
  error: 'bg-gray-12 text-gray-1',
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((options: ToastOptions) => {
    const id = ++idRef.current
    setToasts((prev) => [
      ...prev.slice(-4),
      { id, open: true, duration: 4000, variant: 'default', ...options },
    ])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            open={t.open}
            duration={t.duration}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id)
            }}
            className={cn(
              'pointer-events-auto flex w-80 items-start gap-3 rounded-card p-4 shadow-lg',
              variantStyles[t.variant ?? 'default'],
            )}
          >
            <span className="mt-0.5 shrink-0">
              {t.variant === 'success' ? (
                <CheckCircledIcon width={16} height={16} className="text-yellow-9" />
              ) : t.variant === 'error' ? (
                <CrossCircledIcon width={16} height={16} className="text-red-400" />
              ) : null}
            </span>
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm font-semibold">
                {t.title}
              </ToastPrimitive.Title>
              {t.description ? (
                <ToastPrimitive.Description className="mt-0.5 text-xs leading-relaxed opacity-80">
                  {t.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close
              aria-label="Dismiss"
              className="shrink-0 rounded-control p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none"
            >
              <Cross1Icon width={12} height={12} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export default ToastProvider
