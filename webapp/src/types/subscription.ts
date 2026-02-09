// src/types/subscription.ts
import type { 
  SubscriptionPlan as PrismaSubscriptionPlan,
  SubscriptionStatus as PrismaSubscriptionStatus,
  BillingCycle as PrismaBillingCycle,
  PaymentMethod as PrismaPaymentMethod,
  InvoiceStatus as PrismaInvoiceStatus,
} from "@prisma/client"

// Re-export Prisma enums
export type { 
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
  PaymentMethod,
  InvoiceStatus,
} from '@prisma/client'

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export interface Subscription {
  id: string
  userId: string
  plan: PrismaSubscriptionPlan
  status: PrismaSubscriptionStatus
  billingCycle: PrismaBillingCycle
  amount: number // In paise/cents
  currency: string
  startDate: Date
  endDate: Date
  trialEndDate: Date | null
  autoRenew: boolean
  paymentMethod: PrismaPaymentMethod | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// INVOICE TYPES
// ============================================

export interface Invoice {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: PrismaInvoiceStatus
  invoiceDate: Date
  dueDate: Date
  paidDate: Date | null
  paymentMethod: PrismaPaymentMethod | null
  invoiceUrl: string | null
  createdAt: Date
}

// ============================================
// USAGE TRACKING TYPES
// ============================================

export interface UsageTracking {
  id: string
  userId: string
  periodStart: Date
  periodEnd: Date
  casesCount: number
  documentsCount: number
  storageUsedBytes: bigint
  aiAnalysesUsed: number
  createdAt: Date
  updatedAt: Date
}

// Usage stats with computed fields
export interface UsageStats {
  periodStart: Date
  periodEnd: Date
  casesCount: number
  documentsCount: number
  storageUsedGb: number // Converted from bytes
  aiAnalysesUsed: number
}

// ============================================
// PLAN FEATURES
// ============================================

export interface PlanFeatures {
  maxCases: number | 'unlimited'
  maxDocuments: number | 'unlimited'
  storageGb: number | 'unlimited'
  aiAnalysesPerMonth: number | 'unlimited'
  prioritySupport: boolean
  apiAccess: boolean
  customBranding: boolean
  teamMembers: number | 'unlimited'
}

// ============================================
// PLAN DETAILS
// ============================================

export interface PlanDetails {
  id: PrismaSubscriptionPlan
  name: string
  description: string
  priceMonthly: number // In rupees
  priceAnnually: number // In rupees
  features: PlanFeatures
  popular: boolean
}

// Plan configurations
export const PLAN_DETAILS: Record<PrismaSubscriptionPlan, PlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    description: 'Perfect for getting started',
    priceMonthly: 0,
    priceAnnually: 0,
    features: {
      maxCases: 5,
      maxDocuments: 20,
      storageGb: 1,
      aiAnalysesPerMonth: 10,
      prioritySupport: false,
      apiAccess: false,
      customBranding: false,
      teamMembers: 1,
    },
    popular: false,
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Professional',
    description: 'For individual advocates',
    priceMonthly: 999,
    priceAnnually: 9990, // ~17% discount
    features: {
      maxCases: 'unlimited',
      maxDocuments: 'unlimited',
      storageGb: 50,
      aiAnalysesPerMonth: 'unlimited',
      prioritySupport: true,
      apiAccess: true,
      customBranding: false,
      teamMembers: 1,
    },
    popular: true,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For law firms and organizations',
    priceMonthly: 4999,
    priceAnnually: 49990, // ~17% discount
    features: {
      maxCases: 'unlimited',
      maxDocuments: 'unlimited',
      storageGb: 'unlimited',
      aiAnalysesPerMonth: 'unlimited',
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
      teamMembers: 'unlimited',
    },
    popular: false,
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPlanDetails(plan: PrismaSubscriptionPlan): PlanDetails {
  return PLAN_DETAILS[plan]
}

export function convertBytesToGb(bytes: bigint | number): number {
  const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes
  return numBytes / (1024 * 1024 * 1024)
}

export function convertGbToBytes(gb: number): bigint {
  return BigInt(Math.floor(gb * 1024 * 1024 * 1024))
}

export function formatCurrency(amountInPaise: number, currency: string = 'INR'): string {
  const amount = amountInPaise / 100
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`
  }
  return `${currency} ${amount.toLocaleString()}`
}

export function isFeatureAvailable(
  subscription: Subscription,
  feature: keyof PlanFeatures
): boolean {
  const planDetails = getPlanDetails(subscription.plan)
  const featureValue = planDetails.features[feature]
  
  if (typeof featureValue === 'boolean') {
    return featureValue
  }
  
  return featureValue === 'unlimited' || featureValue > 0
}

export function isUsageLimitReached(
  usage: UsageStats,
  subscription: Subscription,
  metric: 'cases' | 'documents' | 'storage' | 'aiAnalyses'
): boolean {
  const planDetails = getPlanDetails(subscription.plan)
  
  switch (metric) {
    case 'cases':
      return planDetails.features.maxCases !== 'unlimited' && 
             usage.casesCount >= planDetails.features.maxCases
    case 'documents':
      return planDetails.features.maxDocuments !== 'unlimited' && 
             usage.documentsCount >= planDetails.features.maxDocuments
    case 'storage':
      return planDetails.features.storageGb !== 'unlimited' && 
             usage.storageUsedGb >= planDetails.features.storageGb
    case 'aiAnalyses':
      return planDetails.features.aiAnalysesPerMonth !== 'unlimited' && 
             usage.aiAnalysesUsed >= planDetails.features.aiAnalysesPerMonth
    default:
      return false
  }
}

export function getUsagePercentage(
  usage: UsageStats,
  subscription: Subscription,
  metric: 'cases' | 'documents' | 'storage' | 'aiAnalyses'
): number {
  const planDetails = getPlanDetails(subscription.plan)
  
  let used = 0
  let limit: number | 'unlimited' = 'unlimited'
  
  switch (metric) {
    case 'cases':
      used = usage.casesCount
      limit = planDetails.features.maxCases
      break
    case 'documents':
      used = usage.documentsCount
      limit = planDetails.features.maxDocuments
      break
    case 'storage':
      used = usage.storageUsedGb
      limit = planDetails.features.storageGb
      break
    case 'aiAnalyses':
      used = usage.aiAnalysesUsed
      limit = planDetails.features.aiAnalysesPerMonth
      break
  }
  
  if (limit === 'unlimited') return 0
  return Math.min((used / limit) * 100, 100)
}

// ============================================
// TRANSFORMATION HELPERS
// ============================================

export function transformSubscription(data: any): Subscription {
  return {
    id: data.id,
    userId: data.user_id || data.userId,
    plan: data.plan,
    status: data.status,
    billingCycle: data.billing_cycle || data.billingCycle,
    amount: data.amount,
    currency: data.currency,
    startDate: new Date(data.start_date || data.startDate),
    endDate: new Date(data.end_date || data.endDate),
    trialEndDate: data.trial_end_date || data.trialEndDate ? new Date(data.trial_end_date || data.trialEndDate) : null,
    autoRenew: data.auto_renew ?? data.autoRenew ?? true,
    paymentMethod: data.payment_method || data.paymentMethod || null,
    createdAt: new Date(data.created_at || data.createdAt),
    updatedAt: new Date(data.updated_at || data.updatedAt),
  }
}

export function transformInvoice(data: any): Invoice {
  return {
    id: data.id,
    subscriptionId: data.subscription_id || data.subscriptionId,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    invoiceDate: new Date(data.invoice_date || data.invoiceDate),
    dueDate: new Date(data.due_date || data.dueDate),
    paidDate: data.paid_date || data.paidDate ? new Date(data.paid_date || data.paidDate) : null,
    paymentMethod: data.payment_method || data.paymentMethod || null,
    invoiceUrl: data.invoice_url || data.invoiceUrl || null,
    createdAt: new Date(data.created_at || data.createdAt),
  }
}

export function transformUsageStats(data: any): UsageStats {
  return {
    periodStart: new Date(data.period_start || data.periodStart),
    periodEnd: new Date(data.period_end || data.periodEnd),
    casesCount: data.cases_count || data.casesCount || 0,
    documentsCount: data.documents_count || data.documentsCount || 0,
    storageUsedGb: convertBytesToGb(data.storage_used_bytes || data.storageUsedBytes || 0),
    aiAnalysesUsed: data.ai_analyses_used || data.aiAnalysesUsed || 0,
  }
}