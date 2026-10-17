import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import {
  ArchiveIcon,
  CopyIcon,
  DotsHorizontalIcon,
  LayersIcon,
  ReaderIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/Pagination'
import Skeleton from '../../components/Skeleton'
import IconBadge from '../../components/IconBadge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu'
import { usePageHeader } from '../../AppShell'
import { useToast } from '../../components/Toast'
import {
  archiveStory,
  deleteStory,
  duplicateStory,
  getStories,
} from '../../lib/api/stories'
import type { Story, StoryStateFilter, StoryWorkflowFilter } from '../../lib/api/stories'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { PageSelect, StatusBadge } from '../app/_shared'

const PAGE_SIZE = 6

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Status: All' },
  { value: 'DRAFT', label: 'Status: Draft' },
  { value: 'GENERATING', label: 'Status: Generating' },
  { value: 'COMPLETED', label: 'Status: Completed' },
  { value: 'EDITOR', label: 'Status: Editor' },
]

const WORKFLOW_OPTIONS = [
  { value: 'ALL', label: 'Workflow Type: All' },
  { value: 'SCRIPT', label: 'Workflow Type: Script' },
  { value: 'SONG', label: 'Workflow Type: Song' },
  { value: 'CAPTIONS', label: 'Workflow Type: Captions' },
]

const FOLDERS = [
  { id: 'script', label: 'Scripts & Films', workflow: 'SCRIPT' as const, hint: 'Idea/script productions' },
  { id: 'song', label: 'Music Videos', workflow: 'SONG' as const, hint: 'Song-driven cuts' },
  { id: 'captions', label: 'Captioned Cuts', workflow: 'CAPTIONS' as const, hint: 'Uploaded videos with captions' },
]

const lastEdited = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

/* ------------------------------------------------------------------ */
/* StoryCard                                                          */
/* ------------------------------------------------------------------ */

const StoryCard: React.FC<{
  story: Story
  onOpen: () => void
  onDuplicate: () => void
  onArchive: () => void
  onDelete: () => void
}> = ({ story, onOpen, onDuplicate, onArchive, onDelete }) => (
  <article className="group flex flex-col overflow-hidden rounded-card border border-gray-a6 bg-white shadow-sm transition-shadow hover:shadow-md">
    <button
      type="button"
      onClick={onOpen}
      className="relative block aspect-video w-full bg-gray-2 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`Open ${story.title}`}
    >
      {story.thumbnail_url ? (
        <img
          src={story.thumbnail_url}
          alt=""
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          loading="lazy"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-medium uppercase tracking-wide text-gray-9">
          {story.status === 'GENERATING' ? 'Rendering…' : 'No thumbnail yet'}
        </span>
      )}
      <span className="absolute left-2 top-2">
        <StatusBadge status={story.status} />
      </span>
    </button>

    <div className="flex items-start gap-1 p-3">
      <div className="min-w-0 flex-1">
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <h3 className="truncate text-sm font-semibold text-gray-12">{story.title}</h3>
        </button>
        <p className="mt-0.5 text-xs text-gray-10">
          {story.workflow_type.charAt(0) + story.workflow_type.slice(1).toLowerCase()} · edited {lastEdited(story.updated_at)}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${story.title}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-gray-10 transition-colors hover:bg-gray-2 hover:text-gray-12 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <DotsHorizontalIcon width={15} height={15} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={onDuplicate}>
            <CopyIcon width={14} height={14} />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onArchive}>
            <ArchiveIcon width={14} height={14} />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onDelete} className="text-red-600 data-[highlighted]:text-red-700">
            <TrashIcon width={14} height={14} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </article>
)

/* ------------------------------------------------------------------ */
/* Projects — My Stories                                              */
/* ------------------------------------------------------------------ */

