// src/components/ai/counter-analysis-view.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Target,
  FileText,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CounterArgument {
  category: 'FACTUAL_DISPUTE' | 'LEGAL_DEFENSE' | 'PROCEDURAL_OBJECTION' | 'ALTERNATIVE_REMEDY';
  argument: string;
  likelihood: number; // 0-100
  basis: string;
  suggestedResponse: string;
  evidenceNeeded: string[];
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface FactualDispute {
  fact: string;
  petitionerClaim: string;
  likelyDenial: string;
  preemptiveStrategy: string;
}

interface DefenseStrategy {
  defense: string;
  howToCounter: string;
  precedentsToUse: string[];
}

interface CounterAnticipation {
  predictedCounterArguments: CounterArgument[];
  factualDisputes: FactualDispute[];
  legalDefenses: DefenseStrategy[];
  proceduralObjections: string[];
  expectedTone: 'AGGRESSIVE' | 'DEFENSIVE' | 'TECHNICAL' | 'BALANCED';
  responseStrategy: {
    immediate: string[];
    reply: string[];
    oral: string[];
  };
  evidenceGaps: Array<{
    gap: string;
    impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    remedy: string;
  }>;
}

interface CounterAnalysisViewProps {
  data: CounterAnticipation;
}

export function CounterAnalysisView({ data }: CounterAnalysisViewProps) {
  const highLikelihood = data.predictedCounterArguments.filter(arg => arg.likelihood >= 70);
  const mediumLikelihood = data.predictedCounterArguments.filter(arg => arg.likelihood >= 40 && arg.likelihood < 70);
  const lowLikelihood = data.predictedCounterArguments.filter(arg => arg.likelihood < 40);

  const criticalGaps = data.evidenceGaps.filter(gap => gap.impact === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Counter-Argument Anticipation</CardTitle>
            </div>
            <Badge variant="outline">
              {data.predictedCounterArguments.length} Arguments Predicted
            </Badge>
          </div>
          <CardDescription>
            Predicted respondent arguments and strategic response plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {highLikelihood.length}
              </div>
              <div className="text-sm text-muted-foreground">High Likelihood</div>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {mediumLikelihood.length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Likelihood</div>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-950">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">
                {lowLikelihood.length}
              </div>
              <div className="text-sm text-muted-foreground">Low Likelihood</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Expected Respondent Tone:</span>
            <Badge variant="outline">{data.expectedTone}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Critical Evidence Gaps */}
      {criticalGaps.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Evidence Gaps Detected</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {criticalGaps.map((gap, i) => (
                <div key={i} className="text-sm">
                  <p className="font-semibold">{gap.gap}</p>
                  <p className="text-xs mt-1">Remedy: {gap.remedy}</p>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="arguments">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="arguments">
            Counter-Arguments ({highLikelihood.length})
          </TabsTrigger>
          <TabsTrigger value="factual">
            Factual Disputes ({data.factualDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="legal">
            Legal Defenses ({data.legalDefenses.length})
          </TabsTrigger>
          <TabsTrigger value="strategy">Response Strategy</TabsTrigger>
        </TabsList>

        {/* Counter Arguments */}
        <TabsContent value="arguments" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {/* High Likelihood */}
              {highLikelihood.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                    High Likelihood Arguments
                  </h3>
                  {highLikelihood.map((arg, i) => (
                    <CounterArgumentCard key={i} argument={arg} />
                  ))}
                </div>
              )}

              {/* Medium Likelihood */}
              {mediumLikelihood.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    Medium Likelihood Arguments
                  </h3>
                  {mediumLikelihood.map((arg, i) => (
                    <CounterArgumentCard key={i} argument={arg} />
                  ))}
                </div>
              )}

              {/* Low Likelihood */}
              {lowLikelihood.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-400">
                    Low Likelihood Arguments
                  </h3>
                  {lowLikelihood.map((arg, i) => (
                    <CounterArgumentCard key={i} argument={arg} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Factual Disputes */}
        <TabsContent value="factual" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {data.factualDisputes.map((dispute, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dispute.fact}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                          YOUR CLAIM
                        </h4>
                        <p className="text-sm">{dispute.petitionerClaim}</p>
                      </div>

                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
                          LIKELY DENIAL
                        </h4>
                        <p className="text-sm">{dispute.likelyDenial}</p>
                      </div>
                    </div>

                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertTitle>Preemptive Strategy</AlertTitle>
                      <AlertDescription className="text-sm">
                        {dispute.preemptiveStrategy}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Legal Defenses */}
        <TabsContent value="legal" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {data.legalDefenses.map((defense, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {defense.defense}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">How to Counter</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {defense.howToCounter}
                      </p>
                    </div>

                    {defense.precedentsToUse.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Precedents to Use</h4>
                          <ul className="space-y-1">
                            {defense.precedentsToUse.map((precedent, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                {precedent}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Response Strategy */}
        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Immediate Response (In Petition)</CardTitle>
              <CardDescription>
                Arguments to preemptively address in your initial petition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.responseStrategy.immediate.map((strategy, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {strategy}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reply Affidavit Strategy</CardTitle>
              <CardDescription>
                Points to address in your reply affidavit after counter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.responseStrategy.reply.map((strategy, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {strategy}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oral Submission Points</CardTitle>
              <CardDescription>
                Key points to emphasize during oral arguments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.responseStrategy.oral.map((strategy, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {strategy}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Procedural Objections */}
          {data.proceduralObjections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Anticipated Procedural Objections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.proceduralObjections.map((objection, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {objection}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Evidence Gaps */}
          {data.evidenceGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evidence Gaps to Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.evidenceGaps.map((gap, i) => (
                    <Alert key={i} variant={gap.impact === 'CRITICAL' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {gap.gap}
                        <Badge variant={
                          gap.impact === 'CRITICAL' ? 'destructive' :
                          gap.impact === 'HIGH' ? 'default' :
                          'secondary'
                        }>
                          {gap.impact}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="text-sm mt-2">
                        <strong>Remedy:</strong> {gap.remedy}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CounterArgumentCard({ argument }: { argument: CounterArgument }) {
  const categoryLabels = {
    FACTUAL_DISPUTE: 'Factual Dispute',
    LEGAL_DEFENSE: 'Legal Defense',
    PROCEDURAL_OBJECTION: 'Procedural Objection',
    ALTERNATIVE_REMEDY: 'Alternative Remedy'
  };

  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 70) return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    if (likelihood >= 40) return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
  };

  return (
    <Card className={getLikelihoodColor(argument.likelihood)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{categoryLabels[argument.category]}</Badge>
              <Badge variant={
                argument.strength === 'HIGH' ? 'destructive' :
                argument.strength === 'MEDIUM' ? 'default' :
                'secondary'
              }>
                {argument.strength} Strength
              </Badge>
            </div>
            <CardTitle className="text-lg">{argument.argument}</CardTitle>
          </div>
          <div className="text-2xl font-bold ml-4">
            {argument.likelihood}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">Basis</h4>
          <p className="text-sm text-muted-foreground">{argument.basis}</p>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Suggested Response
          </h4>
          <Alert>
            <AlertDescription className="text-sm leading-relaxed">
              {argument.suggestedResponse}
            </AlertDescription>
          </Alert>
        </div>

        {argument.evidenceNeeded.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">Evidence Needed</h4>
              <ul className="space-y-1">
                {argument.evidenceNeeded.map((evidence, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}