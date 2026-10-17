import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AtlabsButton } from '../../components/AtlabsButton'
import Skeleton from '../../components/Skeleton'
import { useToast } from '../../components/Toast'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { WizardStepper, PageSelect, Field, textInputClass } from '../app/_shared'
import { getAccountProfile, saveOnboardingPreferences } from '../../lib/api/commerce'
import type { AccountProfile, OnboardingPreferencesPayload } from '../../lib/api/commerce'

/* ------------------------------------------------------------------ */
/* Options                                                            */
/* ------------------------------------------------------------------ */

const IMAGE_MODELS = [
  { value: 'MagicX', label: 'MagicX — default, best all-rounder' },
  { value: 'Flux', label: 'Flux — photoreal detail' },
  { value: 'SDXL', label: 'SDXL — broad style control' },
]

const SCENE_PACES = [
  { value: 'Cinematic (slow)', label: 'Cinematic (slow) — filmic pacing' },
  { value: 'Balanced', label: 'Balanced — steady defaults' },
  { value: 'Fast', label: 'Fast — snappy social cuts' },
]

const STEPS = [
  { key: 'profile', label: 'Profile' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'done', label: 'Done' },
]

/* ------------------------------------------------------------------ */
/* OnboardingPage                                                     */
/* ------------------------------------------------------------------ */

