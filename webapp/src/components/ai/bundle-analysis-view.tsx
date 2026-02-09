// src/components/ai/bundle-analysis-view.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BundleAnalysisViewProps {
  data: {
    keyFacts: string[];
    changes: Array<{
      stage: string;
      description: string;
      impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    }>;
    contradictions: Array<{
      documents: string[];
      issue: string;
      description: string;
    }>;
    reliefMapping: Array<{
      reliefSought: string;
      status: string;
      oppositionArguments: string[];
    }>;
    argumentPoints: Array<{
      topic: string;
      petitionerPosition: string;
      respondentPosition: string;
      strength: 'STRONG' | 'MODERATE' | 'WEAK';
    }>;
  };
}

export function BundleAnalysisView({ data }: BundleAnalysisViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Facts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.keyFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-semibold text-muted-foreground">
                  {i + 1}.
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Case Timeline & Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.changes.map((change, i) => {
              const Icon = 
                change.impact === 'POSITIVE' ? TrendingUp :
                change.impact === 'NEGATIVE' ? TrendingDown :
                Minus;
              
              return (
                <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <Icon className={`h-5 w-5 mt-0.5 ${
                    change.impact === 'POSITIVE' ? 'text-green-500' :
                    change.impact === 'NEGATIVE' ? 'text-red-500' :
                    'text-gray-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{change.stage}</span>
                      <Badge variant={
                        change.impact === 'POSITIVE' ? 'default' :
                        change.impact === 'NEGATIVE' ? 'destructive' :
                        'secondary'
                      }>
                        {change.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {change.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {data.contradictions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <h4 className="font-semibold mb-2">
              Contradictions Detected ({data.contradictions.length})
            </h4>
            <div className="space-y-3">
              {data.contradictions.map((contradiction, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium">{contradiction.issue}</p>
                  <p className="text-destructive-foreground/80">
                    {contradiction.description}
                  </p>
                  <p className="text-xs mt-1">
                    Documents: {contradiction.documents.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="relief">
        <TabsList>
          <TabsTrigger value="relief">Relief Mapping</TabsTrigger>
          <TabsTrigger value="arguments">Arguments</TabsTrigger>
        </TabsList>

        <TabsContent value="relief" className="space-y-4">
          {data.reliefMapping.map((relief, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">{relief.reliefSought}</CardTitle>
                <Badge>{relief.status}</Badge>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2">Opposition Arguments:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {relief.oppositionArguments.map((arg, j) => (
                    <li key={j} className="text-sm">{arg}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="arguments" className="space-y-4">
          {data.argumentPoints.map((point, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{point.topic}</CardTitle>
                  <Badge variant={
                    point.strength === 'STRONG' ? 'default' :
                    point.strength === 'MODERATE' ? 'secondary' :
                    'destructive'
                  }>
                    {point.strength}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-1">
                    Petitioner's Position
                  </h4>
                  <p className="text-sm">{point.petitionerPosition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-red-700 dark:text-red-400 mb-1">
                    Respondent's Position
                  </h4>
                  <p className="text-sm">{point.respondentPosition}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}