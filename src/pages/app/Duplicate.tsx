import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CopyIcon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Modal from '../../components/Modal'
import { useToast } from '../../components/Toast'
import { duplicateStory, getStories } from '../../lib/api/stories'
import type { Story } from '../../lib/api/stories'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { PageSelect } from './_shared'

/**
 * Duplicate — utility page that copies an existing story into a new
 * draft. The source is picked with ?storyId= or via the in-page picker
 * (the 3-dot menu on /projects deep-links here).
 */
const Duplicate: React.FC = () => {
  useDocumentTitle('Duplicate Story | Atlabs AI')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(true)
  const [working, setWorking] = useState(false)

  const requestedId = Number(searchParams.get('storyId'))
  const [selectedId, setSelectedId] = useState<string>(
    Number.isFinite(requestedId) && requestedId > 0 ? String(requestedId) : '',
  )

  useEffect(() => {
    let cancelled = false
    getStories(1, 50).then((page) => {
      if (cancelled) return
      setStories(page.results)
      setLoading(false)
      if (!selectedId && page.results.length > 0) {
        setSelectedId(String(page.results[0].id))
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const source = stories.find((s) => String(s.id) === selectedId) ?? null

  const onDuplicate = async () => {
    if (!source) return
    setWorking(true)
    try {
      const copy = await duplicateStory(source.id)
      setOpen(false)
      toast({
        title: 'Story duplicated',
        description: copy ? `Created “${copy.title}” as a draft.` : undefined,
        variant: 'success',
      })
      navigate('/projects')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) navigate(-1)
        }}
        title="Duplicate story"
        description="Copy an existing story into a new draft you can edit freely."
        footer={
          <div className="flex justify-end gap-2">
            <AtlabsButton variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              Cancel
            </AtlabsButton>
            <AtlabsButton
              variant="primary"
              size="sm"
              className="font-semibold"
              disabled={!source || working}
              onClick={onDuplicate}
            >
              <CopyIcon width={13} height={13} />
              {working ? 'Copying…' : 'Duplicate'}
            </AtlabsButton>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-gray-10">Loading stories…</p>
        ) : stories.length === 0 ? (
          <p className="text-sm text-gray-11">
            You have no stories to duplicate yet — create one first.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <PageSelect
              ariaLabel="Story to duplicate"
              value={selectedId}
              onValueChange={(v) => {
                setSelectedId(v)
                setSearchParams({ storyId: v }, { replace: true })
              }}
              options={stories.map((s) => ({ value: String(s.id), label: s.title }))}
            />
            {source ? (
              <p className="text-xs text-gray-10">
                “{source.title}” · {source.workflow_type.toLowerCase()} · last edited{' '}
                {new Date(source.updated_at).toLocaleDateString()}
              </p>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Duplicate
