import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayIcon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Modal from '../../components/Modal'
import Skeleton from '../../components/Skeleton'
import { useToast } from '../../components/Toast'
import { getImageStyles } from '../../lib/api/library'
import type { ImageStyle } from '../../lib/api/library'
import { FixtureImage, SourceBadge, durationLabel } from './_shared'

/* ------------------------------------------------------------------ */
/* StyleCard                                                          */
/* ------------------------------------------------------------------ */

const StyleCard: React.FC<{
  style: ImageStyle
  onOpen: () => void
}> = ({ style, onOpen }) => (
  <article className="group overflow-hidden rounded-card border border-gray-a6 bg-white shadow-sm transition-shadow hover:shadow-md">
    <button
      type="button"
      onClick={onOpen}
      className="relative block aspect-video w-full overflow-hidden bg-gray-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`View ${style.name} style`}
    >
      <FixtureImage
        src={style.preview_url}
        seed={style.slug}
        alt={style.name}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100">
          <PlayIcon width={16} height={16} className="text-gray-12" />
        </span>
      </span>
      <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
        {durationLabel(style.preview_media.duration_in_ms)}
      </span>
    </button>
    <div className="flex items-center justify-between gap-2 p-3">
      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <h3 className="truncate text-sm font-semibold text-gray-12">{style.name}</h3>
      </button>
      <SourceBadge source={style.source} />
    </div>
  </article>
)

/* ------------------------------------------------------------------ */
/* StylesTab                                                          */
/* ------------------------------------------------------------------ */

const StylesTab: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [styles, setStyles] = useState<ImageStyle[] | null>(null)
  const [selected, setSelected] = useState<ImageStyle | null>(null)

  useEffect(() => {
    let cancelled = false
    getImageStyles().then((rows) => {
      if (!cancelled) setStyles(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const useInStory = () => {
    if (!selected) return
    const name = selected.name
    setSelected(null)
    toast({
      title: 'Style attached to the story wizard',
      description: `${name} will illustrate your next story.`,
      variant: 'success',
    })
    navigate(`/new-story?style=${encodeURIComponent(selected.slug)}`)
  }

  if (!styles) {
    return (
      <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-gray-a6 bg-white">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {styles.map((s) => (
        <StyleCard key={s.id} style={s} onOpen={() => setSelected(s)} />
      ))}

      <Modal
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        title={selected?.name ?? 'Style'}
        description={
          selected
            ? `System style · preview ${durationLabel(selected.preview_media.duration_in_ms)} · slug ${selected.slug}`
            : undefined
        }
        className="max-w-xl"
        footer={
          <>
            <AtlabsButton
              variant="ghost"
              onClick={() => setSelected(null)}
            >
              Close
            </AtlabsButton>
            <AtlabsButton variant="primary" onClick={useInStory} disabled={!selected}>
              Use in Story
            </AtlabsButton>
          </>
        }
      >
        {selected ? (
          <div className="overflow-hidden rounded-card border border-gray-a6 bg-gray-2">
            <FixtureImage
              src={selected.preview_url}
              seed={selected.slug}
              alt={selected.name}
              className="aspect-video w-full object-cover"
            />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default StylesTab
