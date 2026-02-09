// src/types/analysis.ts
import { 
  AIAnalysis as PrismaAIAnalysis,
  UrgencyLevel,
  AIAnalysisStatus,
  Prisma
} from '@prisma/client';

// Re-export Prisma enums
export type { UrgencyLevel, AIAnalysisStatus } from '@prisma/client';

// Analysis content structure (stored in JSON field)
export interface DeadlineReminder {
  task: string;
  dueDate: string;
  priority: UrgencyLevel;
  description?: string;
}

export interface PrecedentCase {
  name: string;
  citation: string;
  relevance: string;
  summary?: string;
}

export interface AnalysisContent {
  caseTypeClassification: string;
  keyLegalIssues: string[];
  relevantStatutes: string[];
  precedentCases: PrecedentCase[];
  actionItems: string[];
  urgencyLevel: UrgencyLevel;
  deadlineReminders: DeadlineReminder[];
  caseSummary: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  [key: string]: any; // Index signature for JsonValue compatibility
}

// Use Prisma's AIAnalysis as-is, don't extend
export type AIAnalysis = PrismaAIAnalysis;

// Helper type for AIAnalysis with parsed content
export type AIAnalysisWithContent = Omit<PrismaAIAnalysis, 'analysis'> & {
  analysis: AnalysisContent | null;
};

// Chat types for document Q&A
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  documentId: string;
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  tokenCount?: number;
  conversationId?: string;
}

// Additional analysis types for new AI features
export interface Weakness {
  category: 'EVIDENCE_GAP' | 'LEGAL_ARGUMENT' | 'PROCEDURAL' | 'FACTUAL_DISPUTE';
  severity: 'FATAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  impact: string;
  mitigationStrategy: string;
}

export interface RiskAssessmentResult {
  overallScore: number;
  caseStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  weaknesses: Weakness[];
  fatalFlaws: string[];
  strengths: string[];
  recommendations: string[];
}

export interface Precedent {
  citation: string;
  court: 'KERALA_HC' | 'SUPREME_COURT' | 'OTHER_HC';
  year: number;
  relevanceScore: number;
  summary: string;
  applicableFacts: string[];
  legalPrinciples: string[];
}

export interface PrecedentAnalysisResult {
  precedents: Precedent[];
  overallStrength: number;
}

export interface ConstitutionalRight {
  article: string;
  applicability: 'STRONG' | 'MODERATE' | 'WEAK';
  explanation: string;
  landmarkCases: Array<{
    citation: string;
    principle: string;
  }>;
}

export interface ConstitutionalRightsResult {
  applicableRights: ConstitutionalRight[];
}

export interface RecommendedRelief {
  relief: string;
  feasibilityScore: number;
  legalBasis: string[];
  requirements: string[];
}

export interface ReliefEvaluationResult {
  recommendedReliefs: RecommendedRelief[];
}

// Type guard helpers
export function isAnalysisContent(obj: any): obj is AnalysisContent {
  return (
    obj &&
    typeof obj === 'object' &&
    'caseTypeClassification' in obj &&
    'keyLegalIssues' in obj &&
    Array.isArray(obj.keyLegalIssues)
  );
}

export function parseAnalysisContent(json: Prisma.JsonValue): AnalysisContent | null {
  if (!json) return null;
  
  try {
    // json is already a JsonValue, no need to parse
    const data = json as any;
    
    if (isAnalysisContent(data)) {
      return data as AnalysisContent;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse analysis content:', error);
    return null;
  }
}

// Helper to convert AIAnalysis to AIAnalysisWithContent
export function parseAIAnalysis(analysis: AIAnalysis): AIAnalysisWithContent {
  return {
    ...analysis,
    analysis: parseAnalysisContent(analysis.analysis)
  };
}

// Helper to create AnalysisContent for database insertion
export function toJsonValue(content: AnalysisContent): Prisma.JsonValue {
  return content as Prisma.JsonValue;
}