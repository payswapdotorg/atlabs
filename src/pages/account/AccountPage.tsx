import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExclamationTriangleIcon, PersonIcon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Modal from '../../components/Modal'
import Skeleton from '../../components/Skeleton'
import { useToast } from '../../components/Toast'
import { usePageHeader } from '../../AppShell'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useAuth } from '../../lib/auth'
import { PageSelect, Field, textInputClass, SectionLabel } from '../app/_shared'
import {
  getAccountProfile,
  updateAccountProfile,
} from '../../lib/api/commerce'
import type { AccountProfile, AccountProfileUpdate } from '../../lib/api/commerce'

/* ------------------------------------------------------------------ */
/* Toggle — small switch for notification preferences                 */
/* (no Radix Switch dep in this scaffold; a role="switch" button keeps */
/* keyboard + a11y behavior without adding packages)                  */
/* ------------------------------------------------------------------ */

const Toggle: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 rounded-card border border-gray-a6 bg-white px-4 py-3">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-12">{label}</p>
      <p className="mt-0.5 text-xs text-gray-10">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
        (checked ? 'bg-yellow-9' : 'bg-gray-4')
      }
    >
      <span
        aria-hidden
        className={
          'inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ' +
          (checked ? 'translate-x-[22px]' : 'translate-x-[3px]')
        }
      />
    </button>
  </div>
)

/* ------------------------------------------------------------------ */
/* Select options                                                     */
/* ------------------------------------------------------------------ */

const DIAL_CODES = [
  { value: '+1', label: '+1 (US/CA)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+233', label: '+233 (Ghana)' },
  { value: '+234', label: '+234 (Nigeria)' },
  { value: '+254', label: '+254 (Kenya)' },
  { value: '+27', label: '+27 (South Africa)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+55', label: '+55 (Brazil)' },
]

const HEAR_ABOUT_US = [
  { value: 'google_search', label: 'Google search' },
  { value: 'social_media', label: 'Social media' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'friend_colleague', label: 'Friend or colleague' },
  { value: 'product_hunt', label: 'Product Hunt' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'other', label: 'Other' },
]

/* ------------------------------------------------------------------ */
/* AccountPage                                                        */
/* ------------------------------------------------------------------ */

