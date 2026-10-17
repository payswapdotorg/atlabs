import React, { useMemo, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { PersonIcon } from '@radix-ui/react-icons'

export interface MentionItem {
  id: string
  label: string
}

interface TextFieldWithMentionsProps {
  value: string
  onChange: (value: string) => void
  mentions?: MentionItem[]
  placeholder?: string
  rows?: number
  className?: string
  disabled?: boolean
}

/**
 * Textarea with a simple @mention popup: typing "@" opens a filtered
 * suggestion list; ArrowUp/ArrowDown navigate, Enter/Tab select,
 * Escape dismisses. The selected item is inserted as "@Label ".
 */
const TextFieldWithMentions: React.FC<TextFieldWithMentionsProps> = ({
  value,
  onChange,
  mentions = [],
  placeholder,
  rows = 4,
  className,
  disabled,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState(0)

  const filtered = useMemo(() => {
    if (mentionQuery === null) return []
    const q = mentionQuery.toLowerCase()
    return mentions.filter((m) => m.label.toLowerCase().includes(q))
  }, [mentionQuery, mentions])

  const popupOpen = mentionQuery !== null && filtered.length > 0

  const detectMention = (text: string, caret: number): string | null => {
    const upto = text.slice(0, caret)
    const match = upto.match(/@([a-zA-Z0-9_]*)$/)
    return match ? match[1] : null
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    onChange(next)
    setMentionQuery(detectMention(next, e.target.selectionStart ?? next.length))
    setHighlighted(0)
  }

  const selectMention = (item: MentionItem) => {
    const el = textareaRef.current
    if (!el) return
    const caret = el.selectionStart ?? value.length
    const before = value.slice(0, caret)
    const after = value.slice(caret)
    const at = before.lastIndexOf('@')
    if (at === -1) return
    const inserted = `@${item.label} `
    const next = before.slice(0, at) + inserted + after
    onChange(next)
    setMentionQuery(null)
    const pos = at + inserted.length
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(pos, pos)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!popupOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => (h + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => (h - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      selectMention(filtered[highlighted])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setMentionQuery(null)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // slight delay so click handlers can fire first
          window.setTimeout(() => setMentionQuery(null), 120)
        }}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full rounded-card border border-gray-a6 bg-white px-3.5 py-2.5',
          'text-sm leading-relaxed text-gray-12 placeholder:text-gray-9',
          'focus:outline-none focus:ring-2 focus:ring-yellow-4 focus:border-yellow-6',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        )}
      />
      {popupOpen ? (
        <div
          role="listbox"
          className="absolute z-40 left-0 mt-1 w-56 max-h-44 overflow-y-auto"
        >
          <div className="rounded-card border border-gray-a4 bg-white shadow-lg p-1">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-9">
              Mention
            </p>
            {filtered.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={i === highlighted}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectMention(m)}
                onMouseEnter={() => setHighlighted(i)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-sm',
                  i === highlighted
                    ? 'bg-gray-2 text-gray-12'
                    : 'text-gray-11',
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-3 text-gray-11">
                  <PersonIcon width={11} height={11} />
                </span>
                <span className="truncate">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default TextFieldWithMentions
