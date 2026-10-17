import React from 'react'
import Modal from '../../components/Modal'
import Callout from '../../components/Callout'
import { AtlabsButton } from '../../components/AtlabsButton'

export interface CheckoutLine {
  label: string
  value: string
}

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Payment provider label shown on the summary (fixture: "DODO"). */
  provider: string
  title: string
  description?: string
  lines: CheckoutLine[]
  totalLabel: string
  totalValue: string
  confirmLabel: string
  processing: boolean
  warning?: string
  onConfirm: () => void
}

/**
 * Shared DODO checkout modal used by /credits (pack purchases) and
 * /subscribe (plan upgrades). Renders the provider badge, an order
 * summary and a processing state; the actual payment is fixture-backed.
 */
const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  onOpenChange,
  provider,
  title,
  description,
  lines,
  totalLabel,
  totalValue,
  confirmLabel,
  processing,
  warning,
  onConfirm,
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!processing) onOpenChange(next)
      }}
      title={title}
      description={description}
    >
      {warning ? (
        <Callout variant="warning" className="mb-4">
          {warning}
        </Callout>
      ) : null}

      <div className="rounded-card border border-gray-a6 bg-gray-1 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-10">
            Order summary
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-1">
            {provider}
          </span>
        </div>
        <dl className="mt-3 flex flex-col gap-1.5 text-sm">
          {lines.map((line) => (
            <div key={line.label} className="flex items-center justify-between gap-4">
              <dt className="text-gray-11">{line.label}</dt>
              <dd className="font-medium text-gray-12">{line.value}</dd>
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-gray-a6 pt-2.5">
            <dt className="font-semibold text-gray-12">{totalLabel}</dt>
            <dd className="text-base font-bold text-gray-12">{totalValue}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-gray-10">
        This is a fixture checkout — no real payment is processed. Confirming
        simulates the DODO round-trip and applies the change to your mock
        account.
      </p>

      <div className="mt-5 flex items-center justify-end gap-3">
        <AtlabsButton
          variant="secondary"
          onClick={() => onOpenChange(false)}
          disabled={processing}
        >
          Cancel
        </AtlabsButton>
        <AtlabsButton onClick={onConfirm} disabled={processing} aria-busy={processing}>
          {processing ? 'Processing…' : confirmLabel}
        </AtlabsButton>
      </div>
    </Modal>
  )
}

export default CheckoutModal
