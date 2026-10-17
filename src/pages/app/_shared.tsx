import React, { useCallback, useRef, useState } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import {
  CheckIcon,
  ChevronDownIcon,
  UploadIcon,
} from '@radix-ui/react-icons'
import { cn } from '../../lib/utils'
import type { StoryStatus } from '../../lib/api/stories'

/* ------------------------------------------------------------------ */
/* PageSelect — compact Radix Select wrapper for filter/option rows    */
/* ------------------------------------------------------------------ */

export interface PageSelectOption {
  value: string
  label: string
}

interface PageSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: PageSelectOption[]
  placeholder?: string
  ariaLabel: string
  className?: string
}

/**
 * Small styled select used across creation pages (language, scene pace,
 * projects filters). Built on Radix Select so keyboard nav, a11y and
 * portal positioning come for free.
 */
export const PageSelect: React.FC<PageSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  ariaLabel,
  className,
}) => (
  <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
    <SelectPrimitive.Trigger
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-9 min-w-[10rem] items-center justify-between gap-2 rounded-control border border-gray-a6',
        'bg-white px-3 text-sm text-gray-12 transition-colors',
        'hover:bg-gray-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'data-[placeholder]:text-gray-9',
        className,
      )}
    >
      <SelectPrimitive.Value placeholder={placeholder} />
      <SelectPrimitive.Icon>
        <ChevronDownIcon width={14} height={14} className="text-gray-10" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={4}
        className={cn(
          'z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-y-auto',
          'rounded-control border border-gray-a6 bg-white shadow-lg',
        )}
      >
        <SelectPrimitive.Viewport className="p-1">
          {options.map((opt) => (
            <SelectPrimitive.Item
              key={opt.value}
              value={opt.value}
              className={cn(
                'flex cursor-pointer select-none items-center justify-between rounded-[4px] px-2.5 py-1.5 text-sm',
                'text-gray-11 outline-none data-[highlighted]:bg-gray-2 data-[highlighted]:text-gray-12',
                'data-[state=checked]:font-medium data-[state=checked]:text-gray-12',
              )}
            >
              <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator>
                <CheckIcon width={13} height={13} className="text-yellow-11" />
              </SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
)

/* ------------------------------------------------------------------ */
/* DropZone — drag/drop + click file input                            */
/* ------------------------------------------------------------------ */

interface DropZoneProps {
  label: string
  hint?: string
  accept?: string
  multiple?: boolean
  icon?: React.ReactNode
  className?: string
  onFiles?: (files: File[]) => void
}

export const DropZone: React.FC<DropZoneProps> = ({
  label,
  hint,
  accept,
  multiple = false,
  icon,
  className,
  onFiles,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const emit = useCallback(
    (list: FileList | null) => {
      if (list && list.length > 0) onFiles?.(Array.from(list))
    },
    [onFiles],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        emit(e.dataTransfer.files)
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-8 text-center transition-colors',
        dragging
          ? 'border-yellow-9 bg-yellow-2'
          : 'border-gray-a6 bg-gray-1 hover:bg-gray-2',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
    >
      <span className="text-gray-9">{icon ?? <UploadIcon width={22} height={22} />}</span>
      <span className="text-sm font-medium text-gray-12">{label}</span>
      {hint ? <span className="text-xs text-gray-10">{hint}</span> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          emit(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* StatusBadge — story status pill                                    */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<StoryStatus, string> = {
  DRAFT: 'bg-gray-3 text-gray-11',
  GENERATING: 'bg-yellow-2 text-yellow-11 border border-yellow-5',
  COMPLETED: 'bg-gray-12 text-gray-1',
  EDITOR: 'bg-yellow-9 text-gray-1',
}

export const StatusBadge: React.FC<{ status: StoryStatus }> = ({ status }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
      STATUS_STYLES[status],
    )}
  >
    {status}
  </span>
)

/* ------------------------------------------------------------------ */
/* Chip — small selectable pill                                       */
/* ------------------------------------------------------------------ */

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
      selected
        ? 'border-yellow-9 bg-yellow-2 text-yellow-12'
        : 'border-gray-a6 bg-gray-1 text-gray-11 hover:bg-gray-2 hover:text-gray-12',
    )}
  >
    {label}
  </button>
)

/* ------------------------------------------------------------------ */
/* SectionLabel — small uppercase section heading                     */
/* ------------------------------------------------------------------ */

export const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <p className={cn('text-[11px] font-semibold uppercase tracking-wider text-gray-10', className)}>
    {children}
  </p>
)

/* ------------------------------------------------------------------ */
/* WizardStepper — 3-step creation progress header                    */
/* ------------------------------------------------------------------ */

export interface WizardStep {
  key: string
  label: string
}

interface WizardStepperProps {
  steps: WizardStep[]
  current: number
  onStepSelect?: (index: number) => void
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  steps,
  current,
  onStepSelect,
}) => (
  <ol className="flex flex-wrap items-center gap-2" aria-label="Wizard progress">
    {steps.map((step, i) => {
      const state = i < current ? 'done' : i === current ? 'active' : 'todo'
      const clickable = Boolean(onStepSelect) && i < current
      return (
        <li key={step.key} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden className="h-px w-6 bg-gray-a6 md:w-10" /> : null}
          <button
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onStepSelect?.(i)}
            className={cn(
              'flex items-center gap-2 rounded-full px-1 py-0.5 text-xs font-medium transition-colors',
              clickable ? 'cursor-pointer hover:bg-gray-2' : 'cursor-default',
            )}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                state === 'done' && 'bg-yellow-9 text-gray-1',
                state === 'active' && 'bg-gray-12 text-gray-1',
                state === 'todo' && 'bg-gray-3 text-gray-10',
              )}
            >
              {state === 'done' ? <CheckIcon width={11} height={11} /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden sm:inline',
                state === 'active' ? 'text-gray-12' : 'text-gray-10',
                state === 'done' && 'text-gray-11',
              )}
            >
              {step.label}
            </span>
          </button>
        </li>
      )
    })}
  </ol>
)

/* ------------------------------------------------------------------ */
/* Field — labeled form row helper                                    */
/* ------------------------------------------------------------------ */

export const Field: React.FC<{
  label: string
  htmlFor?: string
  children: React.ReactNode
  hint?: string
}> = ({ label, htmlFor, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-xs font-semibold text-gray-11">
      {label}
    </label>
    {children}
    {hint ? <p className="text-xs text-gray-9">{hint}</p> : null}
  </div>
)

export const textInputClass =
  'h-9 w-full rounded-control border border-gray-a6 bg-white px-3 text-sm text-gray-12 placeholder:text-gray-9 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
