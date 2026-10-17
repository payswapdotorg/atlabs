import React, { useEffect, useMemo, useState } from 'react'
import {
  SpeakerLoudIcon,
  ImageIcon,
  PlayIcon,
  VideoIcon,
} from '@radix-ui/react-icons'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import Skeleton from '../../components/Skeleton'
import { useToast } from '../../components/Toast'
import { addMediaAsset, getMediaLibrary } from '../../lib/api/library'
import type { MediaAsset, MediaType } from '../../lib/api/library'
import { PageSelect, DropZone } from '../app/_shared'
import { FixtureImage, formatDate } from './_shared'

const PAGE_SIZE = 24

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Type : All' },
  { value: 'image', label: 'Type : Images' },
  { value: 'audio', label: 'Type : Audio' },
  { value: 'video', label: 'Type : Video' },
]

const typeIcon = (t: MediaType): React.ReactNode =>
  t === 'image' ? (
    <ImageIcon width={16} height={16} />
  ) : t === 'audio' ? (
    <SpeakerLoudIcon width={16} height={16} />
  ) : (
    <VideoIcon width={16} height={16} />
  )

/* ------------------------------------------------------------------ */
/* AssetCard                                                          */
/* ------------------------------------------------------------------ */

const AssetCard: React.FC<{
  asset: MediaAsset
  onOpen: () => void
}> = ({ asset, onOpen }) => {
  const isUploaded = asset.url.startsWith('blob:') || asset.url.startsWith('data:')
  return (
    <article className="group overflow-hidden rounded-card border border-gray-a6 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-video w-full overflow-hidden bg-gray-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={`Preview ${asset.file_name}`}
      >
        {asset.media_type === 'image' ? (
          <FixtureImage
            src={asset.url}
            seed={asset.file_name}
            alt={asset.file_name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : asset.media_type === 'video' && isUploaded ? (
          <video src={asset.url} className="h-full w-full object-cover" muted preload="metadata" />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-3 to-gray-2 text-gray-10">
            {typeIcon(asset.media_type)}
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {asset.media_type}
            </span>
          </span>
        )}
        {asset.media_type !== 'image' ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow transition-transform group-hover:scale-105">
              {asset.media_type === 'audio' ? (
                <SpeakerLoudIcon width={16} height={16} className="text-gray-12" />
              ) : (
                <PlayIcon width={16} height={16} className="text-gray-12" />
              )}
            </span>
          </span>
        ) : null}
      </button>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-gray-12" title={asset.file_name}>
          {asset.file_name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-gray-10">
          {asset.content_type} · {formatDate(asset.created_at)}
        </p>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* AssetPreviewModal                                                  */
/* ------------------------------------------------------------------ */

const AssetPreviewModal: React.FC<{
  asset: MediaAsset | null
  onOpenChange: (open: boolean) => void
}> = ({ asset, onOpenChange }) => {
  const isUploaded = asset ? asset.url.startsWith('blob:') : false
  return (
    <Modal
      open={asset !== null}
      onOpenChange={onOpenChange}
      title={asset?.file_name ?? 'Asset'}
      description={
        asset ? `${asset.content_type} · added ${formatDate(asset.created_at)}` : undefined
      }
      className="max-w-2xl"
    >
      {asset ? (
        <div className="overflow-hidden rounded-card border border-gray-a6 bg-gray-2">
          {asset.media_type === 'image' ? (
            <FixtureImage
              src={asset.url}
              seed={asset.file_name}
              alt={asset.file_name}
              className="max-h-[60vh] w-full object-contain"
            />
          ) : asset.media_type === 'video' && isUploaded ? (
            <video src={asset.url} controls className="max-h-[60vh] w-full bg-black" />
          ) : asset.media_type === 'audio' ? (
            <div className="flex flex-col items-center gap-4 p-8">
              <SpeakerLoudIcon width={40} height={40} className="text-gray-10" />
              <audio controls src={asset.url} className="w-full max-w-sm" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-8">
              <VideoIcon width={40} height={40} className="text-gray-10" />
              <p className="text-xs text-gray-10">
                Video preview placeholder (fixture thumbnail stream)
              </p>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* AssetsTab                                                          */
/* ------------------------------------------------------------------ */

const AssetsTab: React.FC = () => {
  const { toast } = useToast()
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ count: number; results: MediaAsset[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MediaAsset | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMediaLibrary({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      media_type: typeFilter,
    }).then((res) => {
      if (cancelled) return
      setData({ count: res.count, results: res.results })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [typeFilter, page])

  const onFiles = async (files: File[]) => {
    if (files.length === 0) return
    setUploading(true)
    const mediaTypeOf = (file: File): MediaType => {
      if (file.type.startsWith('image/')) return 'image'
      if (file.type.startsWith('audio/')) return 'audio'
      if (file.type.startsWith('video/')) return 'video'
      return 'image'
    }
    await Promise.all(
      files.map((file) =>
        addMediaAsset({
          file_name: file.name,
          content_type: file.type || 'application/octet-stream',
          media_type: mediaTypeOf(file),
          url: URL.createObjectURL(file),
        }),
      ),
    )
    setUploading(false)
    setPage(1)
    setTypeFilter('ALL')
    toast({
      title: `Uploaded ${files.length} ${files.length === 1 ? 'file' : 'files'}`,
      description: 'Your assets are now available across the Library.',
      variant: 'success',
    })
  }

  const grid = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-card border border-gray-a6 bg-white">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (!data || data.results.length === 0) {
      return (
        <div className="rounded-card border border-dashed border-gray-a6 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-12">No assets here yet</p>
          <p className="mt-1 text-sm text-gray-11">
            Drop files above, or clear the type filter to see the full library.
          </p>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.results.map((asset) => (
          <AssetCard key={asset.id} asset={asset} onOpen={() => setSelected(asset)} />
        ))}
      </div>
    )
  }, [loading, data])

  return (
    <div className="py-4">
      <DropZone
        label={uploading ? 'Uploading…' : 'Upload media'}
        hint="Images, audio and video — drag & drop or click"
        multiple
        onFiles={onFiles}
        className="mb-4"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <PageSelect
          ariaLabel="Asset type filter"
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v)
            setPage(1)
          }}
          options={TYPE_OPTIONS}
        />
        {data ? (
          <p className="text-xs text-gray-10">
            {data.count} {data.count === 1 ? 'asset' : 'assets'} in your media library
          </p>
        ) : null}
      </div>

      {grid}

      {data ? (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={data.count}
          onPageChange={setPage}
        />
      ) : null}

      <AssetPreviewModal
        asset={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </div>
  )
}

export default AssetsTab
