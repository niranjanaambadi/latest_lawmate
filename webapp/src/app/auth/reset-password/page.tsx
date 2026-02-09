// // src/app/(auth)/reset-password/page.tsx
// 'use client';

// import { useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { CheckCircle, Loader2 } from 'lucide-react';
// import Link from 'next/link';

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     if (password.length < 8) {
//       setError('Password must be at least 8 characters');
//       return;
//     }

//     if (!token) {
//       setError('Invalid or missing reset token');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/auth/reset-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token, password })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to reset password');
//       }

//       setSuccess(true);
      
//       // Redirect to signin after 3 seconds
//       setTimeout(() => {
//         router.push('/signin?reset=true');
//       }, 3000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!token) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">Invalid Link</CardTitle>
//           <CardDescription>
//             This password reset link is invalid or has expired
//           </CardDescription>
//         </CardHeader>
//         <CardFooter>
//           <Link href="/forgot-password" className="w-full">
//             <Button className="w-full">Request New Link</Button>
//           </Link>
//         </CardFooter>
//       </Card>
//     );
//   }

//   if (success) {
//     return (
//       <Card>
//         <CardHeader className="text-center space-y-4">
//           <div className="flex justify-center">
//             <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
//               <CheckCircle className="h-8 w-8 text-green-600" />
//             </div>
//           </div>
//           <div>
//             <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
//             <CardDescription>
//               Your password has been reset successfully. Redirecting to sign in...
//             </CardDescription>
//           </div>
//         </CardHeader>
//         <CardFooter>
//           <Link href="/signin" className="w-full">
//             <Button className="w-full">Sign In Now</Button>
//           </Link>
//         </CardFooter>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-2xl">Create New Password</CardTitle>
//         <CardDescription>
//           Enter a new password for your account
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="password">New Password</Label>
//             <Input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               required
//               disabled={loading}
//               minLength={8}
//               autoComplete="new-password"
//             />
//             <p className="text-xs text-muted-foreground">
//               Must be at least 8 characters
//             </p>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="confirmPassword">Confirm New Password</Label>
//             <Input
//               id="confirmPassword"
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="••••••••"
//               required
//               disabled={loading}
//               autoComplete="new-password"
//             />
//           </div>

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             {loading ? 'Resetting Password...' : 'Reset Password'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }
// src/app/auth/reset-password/page.tsx
import { Suspense } from 'react'
import ResetPasswordForm from './reset-password-form'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}