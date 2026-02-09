// src/components/ai/narrative-optimizer-view.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface NarrativeSection {
  section: string;
  currentText: string;
  issues: string[];
  clarity: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  suggestions: string[];
}

interface RevisionSuggestion {
  type: 'SIMPLIFICATION' | 'RESEQUENCING' | 'JARGON_REMOVAL' | 'RHETORICAL_ENHANCEMENT';
  location: string;
  before: string;
  after: string;
  rationale: string;
}

interface ArgumentSequence {
  currentOrder: string[];
  suggestedOrder: string[];
  rationale: string;
}

interface NarrativeAnalysis {
  overallScore: number; // 0-100
  structureAnalysis: {
    logicalFlow: number;
    argumentSequencing: number;
    clarity: number;
    persuasiveness: number;
  };
  sections: NarrativeSection[];
  revisionSuggestions: RevisionSuggestion[];
  argumentSequence: ArgumentSequence;
  toneAnalysis: {
    current: 'ASSERTIVE' | 'AGGRESSIVE' | 'CAUTIOUS' | 'BALANCED';
    recommendation: string;
  };
  benchPerspective: string;
  alternativeStructures: Array<{
    structure: string;
    pros: string[];
    cons: string[];
  }>;
}

interface NarrativeOptimizerViewProps {
  data: NarrativeAnalysis;
}

export function NarrativeOptimizerView({ data }: NarrativeOptimizerViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getClarityBadge = (clarity: string) => {
    const variants: Record<string, any> = {
      EXCELLENT: 'default',
      GOOD: 'secondary',
      FAIR: 'outline',
      POOR: 'destructive'
    };
    return variants[clarity] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Narrative Persuasiveness Analysis</CardTitle>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}/100
            </div>
          </div>
          <CardDescription>
            Comprehensive analysis of petition structure, clarity, and persuasive impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Logical Flow"
              value={data.structureAnalysis.logicalFlow}
              icon={TrendingUp}
            />
            <MetricCard
              label="Argument Sequencing"
              value={data.structureAnalysis.argumentSequencing}
              icon={ArrowRight}
            />
            <MetricCard
              label="Clarity"
              value={data.structureAnalysis.clarity}
              icon={CheckCircle2}
            />
            <MetricCard
              label="Persuasiveness"
              value={data.structureAnalysis.persuasiveness}
              icon={Lightbulb}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tone Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Tone Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Tone:</span>
            <Badge variant="outline" className="text-sm">
              {data.toneAnalysis.current}
            </Badge>
          </div>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Recommendation</AlertTitle>
            <AlertDescription className="text-sm">
              {data.toneAnalysis.recommendation}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bench Perspective */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Bench Perspective Analysis
          </CardTitle>
          <CardDescription>
            How a busy judge would likely react to your arguments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="text-sm leading-relaxed">
              {data.benchPerspective}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sections">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="sequencing">Sequencing</TabsTrigger>
          <TabsTrigger value="revisions">Revisions</TabsTrigger>
          <TabsTrigger value="alternatives">Structures</TabsTrigger>
        </TabsList>

        {/* Section Analysis */}
        <TabsContent value="sections" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {data.sections.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{section.section}</CardTitle>
                      <Badge variant={getClarityBadge(section.clarity)}>
                        {section.clarity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.issues.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Issues Identified
                        </h4>
                        <ul className="space-y-1">
                          {section.issues.map((issue, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.suggestions.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Improvement Suggestions
                          </h4>
                          <ul className="space-y-1">
                            {section.suggestions.map((suggestion, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                {suggestion}
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

        {/* Argument Sequencing */}
        <TabsContent value="sequencing">
          <Card>
            <CardHeader>
              <CardTitle>Optimal Argument Sequencing</CardTitle>
              <CardDescription>
                Recommended reordering for maximum persuasive impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-400">Current Order</span>
                  </h4>
                  <ol className="space-y-2">
                    {data.argumentSequence.currentOrder.map((arg, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">{i + 1}.</span>
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">Suggested Order</span>
                  </h4>
                  <ol className="space-y-2">
                    {data.argumentSequence.suggestedOrder.map((arg, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">{i + 1}.</span>
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <Separator />

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Rationale</AlertTitle>
                <AlertDescription className="text-sm leading-relaxed">
                  {data.argumentSequence.rationale}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revision Suggestions */}
        <TabsContent value="revisions" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {data.revisionSuggestions.map((revision, index) => (
                <RevisionCard key={index} revision={revision} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Alternative Structures */}
        <TabsContent value="alternatives" className="space-y-4">
          {data.alternativeStructures.map((structure, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{structure.structure}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-600 dark:text-green-400">
                    Advantages
                  </h4>
                  <ul className="space-y-1">
                    {structure.pros.map((pro, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400">
                    Disadvantages
                  </h4>
                  <ul className="space-y-1">
                    {structure.cons.map((con, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  const getColor = (val: number) => {
    if (val >= 80) return 'bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800';
    if (val >= 60) return 'bg-yellow-100 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800';
  };

  return (
    <div className={`p-4 rounded-lg border ${getColor(value)}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-2xl font-bold">{value}%</span>
      </div>
      <div className="text-sm font-medium">{label}</div>
      <Progress value={value} className="h-1 mt-2" />
    </div>
  );
}

function RevisionCard({ revision }: { revision: RevisionSuggestion }) {
  const typeIcons = {
    SIMPLIFICATION: FileText,
    RESEQUENCING: ArrowRight,
    JARGON_REMOVAL: AlertTriangle,
    RHETORICAL_ENHANCEMENT: Lightbulb
  };

  const typeLabels = {
    SIMPLIFICATION: 'Simplification',
    RESEQUENCING: 'Resequencing',
    JARGON_REMOVAL: 'Jargon Removal',
    RHETORICAL_ENHANCEMENT: 'Rhetorical Enhancement'
  };

  const Icon = typeIcons[revision.type];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{typeLabels[revision.type]}</CardTitle>
        </div>
        <CardDescription>{revision.location}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
              CURRENT
            </h4>
            <p className="text-sm">{revision.before}</p>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
              SUGGESTED
            </h4>
            <p className="text-sm">{revision.after}</p>
          </div>
        </div>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Why:</strong> {revision.rationale}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}