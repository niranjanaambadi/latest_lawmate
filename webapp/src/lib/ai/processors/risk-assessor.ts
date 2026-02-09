// src/lib/ai/processors/risk-assessor.ts
import { ClaudeClient } from '../core/claude-client';
import { CaseBundle } from '../core/case-bundle-processor';

export interface Weakness {
  category: 'EVIDENCE_GAP' | 'LEGAL_ARGUMENT' | 'PROCEDURAL' | 'FACTUAL_DISPUTE';
  severity: 'FATAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  impact: string;
  counterArgument: string;
  mitigationStrategy: string;
  suggestedEvidence?: string[];
}

export interface CounterArgumentPrediction {
  argument: string;
  likelihood: number;
  suggestedResponse: string;
  evidenceNeeded: string[];
}

export interface RiskAssessment {
  overallScore: number; // 0-100
  caseStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  weaknesses: Weakness[];
  counterArguments: CounterArgumentPrediction[];
  fatalFlaws: string[];
  strengths: string[];
  recommendations: string[];
}

export class RiskAssessor {
  constructor(private claude: ClaudeClient) {}

  async assess(bundle: CaseBundle, caseType: string): Promise<RiskAssessment> {
    const context = this.buildContext(bundle);
    
    const prompt = `Perform comprehensive risk assessment for this ${caseType} case.

Analyze:
1. Evidence gaps and weaknesses
2. Vulnerable legal arguments
3. Factual disputes likely to arise
4. Procedural risks (alternative remedy, maintainability)
5. Predict respondent's counter-arguments
6. Identify fatal flaws
7. Assess overall case strength

Kerala HC specific considerations:
- Kerala HC bench approaches to similar cases
- Standard prosecution counter-arguments in Kerala
- Kerala HC jurisprudence conflicts

Respond in JSON format matching RiskAssessment interface.`;

    const response = await this.claude.analyzeWithCache(
      prompt,
      context,
      `Case Type: ${caseType}`,
      8192
    );

    return JSON.parse(response);
  }

  private buildContext(bundle: CaseBundle): string {
    let context = `# Case Analysis Context\n\n`;
    
    if (bundle.petition) {
      context += `## Petition\n${bundle.petition.extractedText}\n\n`;
    }
    
    if (bundle.counter) {
      context += `## Respondent's Counter\n${bundle.counter.extractedText}\n\n`;
    }

    return context;
  }
}