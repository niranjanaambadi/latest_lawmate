// src/lib/ai/processors/rights-mapper.ts
import { ClaudeClient } from '../core/claude-client';
import { CaseBundle } from '../core/case-bundle-processor';

export interface ConstitutionalRight {
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

export interface RightsMapping {
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

export class RightsMapper {
  constructor(private claude: ClaudeClient) {}

  async mapRights(bundle: CaseBundle): Promise<RightsMapping> {
    const context = this.buildContext(bundle);
    
    const prompt = `Identify ALL applicable constitutional rights for this WP Cr case.

Analyze:
1. Article 14 (Equality)
2. Article 19 (Freedoms - 19(1)(a), 19(1)(d), 19(1)(g))
3. Article 20 (Criminal procedure protections)
4. Article 21 (Life and personal liberty)
5. Article 226 (Writ jurisdiction)
6. Any other applicable Articles

For each applicable right:
- Strength of applicability
- Brief explanation
- Landmark cases (especially Kerala HC)
- How current facts engage this right
- Suggested petition language

Include:
- Constitutional framework showing how multiple rights work together
- Case law timeline showing evolution

Respond in JSON format matching RightsMapping interface.`;

    const response = await this.claude.analyzeWithCache(
      prompt,
      context,
      '',
      8192
    );

    return JSON.parse(response);
  }

  private buildContext(bundle: CaseBundle): string {
    return `# Case Facts and Arguments\n\n${bundle.petition?.extractedText || ''}`;
  }
}