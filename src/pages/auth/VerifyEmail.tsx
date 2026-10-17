import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeOpenIcon, ReloadIcon } from '@radix-ui/react-icons'
import { AuthCard } from './AuthCard'
import { AtlabsButton } from '../../components/AtlabsButton'
import IconBadge from '../../components/IconBadge'
import Callout from '../../components/Callout'
import { useToast } from '../../components/Toast'
import { useDocumentTitle } from '../../lib/useDocumentTitle'

/**
 * VerifyEmail — "check your inbox" card with a resend action.
 * Route: /verify_email
 */
const VerifyEmail: React.FC = () => {
  useDocumentTitle('Verify Email | Atlabs AI')
  const { toast } = useToast()
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const resend = async () => {
    setResending(true)
    try {
      // Mock backend round-trip that re-sends the verification email.
      await new Promise((resolve) => setTimeout(resolve, 500))
      setResent(true)
      toast({
        title: 'Verification email sent',
        description: 'Check your inbox (and spam folder) for the new link.',
        variant: 'success',
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthCard
      title="Check your inbox"
      subtitle="We sent a verification link to your email address"
      footer={
        <Link
          to="/login"
          className="font-medium text-gray-12 underline decoration-gray-a6 underline-offset-2 hover:decoration-gray-11"
        >
          Back to log in
        </Link>
      }
    >
      <div className="flex flex-col items-center text-center">
        <IconBadge size="lg" tone="yellow" className="mb-5">
          <EnvelopeOpenIcon width={22} height={22} />
        </IconBadge>

        <p className="max-w-xs text-sm leading-relaxed text-gray-11">
          Click the link in the email to verify your address and start
          creating videos with Atlabs. The link expires in 24 hours.
        </p>

        {resent ? (
          <Callout variant="success" className="mt-5 w-full text-left">
            A new verification email is on its way. If it does not arrive
            within a minute, check your spam folder.
          </Callout>
        ) : null}

        <AtlabsButton
          variant="secondary"
          size="md"
          className="mt-6 w-full"
          onClick={resend}
          disabled={resending}
        >
          <ReloadIcon width={14} height={14} />
          {resending ? 'Resending…' : 'Resend verification email'}
        </AtlabsButton>

        <p className="mt-4 text-xs text-gray-9">
          Wrong address?{' '}
          <Link
            to="/signup"
            className="text-gray-11 underline decoration-gray-a6 underline-offset-2 hover:text-gray-12"
          >
            Sign up again
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}

export default VerifyEmail
