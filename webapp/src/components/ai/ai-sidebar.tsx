// src/components/ai/ai-sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Scale, 
  Shield, 
  AlertTriangle,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface AISidebarProps {
  caseId: string;
  currentSection?: string; // e.g., "facts", "arguments", "relief"
  onInsertText?: (text: string) => void;
}

interface ContextualSuggestion {
  type: 'precedent' | 'constitutional' | 'counter' | 'improvement';
  title: string;
  content: string;
  relevance: number;
  action?: string;
}

export function AISidebar({ caseId, currentSection, onInsertText }: AISidebarProps) {
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');

  useEffect(() => {
    if (currentSection) {
      loadContextualSuggestions();
    }
  }, [currentSection]);

  const loadContextualSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/ai-insights/contextual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: currentSection })
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertSuggestion = (text: string) => {
    if (onInsertText) {
      onInsertText(text);
      toast.success('Text inserted');
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="w-96 border-l bg-background h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Contextual insights for {currentSection || 'this section'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="suggestions">
            <Sparkles className="w-4 h-4 mr-1" />
            Hints
          </TabsTrigger>
          <TabsTrigger value="precedents">
            <Scale className="w-4 h-4 mr-1" />
            Cases
          </TabsTrigger>
          <TabsTrigger value="warnings">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Risks
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="suggestions" className="p-4 space-y-3 mt-0">
            {loading ? (
              <SidebarSkeleton />
            ) : suggestions.length === 0 ? (
              <EmptySidebar
                title="No suggestions yet"
                description="Start writing to get AI-powered suggestions"
              />
            ) : (
              suggestions
                .filter(s => s.type !== 'counter')
                .map((suggestion, index) => (
                  <SuggestionCard
                    key={index}
                    suggestion={suggestion}
                    onInsert={insertSuggestion}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="precedents" className="p-4 space-y-3 mt-0">
            <PrecedentSidebar caseId={caseId} currentSection={currentSection} />
          </TabsContent>

          <TabsContent value="warnings" className="p-4 space-y-3 mt-0">
            <WarningsSidebar caseId={caseId} currentSection={currentSection} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t bg-muted/50">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={loadContextualSuggestions}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh Suggestions
        </Button>
      </div>
    </div>
  );
}

function SuggestionCard({ 
  suggestion, 
  onInsert 
}: { 
  suggestion: ContextualSuggestion;
  onInsert: (text: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const Icon = 
    suggestion.type === 'precedent' ? Scale :
    suggestion.type === 'constitutional' ? Shield :
    suggestion.type === 'counter' ? AlertTriangle :
    Sparkles;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <Icon className="w-4 h-4 mt-1 text-primary" />
            <div>
              <CardTitle className="text-sm leading-tight">
                {suggestion.title}
              </CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                {(suggestion.relevance * 100).toFixed(0)}% relevant
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronRight 
              className={`w-4 h-4 transition-transform ${
                expanded ? 'rotate-90' : ''
              }`}
            />
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-muted-foreground">
            {suggestion.content}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onInsert(suggestion.content)}
            >
              <Copy className="w-3 h-3 mr-1" />
              Insert
            </Button>
            {suggestion.action && (
              <Button variant="outline" size="sm">
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function PrecedentSidebar({ 
  caseId, 
  currentSection 
}: { 
  caseId: string; 
  currentSection?: string;
}) {
  const [precedents, setPrecedents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrecedents();
  }, [currentSection]);

  const loadPrecedents = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/ai-insights/precedents-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: currentSection })
      });
      const data = await response.json();
      setPrecedents(data.precedents || []);
    } catch (error) {
      console.error('Failed to load precedents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SidebarSkeleton />;

  if (precedents.length === 0) {
    return (
      <EmptySidebar
        title="No precedents yet"
        description="Relevant case law will appear here as you write"
      />
    );
  }

  return (
    <div className="space-y-3">
      {precedents.slice(0, 5).map((precedent, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <Badge variant="outline" className="w-fit mb-2">
              {precedent.court}
            </Badge>
            <CardTitle className="text-sm leading-tight">
              {precedent.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">
              {precedent.citation}
            </p>
            <p className="text-sm">
              {precedent.relevantPrinciple}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => {
                navigator.clipboard.writeText(precedent.citationFormat);
                toast.success('Citation copied');
              }}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Citation
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WarningsSidebar({ 
  caseId, 
  currentSection 
}: { 
  caseId: string; 
  currentSection?: string;
}) {
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarnings();
  }, [currentSection]);

  const loadWarnings = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/ai-insights/warnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: currentSection })
      });
      const data = await response.json();
      setWarnings(data.warnings || []);
    } catch (error) {
      console.error('Failed to load warnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SidebarSkeleton />;

  if (warnings.length === 0) {
    return (
      <EmptySidebar
        title="No issues detected"
        description="Your current section looks good"
      />
    );
  }

  return (
    <div className="space-y-3">
      {warnings.map((warning, index) => (
        <Card 
          key={index}
          className={
            warning.severity === 'FATAL' ? 'border-destructive' :
            warning.severity === 'HIGH' ? 'border-orange-500' :
            ''
          }
        >
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 mt-1 ${
                warning.severity === 'FATAL' ? 'text-destructive' :
                warning.severity === 'HIGH' ? 'text-orange-500' :
                'text-yellow-500'
              }`} />
              <div className="flex-1">
                <CardTitle className="text-sm leading-tight">
                  {warning.issue}
                </CardTitle>
                <Badge 
                  variant={warning.severity === 'FATAL' ? 'destructive' : 'secondary'}
                  className="text-xs mt-1"
                >
                  {warning.severity}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">{warning.description}</p>
            {warning.suggestion && (
              <div className="bg-muted p-2 rounded text-sm">
                <span className="font-semibold">Suggestion: </span>
                {warning.suggestion}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptySidebar({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-8">
      <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}