const Projects: React.FC = () => {
  useDocumentTitle('My Stories | Atlabs AI')
  const navigate = useNavigate()
  const { setActions } = usePageHeader()
  const { toast } = useToast()

  const [tab, setTab] = useState('stories')
  const [status, setStatus] = useState<StoryStateFilter>('ALL')
  const [workflow, setWorkflow] = useState<StoryWorkflowFilter>('ALL')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ count: number; results: Story[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<Story | null>(null)
  const [working, setWorking] = useState(false)

  const fetchPage = useCallback(
    (p: number, s: StoryStateFilter, w: StoryWorkflowFilter) => {
      setLoading(true)
      getStories(p, PAGE_SIZE, s, w).then((res) => {
        setData({ count: res.count, results: res.results })
        setLoading(false)
      })
    },
    [],
  )

  useEffect(() => {
    fetchPage(page, status, workflow)
  }, [fetchPage, page, status, workflow])

  const refetch = useCallback(() => fetchPage(page, status, workflow), [fetchPage, page, status, workflow])

  const createButton = (
    <AtlabsButton
      variant="primary"
      size="sm"
      className="text-xs font-semibold uppercase tracking-wide"
      onClick={() => navigate('/new-story')}
    >
      Create New Story
    </AtlabsButton>
  )

  useEffect(() => {
    setActions(createButton)
    return () => setActions(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1),
    [data],
  )

  const onDuplicate = async (story: Story) => {
    const copy = await duplicateStory(story.id)
    toast({
      title: 'Story duplicated',
      description: copy ? `Created “${copy.title}”.` : undefined,
      variant: 'success',
    })
    refetch()
  }

  const onArchive = async (story: Story) => {
    await archiveStory(story.id)
    toast({ title: 'Story archived', description: `“${story.title}” moved out of My Stories.` })
    refetch()
  }

  const onDelete = async () => {
    if (!pendingDelete) return
    setWorking(true)
    try {
      await deleteStory(pendingDelete.id)
      toast({ title: 'Story deleted', description: `“${pendingDelete.title}” was removed.`, variant: 'success' })
      setPendingDelete(null)
      refetch()
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Tab bar + filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabsPrimitive.Root value={tab} onValueChange={setTab}>
          <TabsPrimitive.List
            aria-label="My Stories views"
            className="inline-flex items-center gap-0.5 rounded-control bg-gray-2 p-0.5"
          >
            <TabsPrimitive.Trigger
              value="stories"
              className="inline-flex h-8 items-center rounded-[4px] px-4 text-xs font-bold uppercase tracking-wide text-gray-11 transition-colors hover:text-gray-12 data-[state=active]:bg-white data-[state=active]:text-gray-12 data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Stories
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="folders"
              className="inline-flex h-8 items-center rounded-[4px] px-4 text-xs font-bold uppercase tracking-wide text-gray-11 transition-colors hover:text-gray-12 data-[state=active]:bg-white data-[state=active]:text-gray-12 data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Folders
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>
        </TabsPrimitive.Root>

        {tab === 'stories' ? (
          <div className="flex flex-wrap items-center gap-2">
            <PageSelect
              ariaLabel="Filter by status"
              value={status}
              onValueChange={(v) => {
                setStatus(v as StoryStateFilter)
                setPage(1)
              }}
              options={STATUS_OPTIONS}
            />
            <PageSelect
              ariaLabel="Filter by workflow type"
              value={workflow}
              onValueChange={(v) => {
                setWorkflow(v as StoryWorkflowFilter)
                setPage(1)
              }}
              options={WORKFLOW_OPTIONS}
            />
            <span className="hidden md:inline-flex">{createButton}</span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      {tab === 'stories' ? (
        loading || !data ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading stories">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-card" />
            ))}
          </div>
        ) : data.count === 0 ? (
          <EmptyState
            className="mt-6"
            icon={<ReaderIcon width={22} height={22} />}
            title="Let's get started"
            description="Create new stories or add existing projects using the 3-dot menu on any story."
            action={createButton}
          />
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.results.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onOpen={() => navigate(`/story/${story.id}`)}
                  onDuplicate={() => void onDuplicate(story)}
                  onArchive={() => void onArchive(story)}
                  onDelete={() => setPendingDelete(story)}
                />
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="mt-6 flex justify-center">
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  totalCount={data.count}
                  onPageChange={setPage}
                />
              </div>
            ) : (
              <p className="mt-4 text-center text-xs text-gray-9">
                {data.count} stor{data.count === 1 ? 'y' : 'ies'}
              </p>
            )}
          </>
        )
      ) : (
        /* Folders view */
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FOLDERS.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => {
                setWorkflow(folder.workflow)
                setStatus('ALL')
                setPage(1)
                setTab('stories')
              }}
              className="flex items-center gap-4 rounded-card border border-gray-a6 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <IconBadge size="lg" tone="yellow">
                <LayersIcon width={20} height={20} />
              </IconBadge>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-12">{folder.label}</p>
                <p className="truncate text-xs text-gray-10">{folder.hint}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="Delete story?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently removed. This cannot be undone.`
            : undefined
        }
        footer={
          <div className="flex justify-end gap-2">
            <AtlabsButton variant="ghost" size="sm" onClick={() => setPendingDelete(null)}>
              Cancel
            </AtlabsButton>
            <AtlabsButton
              variant="destructive"
              size="sm"
              className="font-semibold"
              disabled={working}
              onClick={() => void onDelete()}
            >
              <TrashIcon width={13} height={13} />
              {working ? 'Deleting…' : 'Delete'}
            </AtlabsButton>
          </div>
        }
      >
        <p className="text-sm text-gray-11">
          Exports you already downloaded are not affected. Folder counts update after deletion.
        </p>
      </Modal>
    </div>
  )
}

export default Projects
