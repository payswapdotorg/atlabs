import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircledIcon, CopyIcon, Link2Icon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import Callout from '../../components/Callout'
import { useToast } from '../../components/Toast'
import { usePageHeader } from '../../AppShell'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { cn } from '../../lib/utils'
import { getAccountProfile } from '../../lib/api/commerce'
import type { AccountProfile } from '../../lib/api/commerce'

/* ------------------------------------------------------------------ */
/* Client card data — logo placeholders, benefits, setup snippets     */
/* ------------------------------------------------------------------ */

interface McpClient {
  id: string
  name: string
  tagline: string
  /** Single-letter logo placeholder color + glyph. */
  logoClass: string
  logoGlyph: string
  benefits: string[]
  config: string
}

const MCP_CONFIG = JSON.stringify(
  {
    mcpServers: {
      atlabs: {
        command: 'npx',
        args: ['-y', 'atlabs-mcp'],
        env: { ATLABS_API_KEY: 'your-api-key' },
      },
    },
  },
  null,
  2,
)

const CLIENTS: McpClient[] = [
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'Anthropic Desktop & Claude Code',
    logoClass: 'bg-[#d97757]',
    logoGlyph: 'C',
    benefits: [
      'Create videos from a chat prompt',
      'Browse your stories and check render status',
      'Manage characters, styles and locations',
    ],
    config: MCP_CONFIG,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'OpenAI Desktop (Agents & MCP)',
    logoClass: 'bg-gray-12',
    logoGlyph: 'G',
    benefits: [
      'Generate music-to-video and script-to-video cuts',
      'Browse your stories and credit balance',
      'Manage characters and reusable assets',
    ],
    config: MCP_CONFIG,
  },
  {
    id: 'grok',
    name: 'Grok',
    tagline: 'xAI Grok with MCP support',
    logoClass: 'bg-gray-3 text-gray-12 border border-gray-a6',
    logoGlyph: 'X',
    benefits: [
      'Create videos without leaving the chat',
      'Browse your stories and recent renders',
      'Manage characters, products and locations',
    ],
    config: MCP_CONFIG,
  },
]

/* ------------------------------------------------------------------ */
/* CopyButton                                                         */
/* ------------------------------------------------------------------ */

const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard API can be unavailable (http / permissions) — fall back.
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(ta)
      }
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copy ${label} setup snippet`}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-control border border-gray-a6 bg-white px-2.5',
        'text-xs font-medium text-gray-11 transition-colors hover:bg-gray-2 hover:text-gray-12',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      )}
    >
      {copied ? (
        <CheckCircledIcon width={13} height={13} className="text-yellow-11" />
      ) : (
        <CopyIcon width={13} height={13} />
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* McpPage                                                            */
/* ------------------------------------------------------------------ */

const McpPage: React.FC = () => {
  useDocumentTitle('Atlabs MCP — Connect Atlabs to Claude, ChatGPT & Grok | Atlabs AI')
  const { setActions } = usePageHeader()
  const { toast } = useToast()
  const [profile, setProfile] = useState<AccountProfile | null>(null)

  useEffect(() => {
    setActions(null)
    let cancelled = false
    void getAccountProfile().then((p) => !cancelled && setProfile(p))
    return () => {
      cancelled = true
      setActions(null)
    }
  }, [setActions])

  const subscribed = profile?.is_premium === true

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-yellow-12 ring-1 ring-yellow-5">
          <Link2Icon width={12} height={12} />
          Atlabs MCP
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-12">
          Connect Atlabs to Claude, ChatGPT &amp; Grok
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-11">
          The Atlabs MCP server plugs your workspace straight into the AI
          assistants you already use. Once connected, Claude, ChatGPT and Grok
          can create videos, browse your stories and manage your characters —
          no tab-switching, no copy-paste.
        </p>
      </header>

      {/* Subscription requirement */}
      <div className="mx-auto mt-6 max-w-2xl">
        {subscribed ? (
          <Callout variant="success" title="MCP is included in your subscription">
            Your API key lives in the setup snippet below — connect any client
            in under a minute.
          </Callout>
        ) : (
          <Callout variant="warning" title="MCP requires an active subscription">
            <span>
              Connect Claude, ChatGPT or Grok to Atlabs with any paid plan.{' '}
              <Link
                to="/subscribe"
                className="font-semibold underline decoration-yellow-9 decoration-2 underline-offset-2"
              >
                View subscription plans
              </Link>
            </span>
          </Callout>
        )}
      </div>

      {/* Client cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {CLIENTS.map((client) => (
          <article
            key={client.id}
            className="flex flex-col rounded-card border border-gray-a6 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            aria-label={`Set up Atlabs MCP with ${client.name}`}
          >
            {/* Logo placeholder + name */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-card text-lg font-bold text-white',
                  client.logoClass,
                )}
              >
                {client.logoGlyph}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-12">{client.name}</h3>
                <p className="truncate text-xs text-gray-10">{client.tagline}</p>
              </div>
            </div>

            {/* What you get */}
            <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-gray-10">
              What you get
            </h4>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-gray-11">
              {client.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircledIcon width={14} height={14} className="mt-0.5 shrink-0 text-yellow-11" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Setup snippet */}
            <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-gray-10">
              Setup
            </h4>
            <div className="relative mt-2 flex-1">
              <pre
                className="max-h-56 overflow-auto rounded-card bg-gray-12 p-3.5 pr-3 font-mono text-[11px] leading-relaxed text-gray-1"
                aria-label={`${client.name} MCP configuration snippet`}
              >
                {client.config}
              </pre>
              <div className="absolute right-2 top-2">
                <CopyButton text={client.config} label={client.name} />
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-10">
              Add the snippet to your {client.name} MCP config, set{' '}
              <code className="font-mono text-[11px] text-gray-11">ATLABS_API_KEY</code>{' '}
              to a key from your account, and restart the client.
            </p>
          </article>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-8 flex flex-col items-center gap-3 rounded-card border border-gray-a6 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-11">
          MCP requires an active subscription. Upgrade to unlock the Atlabs
          MCP server and drive video creation from your assistant.
        </p>
        <AtlabsButton
          className="font-semibold uppercase tracking-wide"
          onClick={() =>
            toast({
              title: subscribed ? 'Subscription active' : 'Head to Pricing',
              description: subscribed
                ? 'You already have access to the Atlabs MCP server.'
                : 'Pick a plan on the pricing page to enable MCP (fixture).',
            })
          }
        >
          {subscribed ? 'Subscription active' : 'View plans'}
        </AtlabsButton>
      </div>
    </div>
  )
}

export default McpPage
