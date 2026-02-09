// src/components/ai/rights-analysis-view.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Scale, 
  BookOpen, 
  AlertCircle, 
  Copy, 
  Check,
  Shield 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConstitutionalRight {
  article: string;
  articleText: string;
  applicability: 'STRONG' | 'MODERATE' | 'WEAK';
  explanation: string;
  landmarkCases: Array<{
    citation: string;
    principle: string;
  }>;
  applicationToFacts: string;
  suggestedLanguage: string;
}

interface RightsMapping {
  applicableRights: ConstitutionalRight[];
  constitutionalFramework: {
    primaryRights: string[];
    supportingRights: string[];
    interaction: string;
  };
  caseTimeline: Array<{
    article: string;
    evolution: string;
  }>;
}

interface RightsAnalysisViewProps {
  data: RightsMapping;
}

export function RightsAnalysisView({ data }: RightsAnalysisViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const strongRights = data.applicableRights.filter(r => r.applicability === 'STRONG');
  const moderateRights = data.applicableRights.filter(r => r.applicability === 'MODERATE');
  const weakRights = data.applicableRights.filter(r => r.applicability === 'WEAK');

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Constitutional Rights Analysis</CardTitle>
            </div>
            <Badge variant="outline">
              {data.applicableRights.length} Rights Identified
            </Badge>
          </div>
          <CardDescription>
            Comprehensive mapping of constitutional protections applicable to your case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {strongRights.length}
              </div>
              <div className="text-sm text-muted-foreground">Strong Arguments</div>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {moderateRights.length}
              </div>
              <div className="text-sm text-muted-foreground">Moderate Arguments</div>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-950">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">
                {weakRights.length}
              </div>
              <div className="text-sm text-muted-foreground">Supporting Arguments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Constitutional Framework */}
      <Card>
        <CardHeader>
          <CardTitle>Constitutional Framework</CardTitle>
          <CardDescription>How multiple constitutional rights work together in your case</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Primary Rights
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.constitutionalFramework.primaryRights.map((right, i) => (
                <Badge key={i} variant="default" className="text-sm">
                  {right}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Supporting Rights
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.constitutionalFramework.supportingRights.map((right, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {right}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Rights Interaction Analysis</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.constitutionalFramework.interaction}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Applicable Rights Details */}
      <Tabs defaultValue="strong">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strong">
            Strong ({strongRights.length})
          </TabsTrigger>
          <TabsTrigger value="moderate">
            Moderate ({moderateRights.length})
          </TabsTrigger>
          <TabsTrigger value="weak">
            Supporting ({weakRights.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strong" className="space-y-4">
          {strongRights.map((right, index) => (
            <RightCard 
              key={index} 
              right={right} 
              index={index}
              copiedIndex={copiedIndex}
              onCopy={copyToClipboard}
            />
          ))}
        </TabsContent>

        <TabsContent value="moderate" className="space-y-4">
          {moderateRights.map((right, index) => (
            <RightCard 
              key={index} 
              right={right} 
              index={index + strongRights.length}
              copiedIndex={copiedIndex}
              onCopy={copyToClipboard}
            />
          ))}
        </TabsContent>

        <TabsContent value="weak" className="space-y-4">
          {weakRights.map((right, index) => (
            <RightCard 
              key={index} 
              right={right} 
              index={index + strongRights.length + moderateRights.length}
              copiedIndex={copiedIndex}
              onCopy={copyToClipboard}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Case Law Timeline */}
      {data.caseTimeline && data.caseTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Constitutional Jurisprudence Evolution</CardTitle>
            <CardDescription>
              How these constitutional arguments have developed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {data.caseTimeline.map((timeline, i) => (
                  <div key={i} className="relative pl-6 pb-4 border-l-2 border-muted-foreground/20 last:border-0">
                    <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary" />
                    <div className="space-y-2">
                      <Badge variant="outline">{timeline.article}</Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {timeline.evolution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RightCard({ 
  right, 
  index,
  copiedIndex,
  onCopy 
}: { 
  right: ConstitutionalRight;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}) {
  const strengthColors = {
    STRONG: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    MODERATE: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
    WEAK: 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'
  };

  return (
    <Card className={strengthColors[right.applicability]}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{right.article}</CardTitle>
              <Badge 
                variant={
                  right.applicability === 'STRONG' ? 'default' :
                  right.applicability === 'MODERATE' ? 'secondary' :
                  'outline'
                }
              >
                {right.applicability}
              </Badge>
            </div>
            <CardDescription className="text-sm italic">
              "{right.articleText}"
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Explanation */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Why This Right Applies</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {right.explanation}
          </p>
        </div>

        <Separator />

        {/* Application to Facts */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Application to Your Case
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {right.applicationToFacts}
          </p>
        </div>

        <Separator />

        {/* Landmark Cases */}
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Landmark Precedents
          </h4>
          <div className="space-y-3">
            {right.landmarkCases.map((landmarkCase, i) => (
              <div key={i} className="p-3 bg-background rounded-lg border">
                <p className="font-medium text-sm mb-1">{landmarkCase.citation}</p>
                <p className="text-xs text-muted-foreground">
                  {landmarkCase.principle}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Suggested Language */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Suggested Petition Language</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCopy(right.suggestedLanguage, index)}
            >
              {copiedIndex === index ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <Alert>
            <AlertDescription className="text-sm leading-relaxed whitespace-pre-wrap">
              {right.suggestedLanguage}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}