const OnboardingPage: React.FC = () => {
  useDocumentTitle('Onboarding | Atlabs AI')
  const { toast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [payload, setPayload] = useState<OnboardingPreferencesPayload>({
    first_name: '',
    last_name: '',
    company: '',
    default_image_model: 'MagicX',
    scene_pace_preference: 'Balanced',
    notification_preferences: {
      receive_updates: true,
      email_on_video_export: false,
    },
  })

  useEffect(() => {
    let cancelled = false
    void getAccountProfile().then((p: AccountProfile) => {
      if (cancelled) return
      setPayload({
        first_name: p.first_name,
        last_name: p.last_name,
        company: p.company,
        default_image_model: p.default_image_model || 'MagicX',
        scene_pace_preference: p.scene_pace_preference || 'Balanced',
        notification_preferences: { ...p.notification_preferences },
      })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const set = useCallback((patch: Partial<OnboardingPreferencesPayload>) => {
    setPayload((prev) => ({ ...prev, ...patch }))
  }, [])

  const setNotification = useCallback(
    (key: 'receive_updates' | 'email_on_video_export', checked: boolean) => {
      setPayload((prev) => ({
        ...prev,
        notification_preferences: {
          receive_updates: prev.notification_preferences?.receive_updates ?? false,
          email_on_video_export: prev.notification_preferences?.email_on_video_export ?? false,
          [key]: checked,
        },
      }))
    },
    [],
  )

  const finish = useCallback(() => {
    if (saving) return
    setSaving(true)
    void saveOnboardingPreferences(payload)
      .then(() => {
        toast({
          title: "You're all set!",
          description: 'Preferences saved — welcome to Atlabs (fixture).',
          variant: 'success',
        })
        navigate('/app')
      })
      .catch(() => {
        setSaving(false)
        toast({
          title: 'Could not save preferences',
          description: 'The fixture save failed. Please try again.',
          variant: 'error',
        })
      })
  }, [navigate, payload, saving, toast])

  const stepName = useMemo(() => STEPS[step]?.label ?? '', [step])

  if (loading) {
    return (
      <div className="mx-auto max-w-xl" aria-busy="true">
        <Skeleton className="h-6 w-40" />
        <div className="mt-6 rounded-card border border-gray-a6 bg-white p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-9 w-full" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-10">
          Step {step + 1} of {STEPS.length} — {stepName}
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-12">
          Welcome to Atlabs
        </h2>
        <p className="mt-1 text-sm text-gray-11">
          A couple of quick questions so your workspace fits how you create.
        </p>
        <div className="mt-4">
          <WizardStepper steps={STEPS} current={step} />
        </div>
      </header>

      {/* Step 1 — profile */}
      {step === 0 ? (
        <section
          className="rounded-card border border-gray-a6 bg-white p-6 shadow-sm"
          aria-label="Profile step"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="onboarding-first-name">
              <input
                id="onboarding-first-name"
                type="text"
                value={payload.first_name ?? ''}
                onChange={(e) => set({ first_name: e.target.value })}
                className={textInputClass}
                autoComplete="given-name"
              />
            </Field>
            <Field label="Last name" htmlFor="onboarding-last-name">
              <input
                id="onboarding-last-name"
                type="text"
                value={payload.last_name ?? ''}
                onChange={(e) => set({ last_name: e.target.value })}
                className={textInputClass}
                autoComplete="family-name"
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field
              label="Company (optional)"
              htmlFor="onboarding-company"
              hint="Used to brand exports and team stories."
            >
              <input
                id="onboarding-company"
                type="text"
                value={payload.company ?? ''}
                onChange={(e) => set({ company: e.target.value })}
                className={textInputClass}
                autoComplete="organization"
              />
            </Field>
          </div>
        </section>
      ) : null}

      {/* Step 2 — preferences */}
      {step === 1 ? (
        <section
          className="flex flex-col gap-4 rounded-card border border-gray-a6 bg-white p-6 shadow-sm"
          aria-label="Preferences step"
        >
          <Field
            label="Default image model"
            htmlFor="onboarding-image-model"
            hint="Applied to every new story — you can change it per story later."
          >
            <PageSelect
              value={payload.default_image_model ?? 'MagicX'}
              onValueChange={(v) => set({ default_image_model: v })}
              options={IMAGE_MODELS}
              ariaLabel="Default image model"
              className="w-full"
            />
          </Field>

          <Field
            label="Scene pace preference"
            htmlFor="onboarding-scene-pace"
            hint="How quickly your videos move from scene to scene."
          >
            <PageSelect
              value={payload.scene_pace_preference ?? 'Balanced'}
              onValueChange={(v) => set({ scene_pace_preference: v })}
              options={SCENE_PACES}
              ariaLabel="Scene pace preference"
              className="w-full"
            />
          </Field>

          <fieldset className="mt-1">
            <legend className="text-xs font-semibold text-gray-11">
              Notification preferences
            </legend>
            <div className="mt-2 flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-card border border-gray-a6 px-4 py-3 text-sm text-gray-12 hover:bg-gray-1">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-9"
                  checked={payload.notification_preferences?.receive_updates ?? false}
                  onChange={(e) => setNotification('receive_updates', e.target.checked)}
                />
                Product updates — new features and workflows
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-card border border-gray-a6 px-4 py-3 text-sm text-gray-12 hover:bg-gray-1">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-9"
                  checked={payload.notification_preferences?.email_on_video_export ?? false}
                  onChange={(e) => setNotification('email_on_video_export', e.target.checked)}
                />
                Email me when a video export finishes
              </label>
            </div>
          </fieldset>
        </section>
      ) : null}

      {/* Step 3 — done / confirm */}
      {step === 2 ? (
        <section
          className="rounded-card border border-gray-a6 bg-white p-6 shadow-sm"
          aria-label="Confirmation step"
        >
          <h3 className="text-sm font-semibold text-gray-12">
            Everything looks good?
          </h3>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            {[
              ['Name', `${payload.first_name ?? ''} ${payload.last_name ?? ''}`.trim() || '—'],
              ['Company', payload.company?.trim() || '—'],
              ['Default image model', payload.default_image_model ?? 'MagicX'],
              ['Scene pace', payload.scene_pace_preference ?? 'Balanced'],
              [
                'Product updates',
                payload.notification_preferences?.receive_updates ? 'On' : 'Off',
              ],
              [
                'Email on export',
                payload.notification_preferences?.email_on_video_export ? 'On' : 'Off',
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 rounded-control bg-gray-1 px-3.5 py-2.5"
              >
                <dt className="text-gray-11">{label}</dt>
                <dd className="font-medium text-gray-12">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-gray-10">
            Saving takes you straight to your workspace — you can change any of
            this later in Account.
          </p>
        </section>
      ) : null}

      {/* Footer nav */}
      <div className="mt-6 flex items-center justify-between">
        <AtlabsButton
          variant="secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || saving}
        >
          Back
        </AtlabsButton>
        {step < STEPS.length - 1 ? (
          <AtlabsButton
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="font-semibold uppercase tracking-wide"
          >
            Next
          </AtlabsButton>
        ) : (
          <AtlabsButton
            onClick={finish}
            disabled={saving}
            aria-busy={saving}
            className="font-semibold uppercase tracking-wide"
          >
            {saving ? 'Saving…' : 'Finish'}
          </AtlabsButton>
        )}
      </div>
    </div>
  )
}

export default OnboardingPage
