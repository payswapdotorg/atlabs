import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PlayIcon, StopIcon } from '@radix-ui/react-icons'
import { cn } from '../../../lib/utils'
import { AtlabsButton } from '../../../components/AtlabsButton'
import type { CustomFieldCtx, Point } from './types'
import { asFile, asPoint, asPoints, asStringArray } from './types'
import { VOICES, BRAND_PRESET_COLORS } from './fixtures'

/* ------------------------------------------------------------------ */
/* useFileUrl — stable object URL for an uploaded File                */
/* ------------------------------------------------------------------ */

export const useFileUrl = (file: File | null | undefined): string | null => {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return url
}

const percentFromEvent = (
  e: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
): Point => {
  const rect = e.currentTarget.getBoundingClientRect()
  return {
    x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
    y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
  }
}

/* ------------------------------------------------------------------ */
/* MotionPathField — click/drag SVG path editor                       */
/* ------------------------------------------------------------------ */

/**
 * Simple motion path editor: click to append keyframe points, drag a
 * point to move it, clear to start over. Points are stored in percent
 * coordinates so the path survives resizing.
 */
export const MotionPathField: React.FC<CustomFieldCtx> = ({ value, setValue, values }) => {
  const points = asPoints(value)
  const imageUrl = useFileUrl(asFile(values.image))
  const dragIndex = useRef<number | null>(null)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = percentFromEvent(e)
    const hit = points.findIndex(
      (q) => Math.hypot(q.x - p.x, q.y - p.y) < 4,
    )
    if (hit >= 0) {
      dragIndex.current = hit
    } else {
      dragIndex.current = null
      setValue([...points, p])
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragIndex.current === null) return
    const p = percentFromEvent(e)
    setValue(points.map((q, i) => (i === dragIndex.current ? p : q)))
  }

  const onPointerUp = () => {
    dragIndex.current = null
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="application"
        aria-label="Motion path editor — click to add keyframes"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="relative aspect-video w-full cursor-crosshair touch-none overflow-hidden rounded-control border border-gray-a6 bg-gray-2 select-none"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        ) : null}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {points.length > 1 ? (
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#f5c518"
              strokeWidth={0.8}
              strokeDasharray="3 2"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === 0 || i === points.length - 1 ? 1.8 : 1.2}
              fill={i === 0 ? '#f5c518' : '#ffffff'}
              stroke="#f5c518"
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {points.length === 0 ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-10">
            Click on the image to add motion keyframes
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-10">
          {points.length} {points.length === 1 ? 'keyframe' : 'keyframes'}
        </span>
        <AtlabsButton
          variant="ghost"
          size="sm"
          disabled={points.length === 0}
          onClick={() => setValue([])}
        >
          Clear path
        </AtlabsButton>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* MaskCanvasField — brush mask over the uploaded image               */
/* ------------------------------------------------------------------ */

const CANVAS_W = 480
const CANVAS_H = 300

/**
 * Brush mask canvas: drag to paint a translucent mask over the uploaded
 * image (or a neutral frame). The mask is stored as a PNG data URL.
 */
export const MaskCanvasField: React.FC<CustomFieldCtx> = ({ value, setValue, values }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const painting = useRef(false)
  const fileUrl = useFileUrl(asFile(values.image))
  const [strokes, setStrokes] = useState(0)

  const redraw = useCallback(
    (maskUrl: string | null) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const paint = () => {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
        ctx.fillStyle = '#e4e4e7'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
        if (maskUrl) {
          const mask = new Image()
          mask.onload = () => ctx.drawImage(mask, 0, 0, CANVAS_W, CANVAS_H)
          mask.src = maskUrl
        }
      }
      if (fileUrl) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
          const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height)
          const w = img.width * scale
          const h = img.height * scale
          ctx.drawImage(img, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h)
          if (maskUrl) {
            const mask = new Image()
            mask.onload = () => ctx.drawImage(mask, 0, 0, CANVAS_W, CANVAS_H)
            mask.src = maskUrl
          }
        }
        img.onerror = paint
        img.src = fileUrl
      } else {
        paint()
      }
    },
    [fileUrl],
  )

  useEffect(() => {
    redraw(typeof value === 'string' ? value : null)
  }, [redraw, value])

  const canvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    }
  }

  const brush = (p: Point) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = 'rgba(245, 197, 24, 0.45)'
    ctx.beginPath()
    ctx.arc(p.x, p.y, 22, 0, Math.PI * 2)
    ctx.fill()
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        aria-label="Mask canvas — drag to paint the area to regenerate"
        className="aspect-video w-full cursor-crosshair touch-none rounded-control border border-gray-a6 bg-gray-2"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          painting.current = true
          brush(canvasPoint(e))
          setStrokes((s) => s + 1)
        }}
        onPointerMove={(e) => {
          if (!painting.current) return
          brush(canvasPoint(e))
        }}
        onPointerUp={() => {
          painting.current = false
          const data = canvasRef.current?.toDataURL('image/png') ?? null
          setValue(data)
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-10">
          {strokes === 0 ? 'Nothing masked yet' : `${strokes} brush ${strokes === 1 ? 'stroke' : 'strokes'}`}
        </span>
        <AtlabsButton
          variant="ghost"
          size="sm"
          disabled={strokes === 0}
          onClick={() => {
            setStrokes(0)
            setValue(null)
          }}
        >
          Clear mask
        </AtlabsButton>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* FocusPointField — click to place the reframe focus point           */
/* ------------------------------------------------------------------ */

export const FocusPointField: React.FC<CustomFieldCtx> = ({ value, setValue, values }) => {
  const point = asPoint(value)
  const fileUrl = useFileUrl(asFile(values.video) ?? asFile(values.image))

  return (
    <div className="flex flex-col gap-2">
      <div
        role="application"
        aria-label="Focus point picker — click to set the subject focus"
        onClick={(e) => setValue(percentFromEvent(e))}
        className="relative aspect-video w-full cursor-crosshair overflow-hidden rounded-control border border-gray-a6 bg-gray-2"
      >
        {fileUrl ? (
          asFile(values.video) ? (
            <video src={fileUrl} className="absolute inset-0 h-full w-full object-cover opacity-80" muted preload="metadata" />
          ) : (
            <img src={fileUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          )
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-10">
            Click to set the focus point
          </span>
        )}
        {point ? (
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span className="absolute -left-3 -top-3 block h-6 w-6 rounded-full border-2 border-yellow-9 bg-yellow-9/25" />
            <span className="absolute -left-2 -top-2 block h-4 w-4 rounded-full border-2 border-yellow-9 bg-white/70" />
          </span>
        ) : null}
      </div>
      <p className="text-xs text-gray-10">
        {point
          ? `Focus locked at ${Math.round(point.x)}%, ${Math.round(point.y)}%`
          : 'No focus point set — the reframe will keep the frame center'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* PaletteField — brand color palette picker                          */
/* ------------------------------------------------------------------ */

export const PaletteField: React.FC<CustomFieldCtx> = ({ value, setValue }) => {
  const selected = asStringArray(value)
  const [custom, setCustom] = useState('#52525b')

  const toggle = (hex: string) => {
    setValue(
      selected.includes(hex)
        ? selected.filter((c) => c !== hex)
        : [...selected, hex],
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {BRAND_PRESET_COLORS.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-pressed={selected.includes(hex)}
            aria-label={`Toggle brand color ${hex}`}
            onClick={() => toggle(hex)}
            className={cn(
              'h-8 w-8 rounded-control border-2 transition-transform',
              selected.includes(hex)
                ? 'border-yellow-9 scale-110 shadow-sm'
                : 'border-gray-a6 hover:scale-105',
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label="Custom brand color"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded-control border border-gray-a6 bg-white p-0.5"
        />
        <AtlabsButton
          variant="secondary"
          size="sm"
          onClick={() => {
            if (!selected.includes(custom)) setValue([...selected, custom])
          }}
        >
          Add custom
        </AtlabsButton>
      </div>

      <div className="flex items-center gap-2">
        {selected.length === 0 ? (
          <span className="text-xs text-gray-10">No colors picked yet</span>
        ) : (
          selected.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={`Remove brand color ${hex}`}
              onClick={() => toggle(hex)}
              className="group relative h-9 w-9 rounded-full border border-gray-a6 shadow-sm"
              style={{ backgroundColor: hex }}
              title={`${hex} — click to remove`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 mix-blend-difference group-hover:opacity-100">
                ×
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VoiceListField — fixture voices with fake play + select            */
/* ------------------------------------------------------------------ */

export const VoiceListField: React.FC<CustomFieldCtx> = ({ value, setValue }) => {
  const selectedId = typeof value === 'string' ? value : ''
  const [playing, setPlaying] = useState<string | null>(null)

  return (
    <div
      role="radiogroup"
      aria-label="Voice list"
      className="flex max-h-72 flex-col gap-1.5 overflow-y-auto rounded-control border border-gray-a6 bg-gray-1 p-1.5"
    >
      {VOICES.map((voice) => {
        const active = selectedId === voice.id
        return (
          <div
            key={voice.id}
            className={cn(
              'flex items-center gap-3 rounded-control border px-3 py-2 transition-colors',
              active
                ? 'border-yellow-9 bg-yellow-2'
                : 'border-transparent bg-white hover:bg-gray-2',
            )}
          >
            <button
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Select voice ${voice.name}`}
              onClick={() => setValue(voice.id)}
              className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <span className="block text-sm font-semibold text-gray-12">{voice.name}</span>
              <span className="block truncate text-xs text-gray-10">{voice.tags}</span>
            </button>
            <button
              type="button"
              aria-label={playing === voice.id ? `Stop ${voice.name} sample` : `Play ${voice.name} sample`}
              onClick={() => setPlaying(playing === voice.id ? null : voice.id)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-a6 bg-white text-gray-11 transition-colors hover:bg-gray-2"
            >
              {playing === voice.id ? (
                <StopIcon width={12} height={12} />
              ) : (
                <PlayIcon width={12} height={12} />
              )}
            </button>
            {playing === voice.id ? (
              <span className="flex h-4 items-end gap-0.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-0.5 animate-pulse rounded-full bg-yellow-9"
                    style={{ height: `${6 + ((i * 5) % 9)}px`, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* SubjectGridField — thumbnail grid of the uploaded subject set      */
/* ------------------------------------------------------------------ */

export const SubjectGridField: React.FC<CustomFieldCtx> = ({ value, setValue }) => {
  const files = useMemo(
    () => (Array.isArray(value) ? value.filter((f): f is File => f instanceof File) : []),
    [value],
  )
  const urls = useFileUrls(files)

  return (
    <div className="flex flex-col gap-2">
      {urls.length === 0 ? (
        <p className="rounded-control border border-dashed border-gray-a6 bg-gray-1 px-3 py-4 text-center text-xs text-gray-10">
          No subject images yet — upload a set above.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-1.5">
          {urls.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-control border border-gray-a6"
            >
              <img src={url} alt={`Subject ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label={`Remove subject image ${i + 1}`}
                onClick={() => setValue(files.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white group-hover:flex"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-10">{files.length} subject {files.length === 1 ? 'image' : 'images'} in the training set</p>
    </div>
  )
}

/* Helper: object URLs for a whole file list. */
const useFileUrls = (files: File[]): string[] => {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    const created = files.map((f) => URL.createObjectURL(f))
    setUrls(created)
    return () => created.forEach((u) => URL.revokeObjectURL(u))
  }, [files])
  return urls
}
