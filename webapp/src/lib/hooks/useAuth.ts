import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import type { User } from '@/types/user'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', session?.user?.email],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/dashboard')
    }

    return result
  }

  const logout = async () => {
    await authApi.logout()
    await signOut({ callbackUrl: '/login' })
  }

  return {
    user: user as User | undefined,
    session,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading' || isLoadingUser,
    login,
    logout,
  }
}