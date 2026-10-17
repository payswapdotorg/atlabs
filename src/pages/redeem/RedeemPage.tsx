import React, { useCallback, useEffect, useState } from 'react'
import { SymbolIcon } from '@radix-ui/react-icons'
import AtlabsButton from '../../components/AtlabsButton'
import Callout from '../../components/Callout'
import IconBadge from '../../components/IconBadge'
import { usePageHeader } from '../../AppShell'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { redeemCode } from '../../lib/api/commerce'
import type { RedeemResult } from '../../lib/api/commerce'
import { useToast } from '../../components/Toast'

/* ------------------------------------------------------------------ */
/* RedeemPage                                                         */
/* ------------------------------------------------------------------ */

const RedeemPage: React.FC = () => {
  useDocumentTitle('Redeem | Atlabs AI')
  const { setActions } = usePageHeader()
  const { toast } = useToast()

  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<RedeemResult | null>(null)

  useEffect(() => {
    setActions(null)
    return () => setActions(null)
  }, [setActions])

  const submit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = code.trim()
      if (!trimmed || submitting) return
      setSubmitting(true)
      setResult(null)
      void redeemCode(trimmed)
        .then((res) => {
          setResult(res)
          if (res.ok) {
            toast({
              title: 'Code redeemed',
              description: res.message,
              variant: 'success',
            })
            setCode('')
          } else {
            toast({ title: 'Redeem failed', description: res.message, variant: 'error' })
          }
        })
        .finally(() => setSubmitting(false))
    },
    [code, submitting, toast],
  )

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-gray-12">Redeem a code</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-11">
          Have a promo or gift code? Redeem it here to top up your credit
          balance instantly.
        </p>
      </header>

      <section
        className="rounded-card border border-gray-a6 bg-white p-6 shadow-sm"
        aria-label="Redeem code form"
      >
        <div className="flex items-center gap-3">
          <IconBadge tone="yellow">
            <SymbolIcon width={16} height={16} />
          </IconBadge>
          <h3 className="text-sm font-semibold text-gray-12">Promo / gift code</h3>
        </div>

        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="redeem-code" className="sr-only">
            Redemption code
          </label>
          <input
            id="redeem-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. ATLABS-WELCOME"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-10 flex-1 rounded-control border border-gray-a6 bg-white px-3 text-sm uppercase tracking-wide text-gray-12 placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-9 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <AtlabsButton
            type="submit"
            className="h-10 font-semibold uppercase tracking-wide"
            disabled={!code.trim() || submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Redeeming…' : 'Redeem'}
          </AtlabsButton>
        </form>

        {result !== null ? (
          result.ok ? (
            <div className="mt-4">
              <Callout variant="success" title="Code redeemed">
                {result.message} You now have {result.credits_granted} additional credits
                in your balance.
              </Callout>
            </div>
          ) : (
            <div className="mt-4">
              <Callout variant="error" title="Could not redeem this code">
                {result.message}
              </Callout>
            </div>
          )
        ) : null}
      </section>

      <div className="mt-4">
        <Callout variant="info" title="Demo fixture code">
          This build runs on fixtures — use code{' '}
          <code className="rounded bg-gray-3 px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-12">
            ATLABS-WELCOME
          </code>{' '}
          to add 10 credits (once per browser).
        </Callout>
      </div>
    </div>
  )
}

export default RedeemPage
