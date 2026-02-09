// src/components/ai/precedent-analysis-view.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Scale,
  Building2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Precedent {
  citation: string;
  title: string;
  court: 'KERALA_HC' | 'SUPREME_COURT' | 'OTHER_HC';
  year: number;
  relevanceScore: number;
  summary: string;
  applicableFacts: string[];
  legalPrinciples: string[];
  supportingArgument: string;
  distinguishingFactors?: string[];
  citationFormat: string;
}

interface PrecedentAnalysisViewProps {
  data: {
    precedents: Precedent[];
    precedentMapping: Array<{
      fact: string;
      supportingPrecedents: string[];
    }>;
    overallStrength: number;
  };
}

export function PrecedentAnalysisView({ data }: PrecedentAnalysisViewProps) {
  const [expandedPrecedent, setExpandedPrecedent] = useState<number | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string>('all');

  const filteredPrecedents = data.precedents.filter(p => 
    selectedCourt === 'all' || p.court === selectedCourt
  );

  const keralaPrecedents = data.precedents.filter(p => p.court === 'KERALA_HC');
  const scPrecedents = data.precedents.filter(p => p.court === 'SUPREME_COURT');

  const copyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    toast.success('Citation copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Precedent Strength Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Precedent Strength</span>
                <span className="text-2xl font-bold">{data.overallStrength}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${data.overallStrength}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {keralaPrecedents.length}
                </div>
                <div className="text-sm text-muted-foreground">Kerala HC</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scPrecedents.length}
                </div>
                <div className="text-sm text-muted-foreground">Supreme Court</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {data.precedents.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Court Filter */}
      <div className="flex gap-2">
        <Button
          variant={selectedCourt === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCourt('all')}
          size="sm"
        >
          All Courts
        </Button>
        <Button
          variant={selectedCourt === 'KERALA_HC' ? 'default' : 'outline'}
          onClick={() => setSelectedCourt('KERALA_HC')}
          size="sm"
        >
          Kerala HC
        </Button>
        <Button
          variant={selectedCourt === 'SUPREME_COURT' ? 'default' : 'outline'}
          onClick={() => setSelectedCourt('SUPREME_COURT')}
          size="sm"
        >
          Supreme Court
        </Button>
      </div>

      {/* Precedents List */}
      <div className="space-y-4">
        {filteredPrecedents
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .map((precedent, index) => {
            const isExpanded = expandedPrecedent === index;
            
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          precedent.court === 'KERALA_HC' ? 'default' :
                          precedent.court === 'SUPREME_COURT' ? 'secondary' :
                          'outline'
                        }>
                          {precedent.court === 'KERALA_HC' ? 'Kerala HC' :
                           precedent.court === 'SUPREME_COURT' ? 'Supreme Court' :
                           'Other HC'}
                        </Badge>
                        <Badge variant="outline">
                          <Scale className="w-3 h-3 mr-1" />
                          Relevance: {precedent.relevanceScore}%
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {precedent.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {precedent.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {precedent.citation}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCitation(precedent.citationFormat)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedPrecedent(isExpanded ? null : index)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Always Visible: Summary */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {precedent.summary}
                      </p>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <>
                        <div className="pt-4 border-t space-y-4">
                          {/* Applicable Facts */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2">
                              Applicable Facts
                            </h4>
                            <ul className="space-y-1">
                              {precedent.applicableFacts.map((fact, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{fact}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Legal Principles */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2">
                              Legal Principles Established
                            </h4>
                            <ul className="space-y-1">
                              {precedent.legalPrinciples.map((principle, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{principle}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Supporting Argument */}
                          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                              How This Precedent Supports Your Case
                            </h4>
                            <p className="text-sm text-green-800 dark:text-green-200">
                              {precedent.supportingArgument}
                            </p>
                          </div>

                          {/* Distinguishing Factors */}
                          {precedent.distinguishingFactors && 
                           precedent.distinguishingFactors.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm mb-2 text-amber-900 dark:text-amber-100">
                                Distinguishing Factors
                              </h4>
                              <ul className="space-y-1">
                                {precedent.distinguishingFactors.map((factor, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                                    <span className="mt-1">⚠</span>
                                    <span>{factor}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Citation Format */}
                          <div className="bg-secondary/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2">
                              Citation Format for Petition
                            </h4>
                            <code className="text-sm font-mono block">
                              {precedent.citationFormat}
                            </code>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Precedent Mapping */}
      <Card>
        <CardHeader>
          <CardTitle>Fact-to-Precedent Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.precedentMapping.map((mapping, index) => (
              <div key={index} className="pb-4 border-b last:border-0">
                <h4 className="font-semibold text-sm mb-2">{mapping.fact}</h4>
                <div className="flex flex-wrap gap-2">
                  {mapping.supportingPrecedents.map((citation, i) => (
                    <Badge key={i} variant="secondary">
                      {citation}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}