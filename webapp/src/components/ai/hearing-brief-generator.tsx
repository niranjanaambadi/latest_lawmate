// src/components/ai/hearing-brief-generator.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Loader2, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface HearingBriefGeneratorProps {
  caseId: string;
}

const FOCUS_AREAS = [
  { id: 'facts', label: 'Key Facts Summary' },
  { id: 'arguments', label: 'Main Arguments' },
  { id: 'precedents', label: 'Critical Precedents' },
  { id: 'counter', label: 'Counter-Arguments & Responses' },
  { id: 'constitutional', label: 'Constitutional Grounds' },
  { id: 'relief', label: 'Relief & Strategy' },
  { id: 'changes', label: 'Changes Since Last Hearing' },
  { id: 'contradictions', label: 'Contradictions to Address' }
];

export function HearingBriefGenerator({ caseId }: HearingBriefGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [hearingDate, setHearingDate] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    'facts',
    'arguments',
    'precedents',
    'counter'
  ]);

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const generateBrief = async () => {
    if (!hearingDate) {
      toast.error('Please select a hearing date');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/hearing-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hearingDate,
          focusAreas: selectedAreas
        })
      });

      if (!response.ok) throw new Error('Failed to generate brief');

      const data = await response.json();
      setBrief(data.content);
      toast.success('Hearing brief generated successfully');
    } catch (error) {
      console.error('Error generating brief:', error);
      toast.error('Failed to generate hearing brief');
    } finally {
      setGenerating(false);
    }
  };

  const copyBrief = () => {
    if (brief) {
      navigator.clipboard.writeText(brief);
      toast.success('Brief copied to clipboard');
    }
  };

  const downloadBrief = () => {
    if (brief) {
      const blob = new Blob([brief], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hearing-brief-${hearingDate}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Brief downloaded');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate Hearing Brief
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Hearing Day Brief</DialogTitle>
        </DialogHeader>

        {!brief ? (
          <div className="space-y-6 py-4">
            {/* Hearing Date */}
            <div className="space-y-2">
              <Label htmlFor="hearingDate">Hearing Date</Label>
              <div className="flex gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground mt-2" />
                <Input
                  id="hearingDate"
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-3">
              <Label>Focus Areas</Label>
              <div className="grid grid-cols-2 gap-3">
                {FOCUS_AREAS.map((area) => (
                  <div key={area.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={area.id}
                      checked={selectedAreas.includes(area.id)}
                      onCheckedChange={() => toggleArea(area.id)}
                    />
                    <label
                      htmlFor={area.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {area.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateBrief}
              disabled={generating || !hearingDate}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Brief...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Brief
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              This will analyze your case bundle and generate a concise brief optimized for court preparation.
              Not a rewritten petition - just key points for hearing day.
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Actions */}
            <div className="flex gap-2 mb-4">
              <Button variant="outline" onClick={copyBrief} size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={downloadBrief} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setBrief(null)} 
                size="sm"
                className="ml-auto"
              >
                Generate New Brief
              </Button>
            </div>

            {/* Brief Content */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-6 h-full overflow-y-auto prose prose-sm max-w-none">
                <ReactMarkdown>{brief}</ReactMarkdown>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}