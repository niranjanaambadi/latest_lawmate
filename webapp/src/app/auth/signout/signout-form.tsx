// src/app/auth/signout/signout-form.tsx
'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, LogOut } from 'lucide-react'

export default function SignOutForm() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true
      })
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <LogOut className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Sign Out</CardTitle>
          <CardDescription className="text-center">
            Are you sure you want to sign out?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            You will need to sign in again to access your account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full"
            variant="destructive"
          >
            {isSigningOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSigningOut ? 'Signing out...' : 'Yes, Sign Out'}
          </Button>
          <Button
            onClick={() => router.back()}
            disabled={isSigningOut}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}