const AccountPage: React.FC = () => {
  useDocumentTitle('Account | Atlabs AI')
  const { setActions } = usePageHeader()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [form, setForm] = useState<AccountProfileUpdate>({})
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Latest save routine, callable from the top-bar action without
  // re-registering it on every keystroke.
  const saveRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    let cancelled = false
    void getAccountProfile().then((p) => {
      if (cancelled) return
      setProfile(p)
      setForm({
        first_name: p.first_name,
        last_name: p.last_name,
        company: p.company,
        phone: p.phone,
        dial_code: p.dial_code,
        how_did_you_hear_about_us: p.how_did_you_hear_about_us,
        referred_by_name: p.referred_by_name,
        notification_preferences: { ...p.notification_preferences },
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setActions(
      <AtlabsButton
        size="sm"
        className="font-semibold uppercase tracking-wide"
        onClick={() => saveRef.current()}
      >
        Save
      </AtlabsButton>,
    )
    return () => setActions(null)
  }, [setActions])

  const set = useCallback((patch: Partial<AccountProfileUpdate>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }, [])

  const save = useCallback(() => {
    if (saving) return
    setSaving(true)
    void updateAccountProfile(form)
      .then((p) => {
        setProfile(p)
        setForm({
          first_name: p.first_name,
          last_name: p.last_name,
          company: p.company,
          phone: p.phone,
          dial_code: p.dial_code,
          how_did_you_hear_about_us: p.how_did_you_hear_about_us,
          referred_by_name: p.referred_by_name,
          notification_preferences: { ...p.notification_preferences },
        })
        toast({
          title: 'Profile saved',
          description: 'Your account details were updated (fixture).',
          variant: 'success',
        })
      })
      .catch(() => {
        toast({
          title: 'Save failed',
          description: 'The fixture profile update could not complete. Please try again.',
          variant: 'error',
        })
      })
      .finally(() => setSaving(false))
  }, [form, saving, toast])

  saveRef.current = save

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  const handleDeleteAccount = useCallback(() => {
    setDeleteOpen(false)
    toast({
      title: 'Account deletion requested',
      description:
        'This is a fixture — no data was deleted. In production this triggers a removal flow.',
      variant: 'default',
    })
    logout()
    navigate('/login')
  }, [logout, navigate, toast])

  if (profile === null) {
    return (
      <div className="mx-auto max-w-2xl" aria-busy="true">
        <Skeleton className="h-7 w-40" />
        <div className="mt-6 rounded-card border border-gray-a6 bg-white p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-9 w-full" />
          <Skeleton className="mt-4 h-4 w-24" />
          <Skeleton className="mt-4 h-9 w-full" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-gray-12">Account</h2>
        <p className="mt-1 text-sm text-gray-11">
          Manage your profile and notification preferences.
        </p>
      </header>

      {/* Profile form */}
      <section
        className="rounded-card border border-gray-a6 bg-white p-6 shadow-sm"
        aria-label="Profile"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-12 text-sm font-semibold text-gray-1"
          >
            {(profile.name || profile.email).trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-12">{profile.name}</p>
            <p className="truncate text-xs text-gray-10">{profile.email}</p>
          </div>
          <span className="ml-auto rounded-full border border-gray-a6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-10">
            {profile.is_premium ? 'Premium' : 'Free plan'}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="account-first-name">
            <input
              id="account-first-name"
              type="text"
              value={form.first_name ?? ''}
              onChange={(e) => set({ first_name: e.target.value })}
              className={textInputClass}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Last name" htmlFor="account-last-name">
            <input
              id="account-last-name"
              type="text"
              value={form.last_name ?? ''}
              onChange={(e) => set({ last_name: e.target.value })}
              className={textInputClass}
              autoComplete="family-name"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Company" htmlFor="account-company">
            <input
              id="account-company"
              type="text"
              value={form.company ?? ''}
              onChange={(e) => set({ company: e.target.value })}
              className={textInputClass}
              autoComplete="organization"
            />
          </Field>
        </div>

        <div className="mt-4">
          <SectionLabel className="mb-1.5">Phone</SectionLabel>
          <div className="flex items-center gap-2">
            <PageSelect
              value={form.dial_code ?? '+1'}
              onValueChange={(v) => set({ dial_code: v })}
              options={DIAL_CODES}
              ariaLabel="Dial code"
              className="w-40 shrink-0"
            />
            <label htmlFor="account-phone" className="sr-only">
              Phone number
            </label>
            <input
              id="account-phone"
              type="tel"
              value={form.phone ?? ''}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="555 010 2030"
              className={textInputClass}
              autoComplete="tel-national"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="How did you hear about us?" htmlFor="account-hear">
            <PageSelect
              value={form.how_did_you_hear_about_us ?? ''}
              onValueChange={(v) => set({ how_did_you_hear_about_us: v })}
              options={HEAR_ABOUT_US}
              placeholder="Select…"
              ariaLabel="How did you hear about us"
              className="w-full"
            />
          </Field>
          <Field label="Referred by (name)" htmlFor="account-referred-by">
            <input
              id="account-referred-by"
              type="text"
              value={form.referred_by_name ?? ''}
              onChange={(e) => set({ referred_by_name: e.target.value })}
              placeholder="Who referred you?"
              className={textInputClass}
            />
          </Field>
        </div>

        {/* Visible save row — the top-bar SAVE action calls the same routine. */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <AtlabsButton
            onClick={save}
            disabled={saving}
            aria-busy={saving}
            className="font-semibold uppercase tracking-wide"
          >
            {saving ? 'Saving…' : 'Save'}
          </AtlabsButton>
        </div>
      </section>

      {/* Notification preferences */}
      <section className="mt-6" aria-label="Notification preferences">
        <h3 className="text-sm font-semibold text-gray-12">Notifications</h3>
        <div className="mt-3 flex flex-col gap-2">
          <Toggle
            label="Product updates"
            description="Receive updates about new features and workflows."
            checked={form.notification_preferences?.receive_updates ?? false}
            onChange={(checked) =>
              set({
                notification_preferences: {
                  receive_updates: checked,
                  email_on_video_export:
                    form.notification_preferences?.email_on_video_export ?? false,
                },
              })
            }
          />
          <Toggle
            label="Email on video export"
            description="Send me an email whenever a video export finishes."
            checked={form.notification_preferences?.email_on_video_export ?? false}
            onChange={(checked) =>
              set({
                notification_preferences: {
                  receive_updates: form.notification_preferences?.receive_updates ?? false,
                  email_on_video_export: checked,
                },
              })
            }
          />
        </div>
      </section>

      {/* Danger zone */}
      <section
        className="mt-8 rounded-card border border-red-200 bg-red-50/40 p-6"
        aria-label="Danger zone"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-red-700">
          <ExclamationTriangleIcon width={15} height={15} />
          Danger zone
        </h3>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gray-a6 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-12">Log out</p>
              <p className="text-xs text-gray-10">
                Signed in as {user?.email ?? profile.email}
              </p>
            </div>
            <AtlabsButton variant="secondary" size="sm" onClick={handleLogout}>
              Log out
            </AtlabsButton>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-red-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-12">Delete account</p>
              <p className="text-xs text-gray-10">
                Permanently remove your account and all stories (fixture).
              </p>
            </div>
            <AtlabsButton
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              Delete account
            </AtlabsButton>
          </div>
        </div>
      </section>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete your account?"
        description="This removes your profile and every story permanently. This cannot be undone."
        footer={
          <>
            <AtlabsButton variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </AtlabsButton>
            <AtlabsButton variant="destructive" onClick={handleDeleteAccount}>
              Yes, delete account
            </AtlabsButton>
          </>
        }
      >
        <p className="flex items-start gap-2 text-sm">
          <PersonIcon width={15} height={15} className="mt-0.5 shrink-0 text-gray-10" />
          <span>
            You will be signed out immediately. This demo runs on fixtures, so
            nothing is actually deleted.
          </span>
        </p>
      </Modal>
    </div>
  )
}

export default AccountPage
