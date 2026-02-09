// src/lib/ai/processors/counter-anticipator.ts
import { ClaudeClient } from '../core/claude-client';
import { CaseBundle } from '../core/case-bundle-processor';

export interface PredictedCounterPoint {
  issue: string;
  factualAssertion?: string;
  likelyToAdmit: boolean;
  likelyToDeny: boolean;
  anticipatedDenialReason?: string;
}

export interface LegalDefense {
  defense: string;
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  legalBasis: string;
  caselaw: string[];
  petitionerResponse: string;
  evidenceToCounter: string[];
}

export interface CounterAffidavitPrediction {
  predictedFactualResponses: PredictedCounterPoint[];
  predictedLegalDefenses: LegalDefense[];
  proceduralDefenses: string[];
  expectedTone: 'AGGRESSIVE' | 'DEFENSIVE' | 'TECHNICAL';
  dangerousArguments: Array<{
    argument: string;
    risk: string;
    response: string;
  }>;
  strategicRecommendations: string[];
  additionalEvidenceNeeded: string[];
  contingencyPlans: Array<{
    scenario: string;
    response: string;
  }>;
}

export class CounterAnticipator {
  constructor(private claude: ClaudeClient) {}

  async anticipate(
    bundle: CaseBundle,
    respondentType: string
  ): Promise<CounterAffidavitPrediction> {
    const context = this.buildContext(bundle);
    
    const prompt = `Predict the respondent's counter-affidavit strategy and arguments.

Respondent: ${respondentType}

Analyze based on:
1. Standard Government of Kerala responses in WP Cr cases
2. Typical police/prosecution arguments in Kerala HC
3. Previous responses by this respondent authority (if context available)
4. Factual assertions likely to be admitted vs denied
5. Legal and procedural defenses available
6. Counter-arguments to petitioner's legal grounds

Predict:
- Point-by-point factual response
- Legal defenses with likelihood assessment
- Procedural/technical defenses
- Expected tone and emphasis
- Which arguments are dangerous vs easily rebuttable
- Evidence petitioner should gather preemptively
- If-then contingency plans

Respond in JSON format matching CounterAffidavitPrediction interface.`;

    const response = await this.claude.analyzeWithCache(
      prompt,
      context,
      `Respondent Type: ${respondentType}`,
      8192
    );

    return JSON.parse(response);
  }

  async analyzeActualCounter(
    bundle: CaseBundle,
    prediction: CounterAffidavitPrediction
  ): Promise<{
    accuracyScore: number;
    surprisingArguments: string[];
    responseStrategy: string;
    rejoinderPoints: Array<{
      counterPoint: string;
      response: string;
      evidence: string[];
    }>;
  }> {
    if (!bundle.counter) {
      throw new Error('No counter affidavit available');
    }

    const prompt = `Compare predicted counter-affidavit with actual counter filed.

Predicted:
${JSON.stringify(prediction, null, 2)}

Actual Counter:
${bundle.counter.extractedText}

Analyze:
1. Prediction accuracy
2. Surprising or unexpected arguments
3. Optimal rejoinder strategy
4. Point-by-point rejoinder responses

Respond in JSON format.`;

    const response = await this.claude.analyze(prompt, '', 6144);
    return JSON.parse(response);
  }

  private buildContext(bundle: CaseBundle): string {
    return `# Case Context\n\n## Petition\n${bundle.petition?.extractedText || ''}\n\n## Annexures Summary\n${bundle.annexures.map(a => a.title).join(', ')}`;
  }
}