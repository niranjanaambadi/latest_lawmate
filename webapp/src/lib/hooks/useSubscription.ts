import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '@/lib/api/subscription'
import { toast } from 'sonner'

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionApi.getCurrentSubscription(),
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionApi.getPlans(),
  })
}

export function useUsageStats() {
  return useQuery({
    queryKey: ['usage-stats'],
    queryFn: () => subscriptionApi.getUsageStats(),
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => subscriptionApi.getInvoices(),
  })
}

export function useUpgradePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ plan, billingCycle }: { plan: string; billingCycle: string }) =>
      subscriptionApi.upgradePlan(plan, billingCycle),
    onSuccess: (data) => {
      // Redirect to payment page
      window.location.href = data.checkout_url
    },
    onError: () => {
      toast.error('Failed to upgrade plan')
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reason?: string) => subscriptionApi.cancelSubscription(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Subscription cancelled successfully')
    },
    onError: () => {
      toast.error('Failed to cancel subscription')
    },
  })
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentMethod: string) =>
      subscriptionApi.updatePaymentMethod(paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Payment method updated')
    },
    onError: () => {
      toast.error('Failed to update payment method')
    },
  })
}