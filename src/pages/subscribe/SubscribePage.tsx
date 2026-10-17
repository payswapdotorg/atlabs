import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircledIcon, RocketIcon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Callout from '../../components/Callout'
import SegmentedControl from '../../components/SegmentedControl'
import Skeleton from '../../components/Skeleton'
import { useToast } from '../../components/Toast'
import { usePageHeader } from '../../AppShell'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { cn } from '../../lib/utils'
import {
  getAccountProfile,
  getPaymentsMeta,
  getProductsPrices,
  subscribeToPlan,
} from '../../lib/api/commerce'
import type { AccountProfile, BillingCycle, PaymentsMeta, Plan } from '../../lib/api/commerce'
import CheckoutModal, { type CheckoutLine } from '../credits/CheckoutModal'

/* ------------------------------------------------------------------ */
/* Plan card copy (captured verbatim from the live pricing page)      */
/* ------------------------------------------------------------------ */

const PLAN_META: Record<
  Plan['type'],
  { blurb: string[]; savingsChip: string }
> = {
  FREE: {
    blurb: ['5 credits / one-time trial', 'Try Atlabs before subscribing', 'For curious first-timers'],
    savingsChip: '',
  },
  PRO: {
    blurb: [
      '4,200 credits / year',
      'Covers 36-48 minutes of video.',
      'Ideal for solo creators getting started',
    ],
    savingsChip: 'Save $120 compared to monthly',
  },
  PLUS: {
    blurb: [
      '9,000 credits / year',
      'Covers 84-120 minutes of video.',
      'Best for creators and small businesses',
    ],
    savingsChip: 'Save $240 compared to monthly',
  },
}

/* ------------------------------------------------------------------ */
/* PlanCard                                                           */
/* ------------------------------------------------------------------ */

const PlanCard: React.FC<{
  plan: Plan
  cycle: BillingCycle
  currentPlan: string | null
  onUpgrade: (plan: Plan, cycle: BillingCycle) => void
}> = ({ plan, cycle, currentPlan, onUpgrade }) => {
  const price = plan.plans.find((p) => p.billing_cycle === cycle) ?? plan.plans[0]
  const isFree = plan.type === 'FREE'
  const isCurrent = currentPlan === plan.type
  const meta = PLAN_META[plan.type]

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-card border bg-white p-6 shadow-sm transition-shadow hover:shadow-md',
        plan.type === 'PLUS' ? 'border-yellow-9 ring-1 ring-yellow-9' : 'border-gray-a6',
      )}
      aria-label={`${plan.name} plan`}
    >
      {plan.type === 'PLUS' ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-9 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-1 shadow-sm">
          Most popular
        </span>
      ) : null}

      <header>
        <h3 className="text-lg font-bold uppercase tracking-wide text-gray-12">{plan.name}</h3>
        <p className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-gray-12">
            {price.currency_symbol}
            {price.amount}
          </span>
          <span className="text-sm text-gray-10">
            {isFree ? '/ forever' : '/ mo'}
          </span>
        </p>
        {!isFree && cycle === 'annual' ? (
          <p className="mt-0.5 text-xs text-gray-10">
            Billed as ${(price.amount * 12).toLocaleString()} annually
          </p>
        ) : null}
        {!isFree && cycle === 'monthly' ? (
          <p className="mt-0.5 text-xs text-gray-10">Billed monthly · cancel anytime</p>
        ) : null}
      </header>

      {meta.savingsChip && cycle === 'annual' ? (
        <p className="mt-3">
          <span className="inline-flex items-center rounded-full bg-yellow-2 px-2.5 py-1 text-[11px] font-semibold text-yellow-12 ring-1 ring-yellow-5">
            {meta.savingsChip}
          </span>
        </p>
      ) : null}

      <ul className="mt-4 flex flex-col gap-1.5 text-xs text-gray-11">
        {meta.blurb.map((line) => (
          <li key={line} className="font-medium text-gray-12">
            {line}
          </li>
        ))}
      </ul>

      <div className="my-4 h-px bg-gray-a6" aria-hidden />

      <ul className="flex flex-1 flex-col gap-2 text-sm text-gray-11" aria-label={`${plan.name} features`}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircledIcon width={14} height={14} className="mt-0.5 shrink-0 text-yellow-11" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <AtlabsButton
        className="mt-6 w-full font-semibold uppercase tracking-wide"
        variant={plan.type === 'PLUS' ? 'primary' : plan.type === 'FREE' ? 'secondary' : 'primary'}
        disabled={isCurrent}
        onClick={() => onUpgrade(plan, cycle)}
      >
        {isCurrent ? 'Current plan' : isFree ? 'Try for Free' : 'Upgrade'}
      </AtlabsButton>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* SubscribePage — also rendered at /pricing (alias route)            */
/* ------------------------------------------------------------------ */

