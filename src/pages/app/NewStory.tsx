import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  PlayIcon,
  PlusIcon,
  StopIcon,
  PersonIcon,
} from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Modal from '../../components/Modal'
import IconBadge from '../../components/IconBadge'
import { useToast } from '../../components/Toast'
import { createStory } from '../../lib/api/stories'
import type { CreateStoryPayload } from '../../lib/api/stories'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { cn } from '../../lib/utils'
import {
  Chip,
  DropZone,
  Field,
  PageSelect,
  SectionLabel,
  WizardStepper,
  textInputClass,
} from './_shared'

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

interface StyleCard {
  id: string
  name: string
  from: string
  to: string
}

const STYLES: StyleCard[] = [
  { id: 'paper-cutout', name: 'Paper Cutout', from: '#fde68a', to: '#d97706' },
  { id: 'animated-explainer', name: 'Animated Explainer', from: '#a7f3d0', to: '#047857' },
  { id: 'animated-cartoon', name: 'Animated Cartoon', from: '#fca5a5', to: '#b91c1c' },
  { id: 'realistic-drama', name: 'Realistic Drama', from: '#e2e8f0', to: '#1e293b' },
  { id: 'storybook-illustration', name: 'Storybook Illustration', from: '#fbcfe8', to: '#9d174d' },
  { id: 'claymation', name: 'Claymation', from: '#fed7aa', to: '#c2410c' },
  { id: 'comic-book-ink', name: 'Comic Book Ink', from: '#e5e7eb', to: '#111827' },
  { id: 'watercolor-dream', name: 'Watercolor Dream', from: '#bfdbfe', to: '#1d4ed8' },
  { id: 'pixel-arcade', name: 'Pixel Arcade', from: '#c4b5fd', to: '#5b21b6' },
  { id: 'anime-cel', name: 'Anime Cel', from: '#99f6e4', to: '#0f766e' },
  { id: 'retro-scifi', name: 'Retro Sci-Fi', from: '#fca5a5', to: '#581c87' },
  { id: 'docu-realism', name: 'Docu Realism', from: '#d9f99d', to: '#3f6212' },
]

const styleThumb = (s: StyleCard): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="135"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${s.from}"/><stop offset="1" stop-color="${s.to}"/></linearGradient></defs><rect width="240" height="135" fill="url(#g)"/><circle cx="200" cy="34" r="18" fill="rgba(255,255,255,0.55)"/><rect x="24" y="86" width="110" height="10" rx="5" fill="rgba(255,255,255,0.6)"/><rect x="24" y="104" width="70" height="10" rx="5" fill="rgba(255,255,255,0.4)"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** 40+ languages; the wizard shows the top 8 as quick chips. */
const LANGUAGES: string[] = [
  'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Portuguese (BR)', 'Hindi', 'Japanese',
  'Arabic', 'Bengali', 'Chinese (Mandarin)', 'Czech', 'Danish', 'Dutch', 'Filipino', 'Finnish', 'Greek',
  'Hebrew', 'Hungarian', 'Indonesian', 'Italian', 'Korean', 'Malay', 'Norwegian', 'Polish', 'Romanian',
  'Russian', 'Serbian', 'Slovak', 'Somali', 'Swahili', 'Swedish', 'Thai', 'Turkish', 'Twi', 'Ukrainian',
  'Vietnamese', 'Yoruba', 'Zulu', 'Amharic', 'Catalan', 'Bulgarian', 'Croatian', 'Hausa',
]
const TOP_LANGUAGES = LANGUAGES.slice(0, 8)

interface Voice {
  id: string
  name: string
  descriptor: string
  gender: 'male' | 'female' | 'neutral'
}

const VOICES: Voice[] = [
  { id: 'marcus', name: 'Marcus', descriptor: 'Warm baritone', gender: 'male' },
  { id: 'diego', name: 'Diego', descriptor: 'Energetic tenor', gender: 'male' },
  { id: 'kenji', name: 'Kenji', descriptor: 'Calm, low register', gender: 'male' },
  { id: 'amara', name: 'Amara', descriptor: 'Bright mezzo', gender: 'female' },
  { id: 'sofia', name: 'Sofia', descriptor: 'Silky alto', gender: 'female' },
  { id: 'yuki', name: 'Yuki', descriptor: 'Airy soprano', gender: 'female' },
  { id: 'ash', name: 'Ash', descriptor: 'Neutral narrator', gender: 'neutral' },
  { id: 'riley', name: 'Riley', descriptor: 'Documentary read', gender: 'neutral' },
]

const PACES = [
  { value: 'cinematic', label: 'Cinematic (slow)' },
  { value: 'standard', label: 'Standard' },
  { value: 'brisk', label: 'Brisk' },
  { value: 'rapid', label: 'Rapid (social cut)' },
]

const WIZARD_STEPS = [
  { key: 'script', label: 'Script' },
  { key: 'cast', label: 'Characters & Cast' },
  { key: 'review', label: 'Review & Generate' },
]

interface CharacterDraft {
  name: string
  gender: string
  age: string
  ethnicity: string
  description: string
  portraitUrl: string | null
}

const EMPTY_CHARACTER: CharacterDraft = {
  name: '',
  gender: '',
  age: '',
  ethnicity: '',
  description: '',
  portraitUrl: null,
}

/* ------------------------------------------------------------------ */
/* StyleCardButton                                                    */
/* ------------------------------------------------------------------ */

const StyleCardButton: React.FC<{
  style: StyleCard
  selected: boolean
  onSelect: () => void
}> = ({ style, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      'group relative overflow-hidden rounded-control border bg-white text-left transition-all',
      selected
        ? 'border-yellow-9 ring-1 ring-yellow-9'
        : 'border-gray-a6 hover:border-gray-8',
    )}
  >
    <img
      src={styleThumb(style)}
      alt={`${style.name} style preview`}
      className="aspect-video w-full object-cover"
      loading="lazy"
    />
    <span className="block px-2.5 py-2 text-xs font-semibold text-gray-12">
      {style.name}
    </span>
    {selected ? (
      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-9 text-gray-1 shadow">
        <CheckIcon width={12} height={12} />
      </span>
    ) : null}
  </button>
)

