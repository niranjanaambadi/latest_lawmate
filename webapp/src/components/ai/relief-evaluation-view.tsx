// src/components/ai/relief-evaluation-view.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  TrendingUp
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Relief {
  prayer: string;
  type: 'INTERIM' | 'FINAL' | 'ALTERNATIVE';
  feasibility: number; // 0-100
  legalBasis: string;
  thresholdRequirements: string[];
  requiredStrength: 'PRIMA_FACIE' | 'STRONG' | 'VERY_STRONG';
  urgencyFactors: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  affidavitSupport: string[];
  oralStrategy: string;
  precedentSupport: Array<{
    citation: string;
    grantRate: string;
    factors: string[];
  }>;
  undertakingRequired?: string;
  bondAmount?: string;
}

interface ReliefEvaluation {
  recommendedPrayers: Relief[];
  prayerSequencing: {
    primary: string[];
    alternative: string[];
    rationale: string;
  };
  interimReliefAnalysis: {
    likelihood: number;
    criticalFactors: string[];
    timingStrategy: string;
  };
  undertakingsRequired: Array<{
    relief: string;
    undertaking: string;
    purpose: string;
  }>;
  oralSubmissionPlan: {
    firstHearing: string[];
    subsequentHearings: string[];
    emphasis: string[];
  };
}

interface ReliefEvaluationViewProps {
  data: ReliefEvaluation;
}

