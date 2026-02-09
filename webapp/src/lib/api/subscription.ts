import type { Subscription, Invoice, UsageStats, PlanDetails } from '@/types/subscription'
import apiClient from './client'

export const subscriptionApi = {
  async getCurrentSubscription(): Promise<Subscription> {
    const { data } = await apiClient.get('/api/v1/subscription/current')
    return data
  },

  async getPlans(): Promise<PlanDetails[]> {
    const { data } = await apiClient.get('/api/v1/subscription/plans')
    return data
  },

  async getUsageStats(): Promise<UsageStats> {
    const { data } = await apiClient.get('/api/v1/subscription/usage')
    return data
  },

  async getInvoices(): Promise<Invoice[]> {
    const { data } = await apiClient.get('/api/v1/subscription/invoices')
    return data
  },

  async upgradePlan(plan: string, billingCycle: string): Promise<{ checkout_url: string }> {
    const { data } = await apiClient.post('/api/v1/subscription/upgrade', {
      plan,
      billing_cycle: billingCycle,
    })
    return data
  },

  async cancelSubscription(reason?: string): Promise<void> {
    await apiClient.post('/api/v1/subscription/cancel', { reason })
  },

  async updatePaymentMethod(paymentMethod: string): Promise<void> {
    await apiClient.patch('/api/v1/subscription/payment-method', {
      payment_method: paymentMethod,
    })
  },

  async toggleAutoRenew(autoRenew: boolean): Promise<void> {
    await apiClient.patch('/api/v1/subscription/auto-renew', {
      auto_renew: autoRenew,
    })
  },
}