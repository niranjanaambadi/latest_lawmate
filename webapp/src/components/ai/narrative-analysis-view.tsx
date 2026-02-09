// src/components/ai/narrative-analysis-view.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp,
  FileText,
  Lightbulb,
  Eye,
  BarChart3
} from 'lucide-react';
import { NarrativeAnalysis } from '@/lib/ai/processors/narrative-optimizer';

interface NarrativeAnalysisViewProps {
  data: NarrativeAnalysis;
}

export function NarrativeAnalysisView({ data }: NarrativeAnalysisViewProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Narrative Quality Score</CardTitle>
              <CardDescription>
                Overall effectiveness of petition narrative
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                {data.overallScore}
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
              <Badge variant={
                data.overallScore >= 80 ? 'default' :
                data.overallScore >= 60 ? 'secondary' :
                'destructive'
              }>
                {data.overallScore >= 80 ? 'Excellent' :
                 data.overallScore >= 60 ? 'Good' :
                 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Reader Engagement</span>
                <span className="text-sm text-muted-foreground">
                  {data.persuasiveness.readerEngagement}%
                </span>
              </div>
              <Progress value={data.persuasiveness.readerEngagement} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Persuasiveness</span>
                <span className="text-sm text-muted-foreground">
                  {data.persuasiveness.overallScore}%
                </span>
              </div>
              <Progress value={data.persuasiveness.overallScore} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Logical Flow</span>
                <span className="text-sm text-muted-foreground">
                  {data.logicalFlow.score}%
                </span>
              </div>
              <Progress value={data.logicalFlow.score} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sections">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="revisions">Revisions</TabsTrigger>
          <TabsTrigger value="sequence">Sequencing</TabsTrigger>
          <TabsTrigger value="bench">Bench View</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
        </TabsList>

        {/* Sections Analysis Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section-by-Section Analysis</CardTitle>
              <CardDescription>
                Detailed evaluation of each petition section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.sections.map((section, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{section.sectionName}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {section.currentText.substring(0, 100)}...
                      </p>
                    </div>
                    <Badge variant={
                      section.clarity === 'EXCELLENT' ? 'default' :
                      section.clarity === 'GOOD' ? 'secondary' :
                      section.clarity === 'FAIR' ? 'outline' :
                      'destructive'
                    }>
                      {section.clarity}
                    </Badge>
                  </div>

                  {section.issues.length > 0 && (
                    <div className="bg-destructive/10 rounded p-3">
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Issues Identified
                      </h5>
                      <ul className="text-sm space-y-1">
                        {section.issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.suggestions.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-3">
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Suggestions
                      </h5>
                      <ul className="text-sm space-y-1">
                        {section.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.revisedText && (
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Revised Text
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revision Suggestions Tab */}
        <TabsContent value="revisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Revision Suggestions ({data.revisionSuggestions.length})
              </CardTitle>
              <CardDescription>
                Specific improvements to enhance clarity and persuasiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Group by priority */}
              {(['HIGH', 'MEDIUM', 'LOW'] as const).map(priority => {
                const suggestions = data.revisionSuggestions.filter(
                  s => s.priority === priority
                );
                
                if (suggestions.length === 0) return null;

                return (
                  <div key={priority}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Badge variant={
                        priority === 'HIGH' ? 'destructive' :
                        priority === 'MEDIUM' ? 'secondary' :
                        'outline'
                      }>
                        {priority} Priority
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        ({suggestions.length} suggestions)
                      </span>
                    </h4>

                    <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.issueType.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {suggestion.location}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {suggestion.rationale}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                Before:
                              </span>
                              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded text-sm">
                                {suggestion.before}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                After:
                              </span>
                              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded text-sm">
                                {suggestion.after}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Apply Change
                            </Button>
                            <Button variant="ghost" size="sm">
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Redundancy Report */}
          {data.redundancyReport.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Redundancy Detection</CardTitle>
                <CardDescription>
                  Repeated content that should be consolidated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.redundancyReport.map((item, index) => (
                  <div 
                    key={index}
                    className="border rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">
                        {item.occurrences} occurrences
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-2">{item.text}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Found in: {item.locations.join(', ')}
                    </p>
                    <Alert>
                      <AlertDescription className="text-sm">
                        <strong>Action:</strong> {item.actionRequired}
                      </AlertDescription>
                    </Alert>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Argument Sequencing Tab */}
        <TabsContent value="sequence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimal Argument Sequencing</CardTitle>
              <CardDescription>
                Recommended order for maximum impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Expected Improvement:</strong>{' '}
                  {data.argumentSequence.impactImprovement}% increase in persuasiveness
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Rationale:</h4>
                <p className="text-sm text-muted-foreground">
                  {data.argumentSequence.rationale}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400">
                    Current Order
                  </h4>
                  <div className="space-y-2">
                    {data.argumentSequence.currentOrder.map((arg, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded"
                      >
                        <span className="font-bold text-lg text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="text-sm flex-1">{arg}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">
                    Suggested Order
                  </h4>
                  <div className="space-y-2">
                    {data.argumentSequence.suggestedOrder.map((arg, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded"
                      >
                        <span className="font-bold text-lg text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="text-sm flex-1">{arg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logical Flow Mapping */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Logical Flow Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.logicalFlow.flowMap.map((flow, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded"
                      >
                        <div className="flex-1 text-sm">{flow.from}</div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className={`h-4 w-4 ${
                            flow.connection === 'STRONG' ? 'text-green-500' :
                            flow.connection === 'WEAK' ? 'text-yellow-500' :
                            'text-red-500'
                          }`} />
                          <Badge variant={
                            flow.connection === 'STRONG' ? 'default' :
                            flow.connection === 'WEAK' ? 'secondary' :
                            'destructive'
                          } className="text-xs">
                            {flow.connection}
                          </Badge>
                        </div>
                        <div className="flex-1 text-sm">{flow.to}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bench Perspective Tab */}
        <TabsContent value="bench" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Judge's Perspective
              </CardTitle>
              <CardDescription>
                How a Kerala High Court judge would view this petition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">
                        {data.benchPerspective.timeToReview}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Estimated Review Time
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {data.benchPerspective.cognitiveLoad}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cognitive Load
                      </p>
                      <Badge className="mt-2" variant={
                        data.benchPerspective.cognitiveLoad === 'LOW' ? 'default' :
                        data.benchPerspective.cognitiveLoad === 'MEDIUM' ? 'secondary' :
                        'destructive'
                      }>
                        {data.benchPerspective.cognitiveLoad === 'LOW' ? 'Easy to Follow' :
                         data.benchPerspective.cognitiveLoad === 'MEDIUM' ? 'Moderate' :
                         'Complex'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Predicted Judge Reaction:</h4>
                  <Alert>
                    <AlertDescription>
                      {data.benchPerspective.judgeReactionPrediction}
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600 dark:text-green-400">
                      Strength Areas
                    </h4>
                    <ul className="space-y-2">
                      {data.benchPerspective.strengthAreas.map((strength, index) => (
                        <li 
                          key={index}
                          className="flex items-start gap-2 text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600 dark:text-red-400">
                      Weakness Areas
                    </h4>
                    <ul className="space-y-2">
                      {data.benchPerspective.weaknessAreas.map((weakness, index) => (
                        <li 
                          key={index}
                          className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded"
                        >
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Kerala HC Specific Considerations */}
              {data.keralaBenchConsiderations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Kerala HC Bench Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.keralaBenchConsiderations.map((consideration, index) => (
                        <li 
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="text-primary">•</span>
                          <span>{consideration}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alternative Structures Tab */}
        <TabsContent value="alternatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alternative Narrative Structures</CardTitle>
              <CardDescription>
                Different ways to organize your arguments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.alternativeStructures.map((structure, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {structure.structureName}
                        </CardTitle>
                        <CardDescription>
                          {structure.description}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {structure.suitability}%
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Suitability
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-sm mb-2 text-green-600 dark:text-green-400">
                          Pros
                        </h5>
                        <ul className="space-y-1">
                          {structure.pros.map((pro, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400">
                          Cons
                        </h5>
                        <ul className="space-y-1">
                          {structure.cons.map((con, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">Structure Outline:</h5>
                      <ol className="space-y-2">
                        {structure.outline.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <span className="font-bold text-muted-foreground">
                              {i + 1}.
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <Button variant="outline" className="w-full">
                      Use This Structure
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}