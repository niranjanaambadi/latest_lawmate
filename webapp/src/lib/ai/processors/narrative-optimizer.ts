// src/lib/ai/processors/narrative-optimizer.ts
import { ClaudeClient } from '../core/claude-client';
import { CaseBundle } from '../core/case-bundle-processor';

export interface NarrativeSection {
  sectionName: string;
  currentText: string;
  clarity: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  issues: string[];
  suggestions: string[];
  revisedText?: string;
}

export interface PersuasivenessMetrics {
  readerEngagement: number; // 0-100
  emotionalAppeal: number; // 0-100
  rationalAppeal: number; // 0-100
  tone: 'ASSERTIVE' | 'AGGRESSIVE' | 'CAUTIOUS' | 'BALANCED';
  emphasisScore: number; // 0-100
  overallScore: number; // 0-100
}

export interface ArgumentSequence {
  currentOrder: string[];
  suggestedOrder: string[];
  rationale: string;
  impactImprovement: number; // percentage
}

export interface RevisionSuggestion {
  location: string;
  issueType: 'SIMPLIFICATION' | 'RESEQUENCING' | 'JARGON' | 'EMPHASIS' | 'REDUNDANCY';
  before: string;
  after: string;
  rationale: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BenchPerspective {
  judgeReactionPrediction: string;
  strengthAreas: string[];
  weaknessAreas: string[];
  timeToReview: string; // estimated time judge needs
  cognitiveLoad: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AlternativeStructure {
  structureName: string;
  description: string;
  pros: string[];
  cons: string[];
  suitability: number; // 0-100
  outline: string[];
}

export interface NarrativeAnalysis {
  overallScore: number; // 0-100
  sections: NarrativeSection[];
  persuasiveness: PersuasivenessMetrics;
  argumentSequence: ArgumentSequence;
  revisionSuggestions: RevisionSuggestion[];
  benchPerspective: BenchPerspective;
  alternativeStructures: AlternativeStructure[];
  logicalFlow: {
    score: number;
    flowMap: Array<{
      from: string;
      to: string;
      connection: 'STRONG' | 'WEAK' | 'MISSING';
      improvement?: string;
    }>;
  };
  redundancyReport: Array<{
    text: string;
    occurrences: number;
    locations: string[];
    actionRequired: string;
  }>;
  keralaBenchConsiderations: string[];
}

export class NarrativeOptimizer {
  constructor(private claude: ClaudeClient) {}

  async optimize(bundle: CaseBundle): Promise<NarrativeAnalysis> {
    const context = this.buildContext(bundle);
    
    const prompt = `Analyze this petition's narrative structure, persuasiveness, and rhetorical effectiveness for Kerala High Court.

Provide comprehensive analysis covering:

1. **Narrative Structure Analysis**
   - Break down petition into logical sections
   - Evaluate clarity of each section (EXCELLENT/GOOD/FAIR/POOR)
   - Identify issues in each section
   - Provide specific improvement suggestions
   - Suggest revised text where needed

2. **Persuasiveness Metrics**
   - Reader engagement prediction (0-100)
   - Emotional vs rational appeal balance (0-100 each)
   - Tone analysis (assertive/aggressive/cautious/balanced)
   - Emphasis score (are critical points highlighted?)
   - Overall persuasiveness score (0-100)

3. **Argument Sequencing**
   - Current order of arguments
   - Optimal suggested order
   - Rationale for resequencing
   - Expected impact improvement

4. **Revision Suggestions** (at least 5-10 specific suggestions)
   - Location in document
   - Issue type (simplification/resequencing/jargon/emphasis/redundancy)
   - Before text (current)
   - After text (improved)
   - Rationale
   - Priority (HIGH/MEDIUM/LOW)

5. **Bench Perspective Analysis**
   - How would a busy Kerala HC judge react?
   - What would grab their attention?
   - What would cause confusion?
   - Estimated time to review
   - Cognitive load assessment

6. **Logical Flow Mapping**
   - Map dependencies between arguments
   - Identify strong vs weak connections
   - Suggest improvements for weak links

7. **Redundancy Detection**
   - Identify repeated points
   - Mark unnecessary repetition
   - Suggest consolidation

8. **Alternative Narrative Structures** (3-4 alternatives)
   - Different ways to organize arguments
   - Pros and cons of each
   - Suitability score
   - Outline of structure

9. **Kerala HC Specific Considerations**
   - Bench preferences for argument presentation
   - Local practice considerations
   - Successful narrative patterns in Kerala HC

Respond in JSON format matching the NarrativeAnalysis interface.

Focus on practical, actionable improvements that will make the petition more persuasive to Kerala High Court judges.`;

    const response = await this.claude.analyzeWithCache(
      prompt,
      context,
      'Perform detailed narrative optimization analysis',
      16000
    );

    return JSON.parse(response);
  }

  private buildContext(bundle: CaseBundle): string {
    let context = '# Petition Document for Narrative Analysis\n\n';
    
    if (bundle.petition) {
      context += `## Main Petition\n${bundle.petition.extractedText}\n\n`;
    }

    // Include any amendments or revised petitions
    const amendments = bundle.documents.filter(d => 
      d.title.toLowerCase().includes('amended') ||
      d.title.toLowerCase().includes('revised')
    );

    if (amendments.length > 0) {
      context += '## Amendments/Revisions\n';
      amendments.forEach(doc => {
        context += `### ${doc.title}\n${doc.extractedText}\n\n`;
      });
    }

    // Include context from counter if available (to understand what's being responded to)
    if (bundle.counter) {
      context += `## Respondent's Counter (for context)\n`;
      context += `${bundle.counter.extractedText.substring(0, 2000)}...\n\n`;
    }

    return context;
  }

  async optimizeSection(
    sectionText: string, 
    sectionName: string,
    context: string
  ): Promise<{
    originalText: string;
    optimizedText: string;
    improvements: string[];
    clarityImprovement: number;
  }> {
    const prompt = `Optimize this specific section of the petition for Kerala High Court.

Section Name: ${sectionName}

Current Text:
${sectionText}

Context:
${context}

Provide:
1. Optimized version of the text
2. List of specific improvements made
3. Clarity improvement score (0-100)

Make the text:
- Clear and concise
- Logically structured
- Persuasive yet professional
- Free of legal jargon where possible
- Emphasize key points effectively

Respond in JSON format:
{
  "originalText": "...",
  "optimizedText": "...",
  "improvements": ["improvement 1", "improvement 2"],
  "clarityImprovement": 75
}`;

    const response = await this.claude.analyze(prompt, '', 4096);
    return JSON.parse(response);
  }

  async generateAlternativeIntroductions(
    currentIntro: string,
    caseFacts: string[]
  ): Promise<Array<{
    title: string;
    text: string;
    approach: string;
    effectiveness: number;
  }>> {
    const prompt = `Generate 3 alternative introductions for this WP Cr petition.

Current Introduction:
${currentIntro}

Key Facts:
${caseFacts.join('\n')}

For each alternative, provide:
1. A title describing the approach
2. The full text of the introduction
3. Explanation of the approach taken
4. Effectiveness score (0-100) for Kerala HC

Approaches to consider:
- Factual and chronological
- Issue-focused and analytical
- Rights-based and constitutional
- Impact-focused and emotional

Respond in JSON array format.`;

    const response = await this.claude.analyze(prompt, '', 6000);
    return JSON.parse(response);
  }
}

// // src/lib/ai/processors/narrative-optimizer.ts
// import { ClaudeClient } from '../core/claude-client';

// export interface NarrativeSection {
//   sectionName: string;
//   currentText: string;
//   clarityScore: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
//   issues: string[];
//   suggestions: string[];
// }

// export interface ArgumentSequence {
//   currentOrder: string[];
//   suggestedOrder: string[];
//   rationale: string;
// }

// export interface RevisionSuggestion {
//   location: string;
//   issue: string;
//   currentText: string;
//   suggestedText: string;
//   rationale: string;
// }

// export interface PersuasivenessMetrics {
//   readerEngagement: number; // 0-100
//   emotionalRationalBalance: number; // 0-100 (50 is balanced)
//   tone: 'ASSERTIVE' | 'AGGRESSIVE' | 'CAUTIOUS' | 'BALANCED';
//   emphasisClarity: number; // 0-100
// }

// export interface NarrativeAnalysis {
//   sections: NarrativeSection[];
//   argumentSequence: ArgumentSequence;
//   persuasivenessMetrics: PersuasivenessMetrics;
//   revisionSuggestions: RevisionSuggestion[];
//   benchPerspective: {
//     likelyReaction: string;
//     attentionRisks: string[];
//     strengths: string[];
//   };
//   alternativeStructures: Array<{
//     name: string;
//     description: string;
//     pros: string[];
//     cons: string[];
//   }>;
// }

// export class NarrativeOptimizer {
//   constructor(private claude: ClaudeClient) {}

//   async optimize(petitionText: string, caseType: string): Promise<NarrativeAnalysis> {
//     const prompt = `Analyze this ${caseType} petition for narrative structure and persuasiveness.

// Evaluate:
// 1. Argument sequencing and logical flow
// 2. Clarity of each section
// 3. Redundancy and unnecessary verbosity
// 4. Persuasiveness metrics (engagement, tone, emphasis)
// 5. How a Kerala HC judge would react
// 6. Specific revision suggestions with examples

// Kerala HC specific:
// - Kerala HC bench preferences for argument presentation
// - Optimize for oral submissions style
// - Consider typical bench workload (clarity is critical)

// Provide:
// - Section-by-section analysis with scores
// - Optimal argument sequencing
// - Persuasiveness metrics
// - Before/after revision examples
// - Bench perspective analysis
// - Alternative narrative structures

// Petition text:
// ${petitionText}

// Respond in JSON format matching NarrativeAnalysis interface.`;

//     const response = await this.claude.analyze(prompt, '', 8192);
//     return JSON.parse(response);
//   }

//   async optimizeSection(
//     sectionText: string, 
//     sectionPurpose: string,
//     context: string
//   ): Promise<{
//     analysis: string;
//     revisedText: string;
//     improvements: string[];
//   }> {
//     const prompt = `Optimize this petition section for maximum persuasiveness.

// Section purpose: ${sectionPurpose}
// Context: ${context}

// Section text:
// ${sectionText}

// Provide:
// 1. Analysis of current effectiveness
// 2. Revised text (maintain legal accuracy)
// 3. List of specific improvements made

// Respond in JSON format.`;

//     const response = await this.claude.analyze(prompt, '', 4096);
//     return JSON.parse(response);
//   }
// }