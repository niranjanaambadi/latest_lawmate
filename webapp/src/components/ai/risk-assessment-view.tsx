// src/components/ai/risk-assessment-view.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Shield,
  TrendingUp,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Weakness {
  category: 'EVIDENCE_GAP' | 'LEGAL_ARGUMENT' | 'PROCEDURAL' | 'FACTUAL_DISPUTE';
  severity: 'FATAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  impact: string;
  counterArgument: string;
  mitigationStrategy: string;
  suggestedEvidence?: string[];
}

interface CounterArgumentPrediction {
  argument: string;
  likelihood: number;
  suggestedResponse: string;
  evidenceNeeded: string[];
}

interface RiskAssessmentViewProps {
  data: {
    overallScore: number;
    caseStrength: 'STRONG' | 'MODERATE' | 'WEAK';
    weaknesses: Weakness[];
    counterArguments: CounterArgumentPrediction[];
    fatalFlaws: string[];
    strengths: string[];
    recommendations: string[];
  };
  onRefresh?: () => void;
}

export function RiskAssessmentView({ data, onRefresh }: RiskAssessmentViewProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'FATAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EVIDENCE_GAP': return '📄';
      case 'LEGAL_ARGUMENT': return '⚖️';
      case 'PROCEDURAL': return '📋';
      case 'FACTUAL_DISPUTE': return '🔍';
      default: return '📌';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>

      {/* Overall Score Card */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Case Strength</span>
            <Badge 
              variant={
                data.caseStrength === 'STRONG' ? 'default' :
                data.caseStrength === 'MODERATE' ? 'secondary' :
                'destructive'
              }
              className="text-xl px-6 py-2"
            >
              {data.caseStrength}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-3">
                <span className="font-medium text-lg">Risk Score</span>
                <span className="text-4xl font-bold text-purple-600">
                  {data.overallScore}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all ${
                    data.overallScore >= 70 ? 'bg-green-600' :
                    data.overallScore >= 50 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${data.overallScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {data.overallScore >= 70 ? 'Strong case with good prospects' :
                 data.overallScore >= 50 ? 'Moderate case, requires strengthening' :
                 'Weak case, significant issues to address'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fatal Flaws Alert */}
      {data.fatalFlaws.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            <h4 className="font-bold text-lg mb-3">
              🚨 Fatal Flaws Detected ({data.fatalFlaws.length})
            </h4>
            <p className="mb-3 text-sm">
              These issues could result in dismissal of the petition. Immediate attention required.
            </p>
            <ul className="space-y-2">
              {data.fatalFlaws.map((flaw, i) => (
                <li key={i} className="flex items-start gap-2 p-2 bg-destructive/10 rounded">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{flaw}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-sm flex-1">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['FATAL', 'HIGH', 'MEDIUM', 'LOW'].map(severity => {
                const count = data.weaknesses.filter(w => w.severity === severity).length;
                return (
                  <div key={severity} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{severity}</span>
                    <Badge variant={getSeverityColor(severity)}>
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="weaknesses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
          <TabsTrigger value="counter">Counter-Arguments</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="weaknesses" className="space-y-4 mt-6">
          {data.weaknesses
            .sort((a, b) => {
              const severityOrder = { FATAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
              return severityOrder[a.severity] - severityOrder[b.severity];
            })
            .map((weakness, i) => (
              <Card key={i} className={
                weakness.severity === 'FATAL' || weakness.severity === 'HIGH'
                  ? 'border-red-200'
                  : ''
              }>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{getCategoryIcon(weakness.category)}</span>
                      <div>
                        <CardTitle className="text-lg">
                          {weakness.category.replace(/_/g, ' ')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {weakness.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(weakness.severity)}>
                      {weakness.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1 text-red-700 dark:text-red-400">
                      Impact
                    </h4>
                    <p className="text-sm">{weakness.impact}</p>
                  </div>

                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1 text-orange-700 dark:text-orange-400">
                      Expected Counter-Argument
                    </h4>
                    <p className="text-sm">{weakness.counterArgument}</p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1 text-blue-700 dark:text-blue-400">
                      Mitigation Strategy
                    </h4>
                    <p className="text-sm">{weakness.mitigationStrategy}</p>
                  </div>

                  {weakness.suggestedEvidence && weakness.suggestedEvidence.length > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-400">
                        Suggested Evidence
                      </h4>
                      <ul className="space-y-1">
                        {weakness.suggestedEvidence.map((evidence, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600">•</span>
                            <span>{evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="counter" className="space-y-4 mt-6">
          {data.counterArguments
            .sort((a, b) => b.likelihood - a.likelihood)
            .map((counter, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex-1">
                      {counter.argument}
                    </CardTitle>
                    <Badge variant={
                      counter.likelihood >= 80 ? 'destructive' :
                      counter.likelihood >= 50 ? 'secondary' :
                      'outline'
                    }>
                      {counter.likelihood}% likely
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1 text-blue-700 dark:text-blue-400">
                      Suggested Response
                    </h4>
                    <p className="text-sm">{counter.suggestedResponse}</p>
                  </div>

                  {counter.evidenceNeeded.length > 0 && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-400">
                        Evidence Needed
                      </h4>
                      <ul className="space-y-1">
                        {counter.evidenceNeeded.map((evidence, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="text-purple-600">•</span>
                            <span>{evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <span className="font-bold text-purple-600 min-w-[24px]">
                      {i + 1}.
                    </span>
                    <span className="flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}