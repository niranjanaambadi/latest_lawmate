// src/lib/ai/processors/relief-evaluator.ts
import { ClaudeClient } from '../core/claude-client';
import { CaseBundle } from '../core/case-bundle-processor';

export interface ReliefOption {
  relief: string;
  type: 'INTERIM' | 'FINAL';
  legalBasis: string[];
  thresholdRequirements: string[];
  feasibilityScore: number; // 0-100
  grantLikelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  caseStrengthRequired: 'PRIMA_FACIE' | 'STRONG' | 'VERY_STRONG';
  urgencyFactors: string[];
  similarCaseOutcomes: Array<{
    citation: string;
    outcome: 'GRANTED' | 'DENIED' | 'CONDITIONAL';
    conditions?: string[];
  }>;
  affidavitSupportNeeded: string[];
  undertakingsRequired: string[];
}

export interface PrayerRecommendation {
  recommendedPrayers: ReliefOption[];
  sequencing: {
    primary: string[];
    alternative: string[];
    rationale: string;
  };
  suggestedLanguage: Record<string, string>;
  prayersToAvoid: Array<{
    prayer: string;
    reason: string;
  }>;
  oralSubmissionStrategy: {
    openingPoints: string[];
    emphasize: string[];
    deemphasize: string[];
  };
}

export class ReliefEvaluator {
  constructor(private claude: ClaudeClient) {}

  async evaluate(
    bundle: CaseBundle,
    caseType: string
  ): Promise<PrayerRecommendation> {
    const context = this.buildContext(bundle);
    
    const prompt = `Evaluate interim and final relief options for this ${caseType} case.

Assess each potential relief:
1. Stay of proceedings
2. Bail/bail modification
3. Direction to investigate
4. Quashing of FIR/proceedings
5. Protection from arrest
6. Transfer of investigation
7. Any other appropriate relief

For each relief analyze:
- Legal basis (Article 226, Cr.P.C. sections)
- Threshold requirements
- Kerala HC grant likelihood based on similar cases
- Case strength required
- Urgency factors
- Affidavit support needed
- Undertakings/bonds required

Provide:
- Feasibility ranked reliefs
- Optimal prayer sequencing (primary vs alternative)
- Suggested prayer language (Kerala HC style)
- Prayers that might trigger dismissal
- First hearing oral submission strategy

Kerala HC specific:
- Actual interim relief grant rates in similar cases
- Specific factors Kerala benches consider
- CJ/bench practice directions on urgent criminal relief

Respond in JSON format matching PrayerRecommendation interface.`;

    const response = await this.claude.analyzeWithCache(
      prompt,
      context,
      `Case Type: ${caseType}`,
      8192
    );

    return JSON.parse(response);
  }

  async evaluateUrgency(
    bundle: CaseBundle,
    reliefSought: string
  ): Promise<{
    isUrgent: boolean;
    urgencyScore: number; // 0-100
    urgencyFactors: string[];
    timelineCritical: boolean;
    recommendedApproach: string;
  }> {
    const prompt = `Evaluate urgency for this relief: ${reliefSought}

Case context:
${bundle.petition?.extractedText || ''}

Assess:
1. Genuine urgency vs routine matter
2. Irreparable harm factors
3. Timeline criticality
4. Appropriate approach (mention in court, urgent listing, etc.)

Respond in JSON format.`;

    const response = await this.claude.analyze(prompt, '', 2048);
    return JSON.parse(response);
  }

  private buildContext(bundle: CaseBundle): string {
    return `# Case Context\n\n## Petition\n${bundle.petition?.extractedText || ''}\n\n## Relief Sought\n[Extract from petition]`;
  }
}