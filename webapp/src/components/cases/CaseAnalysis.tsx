// src/components/cases/CaseAnalysis.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UrgencyBadge } from "@/components/shared/UrgencyBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSkeleton, CardSkeleton } from "@/components/shared/LoadingSkeleton"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { analysisApi } from "@/lib/api/analysis"
import {
  Sparkles,
  AlertCircle,
  BookOpen,
  Scale,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import { parseAnalysisContent } from "@/types/analysis"
import { toast } from "sonner"

interface CaseAnalysisProps {
  caseId: string
}

export function CaseAnalysis({ caseId }: CaseAnalysisProps) {
  const queryClient = useQueryClient()

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ["ai-analysis", caseId],
    queryFn: () => analysisApi.getAIAnalysis(caseId),
    retry: 1,
  })

  const triggerAnalysisMutation = useMutation({
    mutationFn: () => analysisApi.triggerAIAnalysis(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-analysis", caseId] })
      toast.success("Analysis started successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to trigger analysis")
    },
  })

  const retryAnalysisMutation = useMutation({
    mutationFn: () => analysisApi.retryAIAnalysis(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-analysis", caseId] })
      toast.success("Analysis retrying...")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to retry analysis")
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  // No analysis exists yet
  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<Sparkles className="h-8 w-8 text-slate-400" />}
            title="AI analysis not available"
            message="This case hasn't been analyzed yet. Trigger an analysis to get AI-powered insights."
            action={
              <Button 
                onClick={() => triggerAnalysisMutation.mutate()}
                disabled={triggerAnalysisMutation.isPending}
              >
                {triggerAnalysisMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Case
                  </>
                )}
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  // Analysis is processing
  if (analysis.status === 'PROCESSING') {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<Loader2 className="h-8 w-8 text-blue-500 animate-spin" />}
            title="Analysis in progress"
            message="Your case is being analyzed. This may take a few minutes."
          />
        </CardContent>
      </Card>
    )
  }

  // Analysis failed
  if (analysis.status === 'FAILED') {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<AlertCircle className="h-8 w-8 text-red-500" />}
            title="Analysis failed"
            message={analysis.errorMessage || "An error occurred during analysis"}
            action={
              <Button 
                onClick={() => retryAnalysisMutation.mutate()}
                disabled={retryAnalysisMutation.isPending}
                variant="destructive"
              >
                {retryAnalysisMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Analysis
                  </>
                )}
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  // Parse the analysis content from JSON
  const analysisContent = parseAnalysisContent(analysis.analysis)

  if (!analysisContent) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<AlertCircle className="h-8 w-8 text-amber-500" />}
            title="Analysis incomplete"
            message="The analysis data is not available or corrupted."
            action={
              <Button onClick={() => retryAnalysisMutation.mutate()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Analysis
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  AI Case Analysis
                </h3>
                <p className="text-sm text-slate-600">
                  Generated by {analysis.modelVersion} •{" "}
                  {analysis.processedAt &&
                    formatDate(new Date(analysis.processedAt), "PPP")}
                </p>
                {analysis.tokenCount && (
                  <p className="text-xs text-slate-500 mt-1">
                    {analysis.tokenCount.toLocaleString()} tokens used
                  </p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => triggerAnalysisMutation.mutate()}
              disabled={triggerAnalysisMutation.isPending}
            >
              {triggerAnalysisMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Case Summary */}
      {analysisContent.caseSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Case Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              {analysisContent.caseSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Priority & Deadlines */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Priority Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UrgencyBadge level={analysisContent.urgencyLevel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisContent.deadlineReminders && analysisContent.deadlineReminders.length > 0 ? (
              <div className="space-y-3">
                {analysisContent.deadlineReminders.map((reminder, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {reminder.task}
                      </h4>
                      <Badge
                        variant={
                          reminder.priority === 'CRITICAL'
                            ? "destructive"
                            : reminder.priority === 'HIGH'
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {reminder.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      Due: {formatDate(new Date(reminder.dueDate), "PPP")}
                    </p>
                    {reminder.description && (
                      <p className="text-xs text-slate-600 mt-1">
                        {reminder.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No deadlines identified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Legal Issues */}
      {analysisContent.keyLegalIssues && analysisContent.keyLegalIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-600" />
              Key Legal Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisContent.keyLegalIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Relevant Statutes */}
      {analysisContent.relevantStatutes && analysisContent.relevantStatutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Relevant Statutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysisContent.relevantStatutes.map((statute, i) => (
                <Badge key={i} variant="outline">
                  {statute}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Precedent Cases */}
      {analysisContent.precedentCases && analysisContent.precedentCases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relevant Precedents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisContent.precedentCases.map((precedent, i) => (
                <div
                  key={i}
                  className="border-l-4 border-indigo-600 pl-4 py-2"
                >
                  <h4 className="font-bold text-slate-900 mb-1">
                    {precedent.name}
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    {precedent.citation}
                  </p>
                  <p className="text-sm text-slate-700">
                    {precedent.relevance}
                  </p>
                  {precedent.summary && (
                    <p className="text-xs text-slate-600 mt-2 italic">
                      {precedent.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {(analysisContent.strengths || analysisContent.weaknesses) && (
        <div className="grid gap-6 md:grid-cols-2">
          {analysisContent.strengths && analysisContent.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisContent.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysisContent.weaknesses && analysisContent.weaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-700">Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisContent.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Action Items */}
      {analysisContent.actionItems && analysisContent.actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside">
              {analysisContent.actionItems.map((item, i) => (
                <li key={i} className="text-slate-700">
                  {item}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysisContent.recommendations && analysisContent.recommendations.length > 0 && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader>
            <CardTitle className="text-indigo-900">
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisContent.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}