// // src/app/auth/verify/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
// import Link from 'next/link';

// export default function VerifyEmailPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const token = searchParams.get('token');
//   const email = searchParams.get('email');

//   const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('pending');
//   const [message, setMessage] = useState('');
//   const [resending, setResending] = useState(false);

//   useEffect(() => {
//     if (token) {
//       verifyEmail(token);
//     }
//   }, [token]);

//   const verifyEmail = async (verificationToken: string) => {
//     setStatus('loading');
//     try {
//       const response = await fetch('/api/auth/verify-email', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token: verificationToken })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setStatus('success');
//         setMessage('Your email has been verified successfully!');
//         setTimeout(() => {
//           router.push('/signin?verified=true');
//         }, 3000);
//       } else {
//         setStatus('error');
//         setMessage(data.error || 'Verification failed. The link may have expired.');
//       }
//     } catch (error) {
//       setStatus('error');
//       setMessage('An error occurred during verification. Please try again.');
//     }
//   };

//   const resendVerification = async () => {
//     if (!email) {
//       setMessage('Email address not found. Please sign up again.');
//       return;
//     }

//     setResending(true);
//     try {
//       const response = await fetch('/api/auth/resend-verification', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage('Verification email sent! Please check your inbox.');
//       } else {
//         setMessage(data.error || 'Failed to resend verification email.');
//       }
//     } catch (error) {
//       setMessage('An error occurred. Please try again.');
//     } finally {
//       setResending(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <div className="flex items-center justify-center mb-4">
//             {status === 'loading' && (
//               <Loader2 className="h-12 w-12 text-primary animate-spin" />
//             )}
//             {status === 'success' && (
//               <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
//                 <CheckCircle2 className="h-6 w-6 text-green-600" />
//               </div>
//             )}
//             {status === 'error' && (
//               <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
//                 <XCircle className="h-6 w-6 text-destructive" />
//               </div>
//             )}
//             {status === 'pending' && (
//               <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
//                 <Mail className="h-6 w-6 text-primary" />
//               </div>
//             )}
//           </div>
//           <CardTitle className="text-center">
//             {status === 'loading' && 'Verifying Email...'}
//             {status === 'success' && 'Email Verified!'}
//             {status === 'error' && 'Verification Failed'}
//             {status === 'pending' && 'Verify Your Email'}
//           </CardTitle>
//           <CardDescription className="text-center">
//             {status === 'pending' && 'Please check your email for a verification link'}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {message && (
//             <Alert variant={status === 'error' ? 'destructive' : 'default'}>
//               <AlertDescription>{message}</AlertDescription>
//             </Alert>
//           )}

//           {status === 'pending' && (
//             <div className="space-y-4 text-sm text-muted-foreground">
//               <p>
//                 We've sent a verification link to <strong>{email}</strong>
//               </p>
//               <p>
//                 Click the link in the email to verify your account. If you don't see the email, 
//                 check your spam folder.
//               </p>
//             </div>
//           )}

//           {status === 'success' && (
//             <div className="text-center text-sm text-muted-foreground">
//               <p>Redirecting you to sign in...</p>
//             </div>
//           )}
//         </CardContent>
//         <CardFooter className="flex flex-col gap-2">
//           {status === 'success' && (
//             <Button asChild className="w-full">
//               <Link href="/signin">Continue to Sign In</Link>
//             </Button>
//           )}

//           {(status === 'error' || status === 'pending') && (
//             <>
//               <Button
//                 onClick={resendVerification}
//                 disabled={resending || !email}
//                 variant="outline"
//                 className="w-full"
//               >
//                 {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 {resending ? 'Sending...' : 'Resend Verification Email'}
//               </Button>
//               <Button asChild variant="ghost" className="w-full">
//                 <Link href="/signin">Back to Sign In</Link>
//               </Button>
//             </>
//           )}
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }
// src/app/auth/verify/page.tsx
import { Suspense } from 'react'
import VerifyEmailForm from './verify-form'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}