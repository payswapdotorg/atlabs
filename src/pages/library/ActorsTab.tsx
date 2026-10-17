import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/Pagination'
import Skeleton from '../../components/Skeleton'

import { useToast } from '../../components/Toast'
import { usePageHeader } from '../../AppShell'
import {
  createCharacter,
  getCharacter,
  getCharacters,
} from '../../lib/api/library'
import type {
  Character,
  CharacterDetail,
  CreateCharacterPayload,
} from '../../lib/api/library'
import { PageSelect, DropZone, Field, textInputClass } from '../app/_shared'
import { FixtureImage, SourceBadge } from './_shared'

/* ------------------------------------------------------------------ */
/* Filter option sets (labels embed the field name, per live capture) */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 12

const AGE_BUCKETS = ['18-24', '25-34', '35-44', '45-54', '55+']

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Category : All' },
  { value: 'ACTOR', label: 'Category : Actor' },
  { value: 'NARRATOR', label: 'Category : Narrator' },
  { value: 'EXTRA', label: 'Category : Extra' },
]

const SOURCE_OPTIONS = [
  { value: 'ALL', label: 'Source : All' },
  { value: 'SYSTEM', label: 'Source : System' },
  { value: 'USER', label: 'Source : User' },
]

const AGE_OPTIONS = [
  { value: 'ALL', label: 'Age : All' },
  ...AGE_BUCKETS.map((a) => ({ value: a, label: `Age : ${a}` })),
]

const GENDER_OPTIONS = [
  { value: 'ALL', label: 'Gender : All' },
  { value: 'Female', label: 'Gender : Female' },
  { value: 'Male', label: 'Gender : Male' },
  { value: 'Non-binary', label: 'Gender : Non-binary' },
]

const ETHNICITY_VALUES = [
  'Indian',
  'South Asian',
  'Southeast Asian',
  'East Asian',
  'Middle Eastern',
  'Hispanic/Latino',
  'Caucasian',
  'Black',
  'Mixed',
]

const ETHNICITY_OPTIONS = [
  { value: 'ALL', label: 'Ethnicity : All' },
  ...ETHNICITY_VALUES.map((e) => ({ value: e, label: `Ethnicity : ${e}` })),
]

interface ActorFilters {
  category: string
  source: string
  age: string
  gender: string
  ethnicity: string
}

const DEFAULT_FILTERS: ActorFilters = {
  category: 'ALL',
  source: 'ALL',
  age: 'ALL',
  gender: 'ALL',
  ethnicity: 'ALL',
}

/* ------------------------------------------------------------------ */
/* ActorCard                                                          */
/* ------------------------------------------------------------------ */

const ActorCard: React.FC<{
  character: Character
  onOpen: () => void
}> = ({ character, onOpen }) => (
  <article className="group overflow-hidden rounded-card border border-gray-a6 bg-white shadow-sm transition-shadow hover:shadow-md">
    <button
      type="button"
      onClick={onOpen}
      className="relative block aspect-[4/5] w-full overflow-hidden bg-gray-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`View ${character.name}`}
    >
      <FixtureImage
        src={character.portrait_url}
        seed={character.name}
        alt={character.name}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      />
      {character.source === 'USER' ? (
        <span className="absolute left-2 top-2">
          <SourceBadge source={character.source} />
        </span>
      ) : null}
    </button>
    <div className="p-3">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <h3 className="truncate text-sm font-semibold text-gray-12">
          {character.name}
        </h3>
      </button>
      <p className="mt-0.5 truncate text-xs text-gray-10">
        {character.gender} · {character.age} · {character.ethnicity}
      </p>
    </div>
  </article>
)

/* ------------------------------------------------------------------ */
/* ActorDetailModal                                                   */
/* ------------------------------------------------------------------ */

