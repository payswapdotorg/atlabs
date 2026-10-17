import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircledIcon,
  DiscIcon,
  Cross2Icon,
} from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import { useToast } from '../../components/Toast'
import { createStory, getStory } from '../../lib/api/stories'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { cn } from '../../lib/utils'
import { Chip, DropZone, SectionLabel } from './_shared'

const MUSIC_TYPES = ["Kids' Edutainment", 'Indie Music', 'Faith & Gospel']

const DEFAULT_LYRICS = `[Verse 1]
The moon climbed up to say hello,
the streetlamps hum a velvet glow…

[Chorus]
Run the neon, run the night,
everything will be alright.`

/**
 * NewAudio — song wizard. Drop an mp3/wav, pick a music type, edit the
 * lyrics, then produce a cinematic music video. When mounted under
 * /new-audio/:storyId the song draft is prefilled from that story.
 */
const NewAudio: React.FC = () => {
  const { storyId } = useParams<{ storyId?: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  useDocumentTitle('New Audio | Atlabs AI')

  const [song, setSong] = useState<{ name: string; size: string } | null>(null)
  const [musicType, setMusicType] = useState<string>(MUSIC_TYPES[0])
  const [lyrics, setLyrics] = useState(DEFAULT_LYRICS)
  const [creating, setCreating] = useState(false)

  // Prefill when editing an existing song story.
  useEffect(() => {
    if (!storyId) return
    let cancelled = false
    getStory(Number(storyId)).then((story) => {
      if (cancelled || !story) return
      setSong({ name: `${story.title}.mp3`, size: '4.2 MB' })
      setMusicType((cur) => cur)
      setLyrics((cur) => cur)
    })
    return () => {
      cancelled = true
    }
  }, [storyId])

  const create = async () => {
    if (!song) {
      toast({ title: 'Add a song first', description: 'Drop an mp3 or wav to continue.', variant: 'error' })
      return
    }
    setCreating(true)
    try {
      const story = await createStory({
        title: song.name.replace(/\.(mp3|wav)$/i, ''),
        script: lyrics,
        style: musicType,
        language: 'English (US)',
        voice: 'Instrumental + vocals',
        scene_pace: 'Beat-matched',
        workflow_type: 'SONG',
        song_name: song.name,
        lyrics,
      })
      toast({ title: 'Music video started', description: 'Cutting scenes to the beat…', variant: 'success' })
      navigate('/generating', { state: { storyId: story.id } })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-9 text-gray-1">
          <DiscIcon width={18} height={18} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-gray-12">Start with a Song</h2>
          <p className="text-sm text-gray-10">
            Drop a Song. Watch it become a cinematic music video in minutes.
          </p>
        </div>
      </div>

      {/* Song upload */}
      <section className="mt-5" aria-label="Song upload">
        <SectionLabel>Song</SectionLabel>
        {song ? (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-card border border-gray-a6 bg-white px-4 py-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <CheckCircledIcon width={18} height={18} className="shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-12">{song.name}</p>
                <p className="text-xs text-gray-10">{song.size} · ready to score</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Remove song"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-gray-10 transition-colors hover:bg-gray-2 hover:text-gray-12"
              onClick={() => setSong(null)}
            >
              <Cross2Icon width={14} height={14} />
            </button>
          </div>
        ) : (
          <DropZone
            className="mt-2"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            label="Drop your song here (mp3 / wav)"
            hint="Up to 10 minutes — stems work too"
            onFiles={(files) => {
              const f = files[0]
              setSong({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` })
            }}
          />
        )}
      </section>

      {/* Music type */}
      <section className="mt-5" aria-label="Music type">
        <SectionLabel>Music type</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {MUSIC_TYPES.map((t) => (
            <Chip key={t} label={t} selected={musicType === t} onClick={() => setMusicType(t)} />
          ))}
        </div>
      </section>

      {/* Lyrics */}
      <section className="mt-5" aria-label="Lyrics">
        <SectionLabel>Lyrics</SectionLabel>
        <textarea
          rows={8}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Paste or edit lyrics — verses, chorus, bridge…"
          aria-label="Lyric editor"
          className={cn(
            'mt-2 w-full resize-y rounded-card border border-gray-a6 bg-white p-4 font-mono text-sm leading-relaxed',
            'text-gray-12 placeholder:text-gray-9 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
        />
        <p className="mt-1 text-xs text-gray-10">
          Lines in [brackets] mark sections; scenes are cut to the beat.
        </p>
      </section>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-a6 pt-4">
        <AtlabsButton variant="ghost" size="md" onClick={() => navigate('/app')}>
          Back to home
        </AtlabsButton>
        <AtlabsButton
          variant="primary"
          size="lg"
          className="text-xs font-bold uppercase tracking-wider"
          disabled={creating || !song}
          onClick={create}
        >
          {creating ? 'Starting…' : 'Create Music Video'}
        </AtlabsButton>
      </div>
    </div>
  )
}

export default NewAudio
