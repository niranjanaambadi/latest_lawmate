// 
// src/app/auth/error/page.tsx
import { Suspense } from 'react'
import AuthErrorContent from './error-content'

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}