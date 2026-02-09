// src/app/auth/error/error-content.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact support.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
  },
  Verification: {
    title: 'Verification Failed',
    description: 'The verification token has expired or has already been used.',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'Error in constructing an authorization URL.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error in handling the response from OAuth provider.',
  },
  OAuthCreateAccount: {
    title: 'OAuth Account Creation Error',
    description: 'Could not create OAuth provider user in the database.',
  },
  EmailCreateAccount: {
    title: 'Email Account Creation Error',
    description: 'Could not create email provider user in the database.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error in the OAuth callback handler route.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Already Exists',
    description: 'This email is already associated with another account. Please sign in using your original method.',
  },
  EmailSignin: {
    title: 'Email Sign In Error',
    description: 'Check your email address.',
  },
  CredentialsSignin: {
    title: 'Sign In Failed',
    description: 'Invalid email or password. Please check your credentials and try again.',
  },
  SessionRequired: {
    title: 'Authentication Required',
    description: 'You must be signed in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication. Please try again.',
  },
}

export default function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'

  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-center">{errorInfo.title}</CardTitle>
          <CardDescription className="text-center">
            Error Code: {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorInfo.description}</AlertDescription>
          </Alert>

          <div className="mt-6 space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-2">What you can do:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Try signing in again</li>
                <li>Clear your browser cache and cookies</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}