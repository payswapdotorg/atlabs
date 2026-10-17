import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CheckCircledIcon,
  CrossCircledIcon,
  FileTextIcon,
  MixIcon,
  SpeakerLoudIcon,
  UpdateIcon,
  VideoIcon,
} from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import { useToast } from '../../components/Toast'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { cn } from '../../lib/utils'
import { SectionLabel } from './_shared'

const STAGES = [
  { label: 'Analyzing script', icon: FileTextIcon, ms: 2100 },
  { label: 'Generating shots', icon: VideoIcon, ms: 2600 },
  { label: 'Rendering scenes', icon: UpdateIcon, ms: 2600 },
  { label: 'Adding voiceover', icon: SpeakerLoudIcon, ms: 2100 },
  { label: 'Final assembly', icon: MixIcon, ms: 1600 },
]

interface LiveEntry {
  stageIndex: number
  text: string
  state: 'active' | 'done'
}

const STAGE_LOGS: string[][] = [
  ['Parsed 4 scenes from the script', 'Mapped dialogue to speakers', 'Locked style and pace'],
  ['Shot 1 — establishing wide', 'Shot 2 — interior close-up', 'Shot 3 — storm exterior', 'Shot 4 — letter insert'],
  ['Scene 1 rendered', 'Scene 2 rendered', 'Scene 3 rendered', 'Scene 4 rendered'],
  ['Synthesized voiceover (Marcus — warm baritone)', 'Aligned subtitles to dialogue'],
  ['Stitched timeline', 'Applied color grade', 'Final cut ready'],
]

/**
 * Generating — progress theater shown after GENERATE is pressed.
 * Walks the five production stages, streams a live status list and
 * routes to the finished story detail when complete.
 */
const Generating: React.FC = () => {
  useDocumentTitle('Generating | Atlabs AI')
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const storyId =
    (location.state as { storyId?: number } | null)?.storyId ??
    (Number(new URLSearchParams(window.location.search).get('storyId')) || null)

  const [stage, setStage] = useState(0)
  const [done, setDone] = useState(false)
  const [logs, setLogs] = useState<LiveEntry[]>([])
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    const timers: number[] = []
    let elapsed = 0

    STAGES.forEach((s, i) => {
      elapsed += s.ms
      // stage advances
      timers.push(
        window.setTimeout(() => {
          setStage(i + 1)
          setLogs((prev) => [
            ...prev.map((l) => (l.stageIndex === i ? { ...l, state: 'done' as const } : l)),
            ...(STAGE_LOGS[i + 1]
              ? [{ stageIndex: i + 1, text: STAGE_LOGS[i + 1][0], state: 'active' as const }]
              : []),
          ])
        }, elapsed),
      )
      // per-stage log lines
      STAGE_LOGS[i].slice(1).forEach((line, j) => {
        timers.push(
          window.setTimeout(() => {
            setLogs((prev) => {
              const next = prev.map((l) =>
                l.stageIndex === i && l.state === 'active' ? { ...l, state: 'done' as const } : l,
              )
              const isLast = j === STAGE_LOGS[i].slice(1).length - 1
              next.push({ stageIndex: i, text: line, state: isLast && i === STAGES.length - 1 ? 'done' : 'active' })
              return next
            })
          }, elapsed - s.ms + ((j + 1) * s.ms) / (STAGE_LOGS[i].length)),
        )
      })
    })

    timers.push(
      window.setTimeout(() => {
        setDone(true)
      }, elapsed + 600),
    )
    timersRef.current = timers
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  // Completes to the story detail.
  useEffect(() => {
    if (!done) return
    const t = window.setTimeout(() => {
      navigate(storyId ? `/story/${storyId}` : '/story/101', { replace: true })
    }, 1200)
    return () => window.clearTimeout(t)
  }, [done, navigate, storyId])

  const cancel = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    toast({ title: 'Generation canceled', description: 'Your credits were not spent.' })
    navigate('/app')
  }

  const progress = done
    ? 100
    : Math.min(
        99,
        Math.round(
          ((STAGES.slice(0, stage).reduce((acc, s) => acc + s.ms, 0)) /
            STAGES.reduce((acc, s) => acc + s.ms, 0)) *
            100,
        ),
      )

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center">
      <div className="w-full rounded-card border border-gray-a6 bg-white p-6 shadow-sm md:p-8">
        <SectionLabel>Producing your film</SectionLabel>
        <h2 className="mt-1 text-lg font-semibold text-gray-12">
          {done ? 'Your story is ready' : 'Generating…'}
        </h2>

        {/* Progress bar */}
        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-3"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              'h-full rounded-full bg-yellow-9 transition-all duration-700 ease-out',
              done && 'bg-green-600',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs tabular-nums text-gray-10">{progress}%</p>

        {/* Stepper */}
        <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {STAGES.map((s, i) => {
            const Icon = s.icon
            const state = i < stage || done ? 'done' : i === stage ? 'active' : 'todo'
            return (
              <li
                key={s.label}
                className={cn(
                  'flex items-center gap-2 rounded-control border px-2.5 py-2 text-xs font-medium transition-colors sm:flex-col sm:gap-1.5 sm:text-center',
                  state === 'done' && 'border-gray-a6 bg-gray-1 text-gray-11',
                  state === 'active' && 'border-yellow-5 bg-yellow-1 text-yellow-12',
                  state === 'todo' && 'border-gray-a3 bg-white text-gray-9',
                )}
                aria-current={state === 'active' ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    state === 'done' && 'bg-gray-12 text-gray-1',
                    state === 'active' && 'bg-yellow-9 text-gray-1',
                    state === 'todo' && 'bg-gray-3 text-gray-10',
                  )}
                >
                  {state === 'done' ? (
                    <CheckCircledIcon width={14} height={14} />
                  ) : (
                    <Icon
                      width={14}
                      height={14}
                      className={state === 'active' ? 'animate-spin' : undefined}
                    />
                  )}
                </span>
                <span className="leading-tight">{s.label}</span>
              </li>
            )
          })}
        </ol>

        {/* Live status list */}
        <div className="mt-5 max-h-52 overflow-y-auto rounded-control border border-gray-a6 bg-gray-1 p-3 [scrollbar-width:thin]" aria-live="polite" aria-label="Generation log">
          <ul className="flex flex-col gap-1.5">
            {logs.length === 0 ? (
              <li className="text-xs text-gray-10">Warming up the pipeline…</li>
            ) : null}
            {logs.map((entry, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                {entry.state === 'done' ? (
                  <CheckCircledIcon width={13} height={13} className="shrink-0 text-gray-10" />
                ) : (
                  <UpdateIcon width={13} height={13} className="shrink-0 animate-spin text-yellow-11" />
                )}
                <span className={entry.state === 'done' ? 'text-gray-10' : 'font-medium text-gray-12'}>
                  {entry.text}
                </span>
              </li>
            ))}
            {done ? (
              <li className="mt-1 flex items-center gap-2 text-xs font-medium text-gray-12">
                <CheckCircledIcon width={13} height={13} className="text-green-600" />
                Story assembled — opening the editor…
              </li>
            ) : null}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          <p className="hidden items-center gap-1.5 text-xs text-gray-10 sm:flex">
            <CrossCircledIcon width={12} height={12} />
            Canceling stops before credits are spent
          </p>
          <AtlabsButton
            variant="secondary"
            size="md"
            className="ml-auto text-xs font-semibold uppercase tracking-wide"
            onClick={cancel}
            disabled={done}
          >
            Cancel
          </AtlabsButton>
        </div>
      </div>
    </div>
  )
}

export default Generating
