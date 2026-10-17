import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard, SocialButton, Divider } from './AuthCard'
import { GoogleLogoIcon, AppleLogoIcon } from './icons'
import { AtlabsButton } from '../../components/AtlabsButton'
import { useAuth } from '../../lib/auth'
import { useDocumentTitle } from '../../lib/useDocumentTitle'

/**
 * Signup — social auth logs the mock user in and routes to /welcome;
 * email signup routes to /verify_email ("check your inbox").
 */
const Signup: React.FC = () => {
  useDocumentTitle('Signup | Atlabs AI')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState<null | 'google' | 'apple' | 'email'>(null)

  const socialSignup = async (provider: 'google' | 'apple') => {
    setPending(provider)
    try {
      await login(provider)
      navigate('/welcome', { replace: true })
    } finally {
      setPending(null)
    }
  }

  const emailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending('email')
    try {
      // Mock backend would create the account and send a verification email.
      await new Promise((resolve) => setTimeout(resolve, 400))
      navigate('/verify_email', { replace: true })
    } finally {
      setPending(null)
    }
  }

  const fieldClasses =
    'h-11 w-full rounded-control border border-gray-a6 bg-white px-3.5 text-sm text-gray-12 placeholder:text-gray-9 focus:outline-none focus:ring-2 focus:ring-yellow-4 focus:border-yellow-6'

  const labelClasses = 'mb-1.5 block text-sm font-medium text-gray-12'

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start making videos for free"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-gray-12 underline decoration-gray-a6 underline-offset-2 hover:decoration-gray-11"
          >
            Log in
          </Link>
          <p className="mt-4 text-xs leading-relaxed text-gray-9">
            By continuing you agree to Atlabs' Customer Terms of Service and
            Privacy Policy.
          </p>
        </>
      }
    >
      <div className="space-y-3">
        <SocialButton
          onClick={() => socialSignup('google')}
          disabled={pending !== null}
          providerIcon={<GoogleLogoIcon />}
        >
          {pending === 'google' ? 'Signing up…' : 'Sign up with Google'}
        </SocialButton>
        <SocialButton
          onClick={() => socialSignup('apple')}
          disabled={pending !== null}
          providerIcon={<AppleLogoIcon />}
        >
          {pending === 'apple' ? 'Signing up…' : 'Sign up with Apple'}
        </SocialButton>
        <Divider />
        <form onSubmit={emailSignup} className="space-y-4" noValidate>
          <div>
            <label htmlFor="signup-name" className={labelClasses}>
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={fieldClasses}
            />
          </div>
          <div>
            <label htmlFor="signup-email" className={labelClasses}>
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className={labelClasses}>
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
            {pending === 'email' ? 'Creating account…' : 'Sign up'}
          </AtlabsButton>
        </form>
      </div>
    </AuthCard>
  )
}

export default Signup