/* ------------------------------------------------------------------ */
/* VoiceRow — voice option with play preview                          */
/* ------------------------------------------------------------------ */

const VoiceRow: React.FC<{
  voice: Voice
  selected: boolean
  playing: boolean
  onSelect: () => void
  onTogglePlay: () => void
}> = ({ voice, selected, playing, onSelect, onTogglePlay }) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-control border px-3 py-2 transition-colors',
      selected ? 'border-yellow-9 bg-yellow-1' : 'border-gray-a6 bg-white hover:bg-gray-1',
    )}
  >
    <button
      type="button"
      onClick={onTogglePlay}
      aria-label={`${playing ? 'Stop' : 'Preview'} ${voice.name} voice`}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
        playing ? 'bg-gray-12 text-gray-1' : 'bg-gray-2 text-gray-11 hover:bg-gray-3',
      )}
    >
      {playing ? <StopIcon width={12} height={12} /> : <PlayIcon width={12} height={12} />}
    </button>
    <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
      <p className="truncate text-sm font-medium text-gray-12">
        {voice.name}
        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-gray-9">
          {voice.gender}
        </span>
      </p>
      <p className="truncate text-xs text-gray-10">{voice.descriptor}</p>
    </button>
    {playing ? (
      <span className="flex items-end gap-0.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-0.5 animate-pulse rounded-full bg-yellow-9"
            style={{ height: 4 + ((i * 5) % 13), animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
    ) : selected ? (
      <CheckIcon width={15} height={15} className="shrink-0 text-yellow-11" />
    ) : null}
  </div>
)

/* ------------------------------------------------------------------ */
/* NewStory — 3-step script wizard                                    */
/* ------------------------------------------------------------------ */

const NewStory: React.FC = () => {
  useDocumentTitle('New Story | Atlabs AI')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const isBlank = searchParams.get('blank') === '1'
  const presetStyle = searchParams.get('style')

  const [step, setStep] = useState(0)
  const [script, setScript] = useState(
    isBlank
      ? ''
      : 'INT. Lighthouse — Night\n\nRain hammers the glass. ELIAS, 60s, winds the brass clock for the last time.',
  )
  const [style, setStyle] = useState<string>(() => {
    const match = STYLES.find((s) => s.id === presetStyle)
    return match ? match.id : 'realistic-drama'
  })
  const [language, setLanguage] = useState('English (US)')
  const [voice, setVoice] = useState('marcus')
  const [pace, setPace] = useState('cinematic')
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [characters, setCharacters] = useState<CharacterDraft[]>([])
  const [references, setReferences] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState<CharacterDraft>(EMPTY_CHARACTER)
  const [creating, setCreating] = useState(false)

  const words = useMemo(
    () => script.trim().split(/\s+/).filter(Boolean).length,
    [script],
  )
  const scenes = Math.max(1, Math.ceil(words / 120))
  const shots = scenes * 4
  const durationSeconds = Math.round(words / 2.4)
  const credits = Math.max(8, shots * 2)
  const canAdvance = words > 0 || isBlank

  const togglePlay = (id: string) => {
    setPlayingVoice((cur) => {
      if (cur === id) return null
      window.setTimeout(() => {
        setPlayingVoice((c) => (c === id ? null : c))
      }, 2200)
      return id
    })
  }

  const addCharacter = () => {
    if (!draft.name.trim()) {
      toast({ title: 'Name required', description: 'Give your character a name first.', variant: 'error' })
      return
    }
    setCharacters((prev) => [...prev, draft])
    setDraft(EMPTY_CHARACTER)
    setAddOpen(false)
    toast({ title: 'Character added', description: `${draft.name} joined the cast.`, variant: 'success' })
  }

  const generate = async () => {
    setCreating(true)
    try {
      const selectedStyle = STYLES.find((s) => s.id === style)
      const selectedVoice = VOICES.find((v) => v.id === voice)
      const selectedPace = PACES.find((p) => p.value === pace)
      const payload: CreateStoryPayload = {
        title: isBlank ? 'Blank story' : script.trim().split('\n')[0].slice(0, 60) || 'Untitled story',
        script,
        style: selectedStyle?.name ?? 'Realistic Drama',
        language,
        voice: selectedVoice ? `${selectedVoice.name} — ${selectedVoice.descriptor}` : 'Marcus',
        scene_pace: selectedPace?.label ?? 'Cinematic (slow)',
        characters: characters.map(({ portraitUrl: _portraitUrl, ...rest }) => rest),
        workflow_type: 'SCRIPT',
      }
      const story = await createStory(payload)
      toast({ title: 'Generation started', description: 'Your film is being produced.', variant: 'success' })
      navigate('/generating', { state: { storyId: story.id } })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Stepper */}
      <div className="flex items-center justify-between gap-3">
        <WizardStepper
          steps={WIZARD_STEPS}
          current={step}
          onStepSelect={(i) => setStep(i)}
        />
        <span className="hidden text-xs font-medium text-gray-10 md:block">
          Step {step + 1} of {WIZARD_STEPS.length}
        </span>
      </div>

      {/* ---------------- Step 1 — Script ---------------- */}
      {step === 0 ? (
        <section className="mt-5 flex flex-col gap-5" aria-label="Script">
          <div>
            <div className="flex items-end justify-between">
              <SectionLabel>Script</SectionLabel>
              <span className="text-xs tabular-nums text-gray-10" aria-live="polite">
                {words} word{words === 1 ? '' : 's'}
              </span>
            </div>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Paste your script here…"
              rows={7}
              aria-label="Script"
              className={cn(
                'mt-2 w-full resize-y rounded-card border border-gray-a6 bg-white p-4 text-sm leading-relaxed',
                'text-gray-12 placeholder:text-gray-9 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
            />
            {words === 0 ? (
              <p className="mt-1.5 text-xs text-gray-10">
                {isBlank
                  ? 'Blank story — you can write the script after generation.'
                  : 'Paste or write a script to enable generation.'}
              </p>
            ) : null}
          </div>

          <div>
            <SectionLabel>Style</SectionLabel>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {STYLES.map((s) => (
                <StyleCardButton
                  key={s.id}
                  style={s}
                  selected={style === s.id}
                  onSelect={() => setStyle(s.id)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <SectionLabel>Language</SectionLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOP_LANGUAGES.map((lang) => (
                  <Chip
                    key={lang}
                    label={lang}
                    selected={language === lang}
                    onClick={() => setLanguage(lang)}
                  />
                ))}
              </div>
              <PageSelect
                className="mt-3 w-full"
                ariaLabel="All languages"
                value={language}
                onValueChange={setLanguage}
                placeholder="Search all 40+ languages"
                options={LANGUAGES.map((l) => ({ value: l, label: l }))}
              />
            </div>
            <div>
              <SectionLabel>Voiceover</SectionLabel>
              <div className="mt-2 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {VOICES.map((v) => (
                  <VoiceRow
                    key={v.id}
                    voice={v}
                    selected={voice === v.id}
                    playing={playingVoice === v.id}
                    onSelect={() => setVoice(v.id)}
                    onTogglePlay={() => togglePlay(v.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="md:max-w-xs">
            <SectionLabel>Scene pace</SectionLabel>
            <PageSelect
              className="mt-2 w-full"
              ariaLabel="Scene pace"
              value={pace}
              onValueChange={setPace}
              options={PACES}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-a6 pt-4">
            <AtlabsButton
              variant="primary"
              size="md"
              className="text-xs font-semibold uppercase tracking-wide"
              disabled={!canAdvance}
              onClick={() => setStep(1)}
            >
              Continue
              <ChevronRightIcon width={14} height={14} />
            </AtlabsButton>
          </div>
        </section>
      ) : null}

      {/* ---------------- Step 2 — Characters & Cast ---------------- */}
      {step === 1 ? (
        <section className="mt-5 flex flex-col gap-5" aria-label="Characters and cast">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel>Characters & Cast</SectionLabel>
              <p className="mt-1 text-sm text-gray-10">
                {characters.length === 0
                  ? 'No characters yet — the director will cast from your script.'
                  : `${characters.length} character${characters.length === 1 ? '' : 's'} in the cast.`}
              </p>
            </div>
            <AtlabsButton
              variant="secondary"
              size="sm"
              className="text-xs font-semibold uppercase tracking-wide"
              onClick={() => setAddOpen(true)}
            >
              <PlusIcon width={13} height={13} />
              Add Character
            </AtlabsButton>
          </div>

          {characters.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {characters.map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  className="flex gap-3 rounded-card border border-gray-a6 bg-white p-3 shadow-sm"
                >
                  {c.portraitUrl ? (
                    <img
                      src={c.portraitUrl}
                      alt={`${c.name} portrait`}
                      className="h-14 w-14 shrink-0 rounded-control object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-control bg-gray-2 text-gray-9">
                      <PersonIcon width={20} height={20} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-12">{c.name}</p>
                    <p className="truncate text-xs text-gray-10">
                      {[c.gender, c.age, c.ethnicity].filter(Boolean).join(' · ') || 'Unspecified'}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-10">
                      {c.description || 'No description.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div>
            <SectionLabel>References</SectionLabel>
            <DropZone
              className="mt-2"
              multiple
              label="Upload reference images or documents"
              hint="PNG, JPG, PDF — style frames, locations, props"
              onFiles={(files) =>
                setReferences((prev) => [...prev, ...files.map((f) => f.name)])
              }
            />
            {references.length > 0 ? (
              <ul className="mt-2 flex max-h-32 flex-col gap-1 overflow-y-auto [scrollbar-width:thin]" aria-label="Uploaded references">
                {references.map((name, i) => (
                  <li
                    key={`${name}-${i}`}
                    className="flex items-center gap-2 rounded-control bg-gray-1 px-2.5 py-1.5 text-xs text-gray-11"
                  >
                    <FileTextIcon width={12} height={12} className="shrink-0 text-gray-9" />
                    <span className="truncate">{name}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-gray-a6 pt-4">
            <AtlabsButton
              variant="ghost"
              size="md"
              className="text-xs font-semibold uppercase tracking-wide"
              onClick={() => setStep(0)}
            >
              <ChevronLeftIcon width={14} height={14} />
              Back
            </AtlabsButton>
            <AtlabsButton
              variant="primary"
              size="md"
              className="text-xs font-semibold uppercase tracking-wide"
              onClick={() => setStep(2)}
            >
              Continue
              <ChevronRightIcon width={14} height={14} />
            </AtlabsButton>
          </div>
        </section>
      ) : null}

      {/* ---------------- Step 3 — Review & Generate ---------------- */}
      {step === 2 ? (
        <section className="mt-5 flex flex-col gap-5" aria-label="Review and generate">
          <div className="rounded-card border border-gray-a6 bg-white p-5 shadow-sm">
            <SectionLabel>Summary</SectionLabel>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-gray-9">Scenes (est.)</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-gray-12">{scenes}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-gray-9">Shots (est.)</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-gray-12">{shots}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-gray-9">Duration (est.)</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-gray-12">
                  {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-gray-9">Words</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-gray-12">{words}</dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-2 border-t border-gray-a6 pt-4 text-sm sm:grid-cols-2">
              <p className="text-gray-11">
                Style: <span className="font-medium text-gray-12">{STYLES.find((s) => s.id === style)?.name}</span>
              </p>
              <p className="text-gray-11">
                Language: <span className="font-medium text-gray-12">{language}</span>
              </p>
              <p className="text-gray-11">
                Voice: <span className="font-medium text-gray-12">{VOICES.find((v) => v.id === voice)?.name}</span>
              </p>
              <p className="text-gray-11">
                Pace: <span className="font-medium text-gray-12">{PACES.find((p) => p.value === pace)?.label}</span>
              </p>
              <p className="text-gray-11 sm:col-span-2">
                Cast: <span className="font-medium text-gray-12">{characters.map((c) => c.name).join(', ') || 'Auto-cast from script'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-card border border-yellow-4 bg-yellow-1 px-4 py-3">
            <div className="flex items-center gap-3">
              <IconBadge tone="yellow">
                <FileTextIcon width={15} height={15} />
              </IconBadge>
              <div>
                <p className="text-sm font-semibold text-gray-12">
                  Estimated cost: ~{credits} credits
                </p>
                <p className="text-xs text-gray-11">
                  Final cost depends on the shots the director keeps.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-gray-a6 pt-4">
            <AtlabsButton
              variant="ghost"
              size="md"
              className="text-xs font-semibold uppercase tracking-wide"
              onClick={() => setStep(1)}
            >
              <ChevronLeftIcon width={14} height={14} />
              Back
            </AtlabsButton>
            <AtlabsButton
              variant="primary"
              size="lg"
              className="text-xs font-bold uppercase tracking-wider"
              disabled={creating}
              onClick={generate}
            >
              {creating ? 'Starting…' : 'Generate Video'}
            </AtlabsButton>
          </div>
        </section>
      ) : null}

      {/* ---------------- Add Character modal ---------------- */}
      <Modal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Character"
        description="Define a character the director should respect when casting."
        footer={
          <div className="flex justify-end gap-2">
            <AtlabsButton variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </AtlabsButton>
            <AtlabsButton
              variant="primary"
              size="sm"
              className="font-semibold"
              onClick={addCharacter}
            >
              Add to Cast
            </AtlabsButton>
          </div>
        }
      >
        <div className="grid gap-4">
          <Field label="Name" htmlFor="char-name">
            <input
              id="char-name"
              className={textInputClass}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Elias"
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Gender" htmlFor="char-gender">
              <input
                id="char-gender"
                className={textInputClass}
                value={draft.gender}
                onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                placeholder="Any"
              />
            </Field>
            <Field label="Age" htmlFor="char-age">
              <input
                id="char-age"
                className={textInputClass}
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                placeholder="e.g. 60s"
              />
            </Field>
            <Field label="Ethnicity" htmlFor="char-ethnicity">
              <input
                id="char-ethnicity"
                className={textInputClass}
                value={draft.ethnicity}
                onChange={(e) => setDraft({ ...draft, ethnicity: e.target.value })}
                placeholder="Any"
              />
            </Field>
          </div>
          <Field label="Description" htmlFor="char-desc">
            <textarea
              id="char-desc"
              rows={3}
              className="w-full resize-y rounded-control border border-gray-a6 bg-white p-3 text-sm text-gray-12 placeholder:text-gray-9 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Weathered keeper, quiet voice, wind-burned face…"
            />
          </Field>
          <Field label="Portrait" hint="Optional — square images work best.">
            <DropZone
              className="py-5"
              accept="image/png,image/jpeg,image/webp"
              label={draft.portraitUrl ? 'Replace portrait' : 'Drop a portrait or click to upload'}
              onFiles={(files) => {
                const file = files[0]
                if (file) setDraft({ ...draft, portraitUrl: URL.createObjectURL(file) })
              }}
            />
            {draft.portraitUrl ? (
              <img
                src={draft.portraitUrl}
                alt="Portrait preview"
                className="mt-2 h-16 w-16 rounded-control object-cover"
              />
            ) : null}
          </Field>
        </div>
      </Modal>
    </div>
  )
}

export default NewStory
