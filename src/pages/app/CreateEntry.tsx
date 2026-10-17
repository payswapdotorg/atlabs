import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UpdateIcon } from '@radix-ui/react-icons'
import { useDocumentTitle } from '../../lib/useDocumentTitle'

/**
 * CreateEntry — deep-link entry (/create/:createSlug). Resolves the slug
 * to the right wizard with a preset applied, then immediately routes.
 *
 *   /create/blank           → /new-story?blank=1
 *   /create/<style-slug>    → /new-story?style=<style-slug>
 *   /create/song|music|audio→ /new-audio
 *   /create/captions        → /new-video-captions
 *   anything else           → /app
 */
const CreateEntry: React.FC = () => {
  const { createSlug } = useParams<{ createSlug: string }>()
  const navigate = useNavigate()
  useDocumentTitle('Create | Atlabs AI')

  useEffect(() => {
    const slug = (createSlug ?? '').toLowerCase().trim()
    if (!slug || slug === 'home' || slug === 'start') {
      navigate('/app', { replace: true })
      return
    }
    if (slug === 'blank') {
      navigate('/new-story?blank=1', { replace: true })
      return
    }
    if (['song', 'songs', 'music', 'audio', 'music-video'].includes(slug)) {
      navigate('/new-audio', { replace: true })
      return
    }
    if (['caption', 'captions', 'captions-video'].includes(slug)) {
      navigate('/new-video-captions', { replace: true })
      return
    }
    // Fall through: treat any other slug as a style preset for the wizard.
    navigate(`/new-story?style=${encodeURIComponent(slug)}`, { replace: true })
  }, [createSlug, navigate])

  return (
    <div
      className="flex items-center justify-center py-24 text-sm text-gray-10"
      role="status"
      aria-live="polite"
    >
      <UpdateIcon width={16} height={16} className="mr-2 animate-spin" />
      Opening the studio…
    </div>
  )
}

export default CreateEntry