const SubscribePage: React.FC = () => {
  useDocumentTitle('Pricing | Atlabs AI')
  const { setActions } = usePageHeader()
  const { toast } = useToast()

  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [meta, setMeta] = useState<PaymentsMeta | null>(null)
  const [profile, setProfile] = useState<AccountProfile | null>(null)

  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null)
  const [checkoutCycle, setCheckoutCycle] = useState<BillingCycle>('monthly')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getProductsPrices().then((p) => {
      if (cancelled) return
      setPlans([...p].sort((a, b) => a.order - b.order))
    })
    void getPaymentsMeta().then((m) => !cancelled && setMeta(m))
    void getAccountProfile().then((p) => !cancelled && setProfile(p))
    return () => {
      cancelled = true
    }
  }, [])

  const currentPlan = profile?.current_subscription?.plan ?? null

  const openCheckout = useCallback((plan: Plan, planCycle: BillingCycle) => {
    if (plan.type === 'FREE') {
      // Free trial needs no checkout — activate immediately.
      void subscribeToPlan('FREE', 'monthly').then((p) => {
        setProfile(p)
        toast({
          title: 'Free trial activated',
          description: '5 trial credits were added to your balance.',
          variant: 'success',
        })
      })
      return
    }
    setCheckoutPlan(plan)
    setCheckoutCycle(planCycle)
    setCheckoutOpen(true)
  }, [toast])

  const confirmCheckout = useCallback(() => {
    if (!checkoutPlan) return
    setProcessing(true)
    void subscribeToPlan(checkoutPlan.type, checkoutCycle)
      .then((p) => {
        setProfile(p)
        toast({
          title: `Welcome to ${checkoutPlan.name}!`,
          description: `Your ${checkoutCycle} subscription is active — renewing in one year (fixture).`,
          variant: 'success',
        })
        setCheckoutOpen(false)
      })
      .catch(() => {
        toast({
          title: 'Checkout failed',
          description: 'The fixture checkout could not complete. Please try again.',
          variant: 'error',
        })
      })
      .finally(() => setProcessing(false))
  }, [checkoutPlan, checkoutCycle, toast])

  const checkoutPrice = checkoutPlan
    ? checkoutPlan.plans.find((p) => p.billing_cycle === checkoutCycle) ?? checkoutPlan.plans[0]
    : null

  const checkoutLines: CheckoutLine[] = useMemo(() => {
    if (!checkoutPlan || !checkoutPrice) return []
    return [
      { label: 'Plan', value: `${checkoutPlan.name} (${checkoutCycle})` },
      {
        label: 'Credits',
        value: `${checkoutPrice.credits.toLocaleString()} / year`,
      },
      ...(checkoutCycle === 'annual'
        ? [
            {
              label: 'Billed annually',
              value: `${checkoutPrice.currency_symbol}${(checkoutPrice.amount * 12).toLocaleString()}`,
            },
          ]
        : []),
    ]
  }, [checkoutPlan, checkoutPrice, checkoutCycle])

  useEffect(() => {
    setActions(
      profile ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-a6 px-3 py-1 text-xs font-semibold text-gray-12">
          <RocketIcon width={13} height={13} className="text-yellow-11" />
          {profile.is_premium && profile.current_subscription
            ? `${profile.current_subscription.plan} plan`
            : 'Free plan'}
        </span>
      ) : null,
    )
    return () => setActions(null)
  }, [profile, setActions])

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <header className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-gray-12">Pick your plan</h2>
        <p className="mt-1 text-sm text-gray-11">No hidden fees, cancel anytime</p>
        <div className="mt-4 flex justify-center">
          <SegmentedControl
            items={[
              { value: 'monthly', label: 'Monthly' },
              {
                value: 'annual',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    Annual
                    <span className="rounded-full bg-yellow-9 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-1">
                      25% off
                    </span>
                  </span>
                ),
              },
            ]}
            value={cycle}
            onValueChange={(v) => setCycle(v as BillingCycle)}
          />
        </div>
      </header>

      {/* Current subscription callout */}
      {profile?.current_subscription ? (
        <div className="mb-6">
          <Callout variant="success" title={`You're on the ${profile.current_subscription.plan} plan`}>
            Renews {new Date(profile.current_subscription.renews_at).toLocaleDateString()} (fixture).
            Switching plans below replaces it.
          </Callout>
        </div>
      ) : null}

      {/* Plans */}
      {plans === null ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-card border border-gray-a6 bg-white p-6">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="mt-3 h-9 w-24" />
              <Skeleton className="mt-6 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
              <Skeleton className="mt-6 h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 pt-3 md:grid-cols-3 md:gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              currentPlan={currentPlan}
              onUpgrade={openCheckout}
            />
          ))}
        </div>
      )}

      {/* Checkout modal (FREE plan activates directly) */}
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open)
          if (!open) setCheckoutPlan(null)
        }}
        provider={meta?.provider ?? 'DODO'}
        title={`Upgrade to ${checkoutPlan?.name ?? ''}`}
        description="No hidden fees, cancel anytime. This fixture checkout simulates the DODO payment round-trip."
        lines={checkoutLines}
        totalLabel={checkoutCycle === 'annual' ? 'Total billed today' : 'Total due monthly'}
        totalValue={
          checkoutPrice
            ? checkoutCycle === 'annual'
              ? `${checkoutPrice.currency_symbol}${(checkoutPrice.amount * 12).toLocaleString()}`
              : `${checkoutPrice.currency_symbol}${checkoutPrice.amount}`
            : ''
        }
        confirmLabel="Confirm upgrade"
        processing={processing}
        onConfirm={confirmCheckout}
      />
    </div>
  )
}

export default SubscribePage