const ActorDetailModal: React.FC<{
  character: Character | null
  onOpenChange: (open: boolean) => void
}> = ({ character, onOpenChange }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [detail, setDetail] = useState<CharacterDetail | null>(null)

  useEffect(() => {
    setDetail(null)
    if (!character) return
    let cancelled = false
    getCharacter(character.id).then((d) => {
      if (!cancelled) setDetail(d)
    })
    return () => {
      cancelled = true
    }
  }, [character])

  const useInStory = () => {
    if (!character) return
    onOpenChange(false)
    toast({
      title: 'Character ready in the story wizard',
      description: `${character.name} was attached as a cast member.`,
      variant: 'success',
    })
    navigate(`/new-story?actor=${encodeURIComponent(character.name)}`)
  }

  return (
    <Modal
      open={character !== null}
      onOpenChange={onOpenChange}
      title={character?.name ?? 'Actor'}
      description={detail?.description ?? 'Loading actor profile…'}
      className="max-w-2xl"
      footer={
        <>
          <AtlabsButton variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </AtlabsButton>
          <AtlabsButton variant="primary" onClick={useInStory} disabled={!character}>
            Use in Story
          </AtlabsButton>
        </>
      }
    >
      {character ? (
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="sm:w-48 sm:shrink-0">
            <div className="overflow-hidden rounded-card border border-gray-a6 bg-gray-2">
              <FixtureImage
                src={character.portrait_url}
                seed={character.name}
                alt={character.name}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-9">Gender</dt>
                <dd className="mt-0.5 text-gray-12">{character.gender}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-9">Age</dt>
                <dd className="mt-0.5 text-gray-12">{character.age}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-9">Ethnicity</dt>
                <dd className="mt-0.5 text-gray-12">{character.ethnicity}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-9">Role</dt>
                <dd className="mt-0.5 text-gray-12">
                  {detail ? detail.role.charAt(0) + detail.role.slice(1).toLowerCase() : '…'}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center gap-2">
              <SourceBadge source={character.source} />
              <span className="text-xs text-gray-10">
                Portrait: {character.portrait_media.media_type}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* AddCharacterModal                                                  */
/* ------------------------------------------------------------------ */

const AddCharacterModal: React.FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}> = ({ open, onOpenChange, onCreated }) => {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [gender, setGender] = useState('Female')
  const [age, setAge] = useState('25-34')
  const [ethnicity, setEthnicity] = useState('Indian')
  const [description, setDescription] = useState('')
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setGender('Female')
      setAge('25-34')
      setEthnicity('Indian')
      setDescription('')
      setPortraitUrl(null)
      setSaving(false)
      setError(null)
    }
  }, [open])

  const submit = async () => {
    if (!name.trim()) {
      setError('Give your character a name first.')
      return
    }
    setSaving(true)
    setError(null)
    const payload: CreateCharacterPayload = {
      name: name.trim(),
      gender,
      age,
      ethnicity,
      description: description.trim() || undefined,
      portrait_url: portraitUrl ?? undefined,
    }
    const created = await createCharacter(payload)
    setSaving(false)
    onOpenChange(false)
    toast({
      title: 'Character added to your library',
      description: `${created.name} is available across the actor library (source: User).`,
      variant: 'success',
    })
    onCreated()
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Character"
      description="Create a reusable actor that shows up in the Library and story wizard."
      className="max-w-xl"
      footer={
        <>
          <AtlabsButton variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </AtlabsButton>
          <AtlabsButton variant="primary" onClick={submit} disabled={saving}>
            {saving ? 'Adding…' : 'Add Character'}
          </AtlabsButton>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Name" htmlFor="add-character-name">
          <input
            id="add-character-name"
            type="text"
            className={textInputClass}
            placeholder="e.g. Ayesha Kulkarni"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Gender">
            <PageSelect
              ariaLabel="Gender"
              value={gender}
              onValueChange={setGender}
              options={[
                { value: 'Female', label: 'Female' },
                { value: 'Male', label: 'Male' },
                { value: 'Non-binary', label: 'Non-binary' },
              ]}
            />
          </Field>
          <Field label="Age">
            <PageSelect
              ariaLabel="Age"
              value={age}
              onValueChange={setAge}
              options={AGE_BUCKETS.map((a) => ({ value: a, label: a }))}
            />
          </Field>
          <Field label="Ethnicity">
            <PageSelect
              ariaLabel="Ethnicity"
              value={ethnicity}
              onValueChange={setEthnicity}
              options={ETHNICITY_VALUES.map((e) => ({ value: e, label: e }))}
            />
          </Field>
        </div>

        <Field label="Description" hint="Personality notes used when casting scenes.">
          <textarea
            className="min-h-[76px] w-full rounded-control border border-gray-a6 bg-white px-3 py-2 text-sm text-gray-12 placeholder:text-gray-9 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Warm narrator energy, documentary register…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="Portrait" hint="PNG or JPG — leave empty to auto-generate one.">
          {portraitUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={portraitUrl}
                alt="Portrait preview"
                className="h-20 w-16 rounded-control border border-gray-a6 object-cover"
              />
              <AtlabsButton variant="secondary" size="sm" onClick={() => setPortraitUrl(null)}>
                Remove
              </AtlabsButton>
            </div>
          ) : (
            <DropZone
              label="Upload portrait"
              hint="Drag & drop or click"
              accept="image/*"
              onFiles={(files) => {
                if (files[0]) setPortraitUrl(URL.createObjectURL(files[0]))
              }}
            />
          )}
        </Field>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* ActorsTab                                                          */
/* ------------------------------------------------------------------ */

const ActorsTab: React.FC = () => {
  const { setActions } = usePageHeader()
  const [filters, setFilters] = useState<ActorFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ count: number; results: Character[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Character | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [reloadNonce, setReloadNonce] = useState(0)

  // "Add Character" lives in the shell header while the actors tab is active.
  useEffect(() => {
    setActions(
      <AtlabsButton variant="primary" size="sm" onClick={() => setAddOpen(true)}>
        <PlusIcon width={14} height={14} />
        Add Character
      </AtlabsButton>,
    )
    return () => setActions(null)
  }, [setActions])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCharacters({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      role: filters.category,
      source: filters.source,
      age: filters.age,
      gender: filters.gender,
      ethnicity: filters.ethnicity,
    }).then((res) => {
      if (cancelled) return
      setData({ count: res.count, results: res.results })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [filters, page, reloadNonce])

  const updateFilter = useCallback(
    (key: keyof ActorFilters) => (value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
      setPage(1)
    },
    [],
  )

  const onCreated = () => {
    setPage(1)
    setFilters((prev) => ({ ...prev, source: 'ALL' }))
    setReloadNonce((n) => n + 1)
  }

  const cards = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-card border border-gray-a6 bg-white"
            >
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
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
        <EmptyState
          title="No actors match these filters"
          description="Try clearing a filter, or add your own character to the library."
          action={
            <AtlabsButton
              variant="secondary"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Clear filters
            </AtlabsButton>
          }
        />
      )
    }
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {data.results.map((c) => (
          <ActorCard
            key={c.id}
            character={c}
            onOpen={() => setSelected(c)}
          />
        ))}
      </div>
    )
  }, [loading, data])

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 py-4">
        <PageSelect
          ariaLabel="Category filter"
          value={filters.category}
          onValueChange={updateFilter('category')}
          options={CATEGORY_OPTIONS}
        />
        <PageSelect
          ariaLabel="Source filter"
          value={filters.source}
          onValueChange={updateFilter('source')}
          options={SOURCE_OPTIONS}
        />
        <PageSelect
          ariaLabel="Age filter"
          value={filters.age}
          onValueChange={updateFilter('age')}
          options={AGE_OPTIONS}
        />
        <PageSelect
          ariaLabel="Gender filter"
          value={filters.gender}
          onValueChange={updateFilter('gender')}
          options={GENDER_OPTIONS}
        />
        <PageSelect
          ariaLabel="Ethnicity filter"
          value={filters.ethnicity}
          onValueChange={updateFilter('ethnicity')}
          options={ETHNICITY_OPTIONS}
          className="min-w-[11rem]"
        />
      </div>

      {cards}

      {data ? (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={data.count}
          onPageChange={setPage}
        />
      ) : null}

      <ActorDetailModal
        character={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />

      <AddCharacterModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={onCreated}
      />
    </div>
  )
}

export default ActorsTab
