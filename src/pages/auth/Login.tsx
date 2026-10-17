import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthCard, SocialButton, Divider } from './AuthCard'
import { GoogleLogoIcon, AppleLogoIcon } from './icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import { useAuth } from '../../lib/auth'
import { useDocumentTitle } from '../../lib/useDocumentTitle'

interface LocationState {
  from?: string
}

/**
 * Login — social mock auth routes to /welcome (or the route that
 * triggered the auth redirect). "CONTINUE WITH EMAIL" reveals the
 * email + password form.
 */
const Login: React.FC = () => {
  useDocumentTitle('Login | Atlabs AI')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<'social' | 'email'>('social')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState<null | 'google' | 'apple' | 'email'>(null)

  const destination = (location.state as LocationState | null)?.from ?? '/welcome'

  const socialLogin = async (provider: 'google' | 'apple') => {
    setPending(provider)
    try {
      await login(provider)
      navigate(destination, { replace: true })
    } finally {
      setPending(null)
    }
  }

  const emailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending('email')
    try {
      await login('email')
      navigate(destination, { replace: true })
    } finally {
      setPending(null)
    }
  }

  const fieldClasses =
    'h-11 w-full rounded-control border border-gray-a6 bg-white px-3.5 text-sm text-gray-12 placeholder:text-gray-9 focus:outline-none focus:ring-2 focus:ring-yellow-4 focus:border-yellow-6'

  return (
    <AuthCard
      title="Welcome to Atlabs"
      subtitle="Sign in to keep creating"
      footer={
        <>
          New to Atlabs?{' '}
          <Link
            to="/signup"
            className="font-medium text-gray-12 underline decoration-gray-a6 underline-offset-2 hover:decoration-gray-11"
          >
            Create an account
          </Link>
          <p className="mt-4 text-xs leading-relaxed text-gray-9">
            By continuing you agree to Atlabs' Customer Terms of Service and
            Privacy Policy.
          </p>
        </>
      }
    >
      {mode === 'social' ? (
        <div className="space-y-3">
          <SocialButton
            onClick={() => socialLogin('google')}
            disabled={pending !== null}
            providerIcon={<GoogleLogoIcon />}
          >
            {pending === 'google' ? 'Signing in…' : 'Sign in with Google'}
          </SocialButton>
          <SocialButton
            onClick={() => socialLogin('apple')}
            disabled={pending !== null}
            providerIcon={<AppleLogoIcon />}
          >
            {pending === 'apple' ? 'Signing in…' : 'Sign in with Apple'}
          </SocialButton>
          <Divider />
          <AtlabsButton
            variant="primary"
            size="lg"
            className="w-full font-semibold uppercase tracking-wide"
            onClick={() => setMode('email')}
          >
            Continue with Email
          </AtlabsButton>
        </div>
      ) : (
        <form onSubmit={emailLogin} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-sm font-medium text-gray-12"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={fieldClasses}
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-medium text-gray-12"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={fieldClasses}
            />
          </div>
          <AtlabsButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-semibold uppercase tracking-wide"
            disabled={pending !== null}
          >
            {pending === 'email' ? 'Signing in…' : 'Sign in'}
          </AtlabsButton>
          <button
            type="button"
            onClick={() => setMode('social')}
            className="w-full text-center text-xs text-gray-11 underline decoration-gray-a6 underline-offset-2 hover:text-gray-12"
          >
            Back to all sign-in options
          </button>
        </form>
      )}
    </AuthCard>
  )
}

export default Login
