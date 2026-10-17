import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AtlabsButton from '../../components/AtlabsButton'
import Callout from '../../components/Callout'
import Skeleton from '../../components/Skeleton'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../components/Toast'
import { usePageHeader } from '../../AppShell'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { cn } from '../../lib/utils'
import {
  creditPackageSavePercent,
  getCreditPackages,
  getCreditsSummary,
  getPaymentsMeta,
  purchaseCreditPack,
} from '../../lib/api/commerce'
import type { CreditPackage, CreditsSummary, PaymentsMeta } from '../../lib/api/commerce'
import CheckoutModal, { type CheckoutLine } from './CheckoutModal'

/* ------------------------------------------------------------------ */
/* PackCard                                                           */
/* ------------------------------------------------------------------ */

const PackCard: React.FC<{
  pack: CreditPackage
  onBuy: (pack: CreditPackage) => void
}> = ({ pack, onBuy }) => {
  const savePercent = creditPackageSavePercent(pack)
  return (
    <article className="flex flex-col rounded-card border border-gray-a6 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-gray-12">
          {pack.credits.toLocaleString()}
          <span className="ml-1.5 text-sm font-medium text-gray-10">credits</span>
        </p>
        {savePercent > 0 ? (
          <span className="inline-flex shrink-0 items-center rounded-full bg-yellow-9 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-1">
            Save {savePercent}%
          </span>
        ) : null}
      </div>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-xl font-bold text-gray-12">
          {pack.currency_symbol}
          {pack.price}
        </span>
        {savePercent > 0 ? (
          <span className="text-sm font-medium text-gray-9 line-through">
            {pack.currency_symbol}
            {pack.base_price}
          </span>
        ) : null}
      </p>

      <p className="mt-1 text-xs text-gray-10">
        ≈ {Math.floor(pack.credits / 12).toLocaleString()} min of video · expires 1 year after purchase
      </p>

      <AtlabsButton
        className="mt-4 w-full font-semibold uppercase tracking-wide"
        onClick={() => onBuy(pack)}
        aria-label={`Pay ${pack.currency_symbol}${pack.price} for ${pack.credits} credits`}
      >
        Pay
      </AtlabsButton>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* CreditsPage                                                        */
/* ------------------------------------------------------------------ */

const CreditsPage: React.FC = () => {
  useDocumentTitle('Credit Packs | Atlabs AI')
  const { setActions } = usePageHeader()
  const { toast } = useToast()

  const [meta, setMeta] = useState<PaymentsMeta | null>(null)
  const [packages, setPackages] = useState<CreditPackage[] | null>(null)
  const [summary, setSummary] = useState<CreditsSummary | null>(null)

  const [checkoutPack, setCheckoutPack] = useState<CreditPackage | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getPaymentsMeta().then((m) => !cancelled && setMeta(m))
    void getCreditPackages().then((p) => !cancelled && setPackages(p))
    void getCreditsSummary().then((s) => !cancelled && setSummary(s))
    return () => {
      cancelled = true
    }
  }, [])

  const refreshSummary = useCallback((): void => {
    void getCreditsSummary().then(setSummary)
  }, [])

  const openCheckout = useCallback((pack: CreditPackage) => {
    setCheckoutPack(pack)
    setCheckoutOpen(true)
  }, [])

  const confirmCheckout = useCallback(() => {
    if (!checkoutPack) return
    setProcessing(true)
    void purchaseCreditPack(checkoutPack.id)
      .then((next) => {
        setSummary(next)
        toast({
          title: 'Payment successful',
          description: `${checkoutPack.credits.toLocaleString()} credits were added to your balance.`,
          variant: 'success',
        })
        setCheckoutOpen(false)
      })
      .catch(() => {
        toast({
          title: 'Payment failed',
          description: 'The fixture checkout could not complete. Please try again.',
          variant: 'error',
        })
      })
      .finally(() => setProcessing(false))
  }, [checkoutPack, toast])

  useEffect(() => {
    setActions(
      summary ? (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-gray-a6 px-3 py-1',
            'text-xs font-semibold text-gray-12',
          )}
          aria-label="Current credit balance"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-9" aria-hidden />
          {summary.remaining_credits.toLocaleString()} credits
        </span>
      ) : null,
    )
    return () => setActions(null)
  }, [summary, setActions])

  const checkoutLines: CheckoutLine[] = checkoutPack
    ? [
        { label: 'Credits', value: checkoutPack.credits.toLocaleString() },
        ...(creditPackageSavePercent(checkoutPack) > 0
          ? [
              {
                label: 'Discount',
                value: `−${checkoutPack.currency_symbol}${checkoutPack.discount_amount}`,
              },
            ]
          : []),
        { label: 'Expiry', value: '1 year from purchase' },
      ]
    : []

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <header className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-gray-12">Credit Packs</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-11">
          Add-on credits that you can use anytime with an active subscription.
          They expire in one year from the date of purchase.
        </p>
      </header>

      {/* Packs grid */}
      {packages === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-card border border-gray-a6 bg-white p-5">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="mt-4 h-6 w-20" />
              <Skeleton className="mt-4 h-9 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pack) => (
            <PackCard key={pack.id} pack={pack} onBuy={openCheckout} />
          ))}
        </div>
      )}

      {/* Balance + pools */}
      {summary !== null && summary.breakdown.buckets.length > 0 ? (
        <section className="mt-8" aria-label="Credit balance breakdown">
          <h3 className="text-sm font-semibold text-gray-12">
            Your balance — {summary.remaining_credits.toLocaleString()} credits remaining
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {summary.breakdown.buckets.map((bucket) => (
              <li
                key={bucket.pool_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-gray-a6 bg-white px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-12">{bucket.name}</p>
                  <p className="text-xs text-gray-10">
                    {bucket.description}
                    {bucket.expires_at
                      ? ` · expires ${new Date(bucket.expires_at).toLocaleDateString()}`
                      : ' · never expires'}
                  </p>
                </div>
                <p className="font-semibold text-gray-12">
                  {bucket.balance.toLocaleString()} / {bucket.granted.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Subscription gate banner (captured live copy) */}
      <div className="mt-8">
        <Callout variant="info">
          <span>
            You need an active subscription to buy credit packs.{' '}
            <Link
              to="/subscribe"
              className="font-semibold text-gray-12 underline decoration-yellow-9 decoration-2 underline-offset-2 hover:text-gray-12"
            >
              Need a subscription first? View subscription plans
            </Link>
          </span>
        </Callout>
      </div>

      {packages !== null && packages.length === 0 ? (
        <EmptyState
          title="No credit packs available"
          description="Add-on packs will appear here once the catalog is published."
        />
      ) : null}

      {/* Checkout modal */}
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open)
          if (!open) setCheckoutPack(null)
        }}
        provider={meta?.credit_purchase_provider ?? 'DODO'}
        title="Buy credit pack"
        description="Add-on credits can be used anytime with an active subscription and expire one year after purchase."
        lines={checkoutLines}
        totalLabel="Total due"
        totalValue={
          checkoutPack
            ? `${checkoutPack.currency_symbol}${checkoutPack.price}`
            : ''
        }
        confirmLabel={
          checkoutPack ? `Pay ${checkoutPack.currency_symbol}${checkoutPack.price}` : 'Pay'
        }
        processing={processing}
        onConfirm={confirmCheckout}
      />
    </div>
  )
}

export default CreditsPage
