// src/app/(dashboard)/cases/[caseId]/ai-insights/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, FileText, Scale, Shield, AlertTriangle, FileCheck, Target } from 'lucide-react';
import { BundleAnalysisView } from '@/components/ai/bundle-analysis-view';
import { PrecedentAnalysisView } from '@/components/ai/precedent-analysis-view';
import { RiskAssessmentView } from '@/components/ai/risk-assessment-view';
import { RightsAnalysisView } from '@/components/ai/rights-analysis-view';
import { NarrativeOptimizerView } from '@/components/ai/narrative-optimizer-view';
import { CounterAnalysisView } from '@/components/ai/counter-analysis-view';
import { ReliefEvaluationView } from '@/components/ai/relief-evaluation-view';
export default function AIInsightsPage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<Record<string, any>>({});
  const [lastUpdated, setLastUpdated] = useState<Record<string, Date>>({});

  useEffect(() => {
    loadBundleAnalysis();
  }, [caseId]);

  const loadBundleAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/bundle-analysis`);
      const data = await response.json();
      setAnalyses(prev => ({ ...prev, bundle: data }));
    } catch (error) {
      console.error('Failed to load bundle analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async (type: string, forceRefresh = false) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: type, forceRefresh })
      });
      const result = await response.json();
      setAnalyses(prev => ({ ...prev, [type]: result.data }));
      setLastUpdated(prev => ({ ...prev, [type]: new Date(result.analyzedAt) }));
    } catch (error) {
      console.error(`Failed to load ${type} analysis:`, error);
    } finally {
      setLoading(false);
    }
  };

  const runBatchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/ai-insights/batch`, {
        method: 'POST'
      });
      const result = await response.json();
      
      setAnalyses(prev => ({
        ...prev,
        risk: result.phase1.risk,
        relief: result.phase1.relief,
        precedents: result.phase2.precedents,
        rights: result.phase2.rights
      }));

      setLastUpdated(prev => ({
        ...prev,
        risk: new Date(),
        relief: new Date(),
        precedents: new Date(),
        rights: new Date()
      }));
    } catch (error) {
      console.error('Batch analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">
            Comprehensive AI analysis for case preparation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runBatchAnalysis}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Run Full Analysis
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Status</CardTitle>
          <CardDescription>
            Overview of available AI analyses for this case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnalysisStatusCard
              title="Bundle Analysis"
              icon={FileText}
              status={analyses.bundle ? 'complete' : 'pending'}
              lastUpdated={lastUpdated.bundle}
              onClick={() => setActiveTab('bundle')}
            />
            <AnalysisStatusCard
              title="Risk Assessment"
              icon={AlertTriangle}
              status={analyses.risk ? 'complete' : 'pending'}
              lastUpdated={lastUpdated.risk}
              onClick={() => {
                setActiveTab('risk');
                if (!analyses.risk) loadAnalysis('risk');
              }}
            />
            <AnalysisStatusCard
              title="Precedents"
              icon={Scale}
              status={analyses.precedents ? 'complete' : 'pending'}
              lastUpdated={lastUpdated.precedents}
              onClick={() => {
                setActiveTab('precedents');
                if (!analyses.precedents) loadAnalysis('precedents');
              }}
            />
            <AnalysisStatusCard
              title="Rights Mapping"
              icon={Shield}
              status={analyses.rights ? 'complete' : 'pending'}
              lastUpdated={lastUpdated.rights}
              onClick={() => {
                setActiveTab('rights');
                if (!analyses.rights) loadAnalysis('rights');
              }}
            />
            <AnalysisStatusCard
              title="Narrative"
              icon={FileCheck}
              status={analyses.narrative ? 'complete' : 'pending'}
              lastUpdated={lastUpdated.narrative}
              onClick={() => {
                setActiveTab('narrative');
                if (!analyses.narrative) loadAnalysis('narrative');
              }}
            />
            <AnalysisStatusCard
              title="Counter-Arguments"
              icon={Target}
              status={analyses.counter ? 'complete' : 'pending'}
              lastUpdated={lastUpdated.counter}
              onClick={() => {
                setActiveTab('counter');
                if (!analyses.counter) loadAnalysis('counter');
              }}
            />
            <AnalysisStatusCard
              title="Relief Evaluation"
              icon={FileText}
              status={analyses.relief ? 'complete' : 'pending'}
              lastUpdated={lastUpdated.relief}
              onClick={() => {
                setActiveTab('relief');
                if (!analyses.relief) loadAnalysis('relief');
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bundle">Bundle</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="precedents">Precedents</TabsTrigger>
          <TabsTrigger value="rights">Rights</TabsTrigger>
          <TabsTrigger value="narrative">Narrative</TabsTrigger>
          <TabsTrigger value="counter">Counter</TabsTrigger>
          <TabsTrigger value="relief">Relief</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab analyses={analyses} />
        </TabsContent>

        <TabsContent value="bundle">
          {analyses.bundle ? (
            <BundleAnalysisView data={analyses.bundle} />
          ) : (
            <LoadingState message="Loading bundle analysis..." />
          )}
        </TabsContent>

        <TabsContent value="risk">
          {analyses.risk ? (
            <RiskAssessmentView data={analyses.risk} />
          ) : (
            <EmptyState
              title="Risk Assessment Not Generated"
              description="Click 'Run Analysis' to generate risk assessment"
              action={() => loadAnalysis('risk')}
            />
          )}
        </TabsContent>

        <TabsContent value="precedents">
          {analyses.precedents ? (
            <PrecedentAnalysisView data={analyses.precedents} />
          ) : (
            <EmptyState
              title="Precedent Analysis Not Generated"
              description="Click 'Run Analysis' to find relevant precedents"
              action={() => loadAnalysis('precedents')}
            />
          )}
        </TabsContent>

        <TabsContent value="rights">
          {analyses.rights ? (
            <RightsAnalysisView data={analyses.rights} />
          ) : (
            <EmptyState
              title="Rights Mapping Not Generated"
              description="Click 'Run Analysis' to map constitutional rights"
              action={() => loadAnalysis('rights')}
            />
          )}
        </TabsContent>

        <TabsContent value="narrative">
          {analyses.narrative ? (
            <NarrativeOptimizerView data={analyses.narrative} />
          ) : (
            <EmptyState
              title="Narrative Analysis Not Generated"
              description="Click 'Run Analysis' to optimize petition narrative"
              action={() => loadAnalysis('narrative')}
            />
          )}
        </TabsContent>

        <TabsContent value="counter">
          {analyses.counter ? (
            <CounterAnalysisView data={analyses.counter} />
          ) : (
            <EmptyState
              title="Counter-Argument Analysis Not Generated"
              description="Click 'Run Analysis' to anticipate counter-arguments"
              action={() => loadAnalysis('counter')}
            />
          )}
        </TabsContent>

        <TabsContent value="relief">
          {analyses.relief ? (
            <ReliefEvaluationView data={analyses.relief} />
          ) : (
            <EmptyState
              title="Relief Evaluation Not Generated"
              description="Click 'Run Analysis' to evaluate relief options"
              action={() => loadAnalysis('relief')}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalysisStatusCard({ 
  title, 
  icon: Icon, 
  status, 
  lastUpdated,
  onClick 
}: {
  title: string;
  icon: any;
  status: 'complete' | 'pending';
  lastUpdated?: Date;
  onClick: () => void;
}) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <Badge variant={status === 'complete' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </div>
        <h3 className="font-medium text-sm">{title}</h3>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            {lastUpdated.toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description: string; 
  action: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <Button onClick={action}>
            Run Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ analyses }: { analyses: Record<string, any> }) {
  const completedCount = Object.keys(analyses).length;
  const totalCount = 7;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Progress</CardTitle>
          <CardDescription>
            {completedCount} of {totalCount} analyses completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {analyses.risk && (
        <Card>
          <CardHeader>
            <CardTitle>Case Strength Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Overall Score</span>
                  <span className="text-2xl font-bold">
                    {analyses.risk.overallScore}%
                  </span>
                </div>
                <Badge 
                  variant={
                    analyses.risk.caseStrength === 'STRONG' ? 'default' :
                    analyses.risk.caseStrength === 'MODERATE' ? 'secondary' :
                    'destructive'
                  }
                >
                  {analyses.risk.caseStrength}
                </Badge>
              </div>
              {analyses.risk.fatalFlaws?.length > 0 && (
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">
                    Fatal Flaws Detected
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analyses.risk.fatalFlaws.map((flaw: string, i: number) => (
                      <li key={i} className="text-sm">{flaw}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {analyses.bundle && (
        <Card>
          <CardHeader>
            <CardTitle>Key Developments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyses.bundle.changes?.slice(0, 3).map((change: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <Badge 
                    variant={
                      change.impact === 'POSITIVE' ? 'default' :
                      change.impact === 'NEGATIVE' ? 'destructive' :
                      'secondary'
                    }
                    className="mt-0.5"
                  >
                    {change.impact}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{change.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      {change.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}