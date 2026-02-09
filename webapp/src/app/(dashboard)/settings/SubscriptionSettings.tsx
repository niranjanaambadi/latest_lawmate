"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSubscription, usePlans, useUsageStats, useInvoices } from "@/lib/hooks/useSubscription"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import {
  CreditCard,
  Check,
  Crown,
  Download,
  Zap,
  Calendar,
  AlertCircle,
} from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import { cn } from "@/lib/utils/cn"
import type { PlanDetails } from "@/types/subscription"

export function SubscriptionSettings() {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly")

  const { data: subscription, isLoading: subLoading } = useSubscription()
  const { data: plans, isLoading: plansLoading } = usePlans()
  const { data: usage, isLoading: usageLoading } = useUsageStats()
  const { data: invoices } = useInvoices()

  if (subLoading || plansLoading || usageLoading) {
    return <LoadingSkeleton className="h-96 w-full" />
  }

  const currentPlan = plans?.find((p) => p.id === subscription?.plan)

  const getUsagePercentage = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0
    return (used / limit) * 100
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentPlan?.popular && (
                  <Crown className="h-5 w-5 text-amber-600" />
                )}
                Current Plan: {currentPlan?.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {currentPlan?.description}
              </CardDescription>
            </div>
            {/* <Badge
              variant={subscription?.status === "active" ? "success" : "warning"}
              className="text-xs"
            >
              {subscription?.status}
            </Badge> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Billing Cycle</div>
              <div className="font-bold text-slate-900 capitalize">
                {subscription?.billingCycle}
              </div>
            </div>

            <div className="rounded-lg bg-white border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Next Billing Date</div>
              <div className="font-bold text-slate-900">
                {subscription?.endDate &&
                  formatDate(subscription.endDate, "PP")}
              </div>
            </div>

            <div className="rounded-lg bg-white border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Amount</div>
              <div className="font-bold text-slate-900">
                ₹{subscription?.amount.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-slate-600">
                  /{subscription?.billingCycle}
                </span>
              </div>
            </div>
          </div>

          {/* {subscription?.status === "trial" && subscription.trialEndDate && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 mb-1">Trial Period</h4>
                <p className="text-sm text-amber-700">
                  Your trial expires on{" "}
                  {formatDate(subscription.trialEndDate, "PPP")}. Upgrade to
                  continue using premium features.
                </p>
              </div>
            </div>
          )} */}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-renew"
                checked={subscription?.autoRenew}
                disabled
              />
              <Label htmlFor="auto-renew" className="cursor-pointer">
                Auto-renewal {subscription?.autoRenew ? "enabled" : "disabled"}
              </Label>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(true)}
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>
            Current billing period: {usage?.periodStart && formatDate(usage.periodStart, "PP")} -{" "}
            {usage?.periodEnd && formatDate(usage.periodEnd, "PP")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cases */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-900">Cases</div>
              <div className="text-sm text-slate-600">
                {usage?.casesCount} /{" "}
                {currentPlan?.features.maxCases === "unlimited"
                  ? "∞"
                  : currentPlan?.features.maxCases}
              </div>
            </div>
            <Progress
              value={getUsagePercentage(
                usage?.casesCount || 0,
                currentPlan?.features.maxCases || 0
              )}
            />
          </div>

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-900">Documents</div>
              <div className="text-sm text-slate-600">
                {usage?.documentsCount} /{" "}
                {currentPlan?.features.maxDocuments === "unlimited"
                  ? "∞"
                  : currentPlan?.features.maxDocuments}
              </div>
            </div>
            <Progress
              value={getUsagePercentage(
                usage?.documentsCount || 0,
                currentPlan?.features.maxDocuments || 0
              )}
            />
          </div>

          {/* Storage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-900">Storage</div>
              <div className="text-sm text-slate-600">
                {usage?.storageUsedGb.toFixed(2)} GB /{" "}
                {currentPlan?.features.storageGb === "unlimited"
                  ? "∞"
                  : `${currentPlan?.features.storageGb} GB`}
              </div>
            </div>
            <Progress
              value={getUsagePercentage(
                usage?.storageUsedGb || 0,
                currentPlan?.features.storageGb || 0
              )}
            />
          </div>

          {/* AI Analyses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-900">
                AI Analyses (This Month)
              </div>
              <div className="text-sm text-slate-600">
                {usage?.aiAnalysesUsed} /{" "}
                {currentPlan?.features.aiAnalysesPerMonth === "unlimited"
                  ? "∞"
                  : currentPlan?.features.aiAnalysesPerMonth}
              </div>
            </div>
            <Progress
              value={getUsagePercentage(
                usage?.aiAnalysesUsed || 0,
                currentPlan?.features.aiAnalysesPerMonth || 0
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment and billing information
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Update
          </Button>
        </CardHeader>
        <CardContent>
          {subscription?.paymentMethod ? (
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 bg-slate-50">
              <div className="p-3 rounded-lg bg-indigo-100">
                <CreditCard className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 capitalize">
                  {subscription.paymentMethod}
                </div>
                <div className="text-sm text-slate-600">
                  Default payment method
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              No payment method configured
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <Calendar className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        Invoice #{invoice.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatDate(invoice.invoiceDate, "PPP")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        ₹{invoice.amount.toLocaleString("en-IN")}
                      </div>
                      {/* <Badge
                        variant={
                          invoice.status === "paid"
                            ? "success"
                            : invoice.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {invoice.status}
                      </Badge> */}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              No invoices yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Choose the plan that best fits your needs
            </DialogDescription>
          </DialogHeader>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 py-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                billingCycle === "monthly"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                billingCycle === "annually"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Annually
              <Badge variant="success" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>

          {/* Plans */}
          <div className="grid gap-4 md:grid-cols-3">
            {plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                currentPlan={currentPlan?.id}
                onSelect={() => setSelectedPlan(plan)}
              />
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PlanCard({
  plan,
  billingCycle,
  currentPlan,
  onSelect,
}: {
  plan: PlanDetails
  billingCycle: "monthly" | "annually"
  currentPlan?: string
  onSelect: () => void
}) {
  const price =
    billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnually

  const isCurrent = currentPlan === plan.id

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-lg",
        plan.popular && "border-2 border-indigo-500",
        isCurrent && "bg-slate-50"
      )}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plan.name}
          {isCurrent && <Badge variant="success">Current</Badge>}
        </CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-slate-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span className="text-slate-600">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
        </div>
        <p className="text-sm text-slate-600 mt-2">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              {plan.features.maxCases === "unlimited"
                ? "Unlimited"
                : plan.features.maxCases}{" "}
              cases
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              {plan.features.storageGb === "unlimited"
                ? "Unlimited"
                : `${plan.features.storageGb} GB`}{" "}
              storage
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              {plan.features.aiAnalysesPerMonth === "unlimited"
                ? "Unlimited"
                : plan.features.aiAnalysesPerMonth}{" "}
              AI analyses/month
            </span>
          </li>
          {plan.features.prioritySupport && (
            <li className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Priority support</span>
            </li>
          )}
          {plan.features.apiAccess && (
            <li className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>API access</span>
            </li>
          )}
        </ul>

        <Button
          className="w-full"
          variant={isCurrent ? "outline" : "default"}
          disabled={isCurrent}
          onClick={onSelect}
        >
          {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
        </Button>
      </CardContent>
    </Card>
  )
}