export function ReliefEvaluationView({ data }: ReliefEvaluationViewProps) {
  const interimReliefs = data.recommendedPrayers.filter(r => r.type === 'INTERIM');
  const finalReliefs = data.recommendedPrayers.filter(r => r.type === 'FINAL');
  const alternativeReliefs = data.recommendedPrayers.filter(r => r.type === 'ALTERNATIVE');

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Relief Evaluation & Prayer Optimization</CardTitle>
            </div>
            <Badge variant="outline">
              {data.recommendedPrayers.length} Reliefs Analyzed
            </Badge>
          </div>
          <CardDescription>
            Strategic analysis of available reliefs and optimal prayer formulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {interimReliefs.length}
              </div>
              <div className="text-sm text-muted-foreground">Interim Reliefs</div>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {finalReliefs.length}
              </div>
              <div className="text-sm text-muted-foreground">Final Reliefs</div>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {alternativeReliefs.length}
              </div>
              <div className="text-sm text-muted-foreground">Alternatives</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interim Relief Analysis */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Interim Relief Likelihood
          </CardTitle>
          <CardDescription>
            Assessment of chances for immediate relief at first hearing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Grant Probability</span>
              <span className="text-2xl font-bold">
                {data.interimReliefAnalysis.likelihood}%
              </span>
            </div>
            <Progress value={data.interimReliefAnalysis.likelihood} className="h-2" />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Critical Success Factors</h4>
            <ul className="space-y-1">
              {data.interimReliefAnalysis.criticalFactors.map((factor, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <Alert>
            <Target className="h-4 w-4" />
            <AlertTitle>Timing Strategy</AlertTitle>
            <AlertDescription className="text-sm">
              {data.interimReliefAnalysis.timingStrategy}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="prayers">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prayers">Recommended Prayers</TabsTrigger>
          <TabsTrigger value="sequencing">Prayer Sequencing</TabsTrigger>
          <TabsTrigger value="undertakings">Undertakings</TabsTrigger>
          <TabsTrigger value="oral">Oral Strategy</TabsTrigger>
        </TabsList>

        {/* Recommended Prayers */}
        <TabsContent value="prayers" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-6 pr-4">
              {/* Interim Reliefs */}
              {interimReliefs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Interim Reliefs
                  </h3>
                  {interimReliefs.map((relief, i) => (
                    <ReliefCard key={i} relief={relief} />
                  ))}
                </div>
              )}

              {/* Final Reliefs */}
              {finalReliefs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Final Reliefs
                  </h3>
                  {finalReliefs.map((relief, i) => (
                    <ReliefCard key={i} relief={relief} />
                  ))}
                </div>
              )}

              {/* Alternative Reliefs */}
              {alternativeReliefs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Scale className="h-5 w-5 text-purple-500" />
                    Alternative Reliefs
                  </h3>
                  {alternativeReliefs.map((relief, i) => (
                    <ReliefCard key={i} relief={relief} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Prayer Sequencing */}
        <TabsContent value="sequencing">
          <Card>
            <CardHeader>
              <CardTitle>Optimal Prayer Sequencing</CardTitle>
              <CardDescription>
                Strategic ordering of prayers for maximum impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">
                  Primary Prayers (in order)
                </h4>
                <ol className="space-y-2">
                  {data.prayerSequencing.primary.map((prayer, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="font-semibold text-muted-foreground min-w-[1.5rem]">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span>{prayer}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">
                  Alternative/Additional Prayers
                </h4>
                <ol className="space-y-2">
                  {data.prayerSequencing.alternative.map((prayer, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="font-semibold text-muted-foreground min-w-[1.5rem]">
                        {String.fromCharCode(65 + data.prayerSequencing.primary.length + i)}.
                      </span>
                      <span>{prayer}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <Separator />

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Sequencing Rationale</AlertTitle>
                <AlertDescription className="text-sm leading-relaxed">
                  {data.prayerSequencing.rationale}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Undertakings */}
        <TabsContent value="undertakings" className="space-y-4">
          {data.undertakingsRequired.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No specific undertakings required for the requested reliefs
              </CardContent>
            </Card>
          ) : (
            data.undertakingsRequired.map((undertaking, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{undertaking.relief}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h4 className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                      REQUIRED UNDERTAKING
                    </h4>
                    <p className="text-sm">{undertaking.undertaking}</p>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Purpose:</strong> {undertaking.purpose}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Oral Submission Strategy */}
        <TabsContent value="oral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>First Hearing Strategy</CardTitle>
              <CardDescription>
                Key points to present at first hearing when seeking interim relief
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.oralSubmissionPlan.firstHearing.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-semibold text-primary min-w-[1.5rem]">{i + 1}.</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subsequent Hearings</CardTitle>
              <CardDescription>
                Arguments for follow-up hearings and final disposal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.oralSubmissionPlan.subsequentHearings.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-semibold text-primary min-w-[1.5rem]">{i + 1}.</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Points to Emphasize</CardTitle>
              <CardDescription>
                Critical points that must be strongly emphasized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.oralSubmissionPlan.emphasis.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-medium">
                    <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {point}
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

function ReliefCard({ relief }: { relief: Relief }) {
  const getFeasibilityColor = (feasibility: number) => {
    if (feasibility >= 70) return 'text-green-600 dark:text-green-400';
    if (feasibility >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'LOW') return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
    if (risk === 'MEDIUM') return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
  };

  return (
    <Card className={getRiskColor(relief.riskLevel)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{relief.type}</Badge>
              <Badge variant={relief.riskLevel === 'LOW' ? 'default' : relief.riskLevel === 'MEDIUM' ? 'secondary' : 'destructive'}>
                {relief.riskLevel} Risk
              </Badge>
              <Badge variant="outline">{relief.requiredStrength.replace('_', ' ')}</Badge>
            </div>
            <CardTitle className="text-lg">{relief.prayer}</CardTitle>
          </div>
          <div className="ml-4">
            <div className={`text-3xl font-bold ${getFeasibilityColor(relief.feasibility)}`}>
              {relief.feasibility}%
            </div>
            <div className="text-xs text-center text-muted-foreground">feasibility</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">Legal Basis</h4>
          <p className="text-sm text-muted-foreground">{relief.legalBasis}</p>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-2">Threshold Requirements</h4>
          <ul className="space-y-1">
            {relief.thresholdRequirements.map((req, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {relief.urgencyFactors.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Urgency Factors
              </h4>
              <ul className="space-y-1">
                {relief.urgencyFactors.map((factor, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-2">Required Affidavit Support</h4>
          <ul className="space-y-1">
            {relief.affidavitSupport.map((support, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                {support}
              </li>
            ))}
          </ul>
        </div>

        {relief.precedentSupport.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">Precedent Support</h4>
              <div className="space-y-2">
                {relief.precedentSupport.map((precedent, i) => (
                  <div key={i} className="p-2 bg-background rounded border text-sm">
                    <p className="font-medium">{precedent.citation}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Grant Rate: {precedent.grantRate}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {precedent.factors.map((factor, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span>•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {(relief.undertakingRequired || relief.bondAmount) && (
          <>
            <Separator />
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm">Undertaking/Bond Required</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {relief.undertakingRequired && <p>{relief.undertakingRequired}</p>}
                {relief.bondAmount && <p className="font-semibold mt-1">Bond: {relief.bondAmount}</p>}
              </AlertDescription>
            </Alert>
          </>
        )}

        <Separator />

        <Alert>
          <Target className="h-4 w-4" />
          <AlertTitle className="text-sm">Oral Submission Strategy</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            {relief.oralStrategy}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}