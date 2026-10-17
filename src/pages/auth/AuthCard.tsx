import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { AtlabsWordmark } from './icons'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/** Centered card + wordmark layout shared by Login / Signup / VerifyEmail. */
export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-gray-1 px-4 py-10',
        className,
      )}
    >
      <Link
        to="/"
        className="mb-8"
        aria-label="atlabs home"
      >
        <AtlabsWordmark size="lg" />
      </Link>

      <div className="w-full max-w-sm rounded-card border border-gray-a6 bg-white p-7 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-gray-12">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 text-center text-sm text-gray-11">{subtitle}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>

      {footer ? (
        <div className="mt-6 w-full max-w-sm text-center text-sm text-gray-11">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  providerIcon: React.ReactNode
}

/** Outlined full-width social auth button. */
export const SocialButton: React.FC<SocialButtonProps> = ({
  providerIcon,
  children,
  className,
  ...props
}) => (
  <button
    type="button"
    className={cn(
      'inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-control',
      'border border-gray-a6 bg-white text-sm font-medium text-gray-12',
      'transition-colors hover:bg-gray-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-4',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="shrink-0">{providerIcon}</span>
    {children}
  </button>
)

export const Divider: React.FC<{ label?: string }> = ({ label = 'or' }) => (
  <div className="my-5 flex items-center gap-3" aria-hidden>
    <span className="h-px flex-1 bg-gray-a6" />
    <span className="text-xs uppercase tracking-wider text-gray-9">{label}</span>
    <span className="h-px flex-1 bg-gray-a6" />
  </div>
)
