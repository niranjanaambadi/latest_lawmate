// src/lib/ai/processors/precedent-validator.ts
import { ClaudeClient } from '../core/claude-client';
import { CaseBundle } from '../core/case-bundle-processor';

export interface Precedent {
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

export interface PrecedentAnalysis {
  precedents: Precedent[];
  precedentMapping: {
    fact: string;
    supportingPrecedents: string[];
  }[];
  overallStrength: number;
}

export class PrecedentValidator {
  constructor(private claude: ClaudeClient) {}

  async validate(bundle: CaseBundle, caseType: string): Promise<PrecedentAnalysis> {
    const context = this.buildContext(bundle);
    
    const prompt = `Identify and analyze the most relevant precedents for this ${caseType} case.

Requirements:
1. Find 5-10 Kerala High Court and Supreme Court precedents
2. Prioritize Kerala HC precedents on WP Cr maintainability and similar facts
3. Include Cr.P.C. and Article 226 jurisdiction precedents
4. Provide semantic similarity, not just keyword matching

For each precedent provide:
- Full citation
- Relevance score (0-100)
- One-page summary
- Applicable facts matching current case
- Legal principles established
- How it supports current petition
- Distinguishing factors if any
- Citation format for petition

Respond in JSON format matching the PrecedentAnalysis interface.`;

    const response = await this.claude.analyzeWithCache(
      prompt,
      context,
      `Case Type: ${caseType}\nJurisdiction: Kerala High Court`,
      8192
    );

    return JSON.parse(response);
  }

  private buildContext(bundle: CaseBundle): string {
    return `# Current Case Details

## Facts
${bundle.petition?.extractedText || 'No petition available'}

## Legal Issues
[Extract from petition]

## Arguments Presented
[Extract key arguments]`;
  }
}