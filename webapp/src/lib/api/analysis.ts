// src/lib/api/analysis.ts
import { 
  AIAnalysis, 
  AnalysisContent,
  RiskAssessmentResult,
  PrecedentAnalysisResult,
  ConstitutionalRightsResult,
  ReliefEvaluationResult
} from '@/types/analysis';

/**
 * Fetch AI analysis for a case
 */
export async function getAIAnalysis(caseId: string): Promise<AIAnalysis | null> {
  try {
    const response = await fetch(`/api/cases/${caseId}/analysis`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch analysis');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error fetching AI analysis:', error);
    throw error;
  }
}

/**
 * Trigger AI analysis for a case
 */
export async function triggerAIAnalysis(caseId: string): Promise<AIAnalysis> {
  try {
    const response = await fetch(`/api/cases/${caseId}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to trigger analysis');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error triggering AI analysis:', error);
    throw error;
  }
}

/**
 * Retry failed AI analysis
 */
export async function retryAIAnalysis(caseId: string): Promise<AIAnalysis> {
  try {
    const response = await fetch(`/api/cases/${caseId}/analysis/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to retry analysis');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error retrying AI analysis:', error);
    throw error;
  }
}

/**
 * Get bundle analysis for a case
 */
export async function getBundleAnalysis(caseId: string) {
  try {
    const response = await fetch(`/api/ai/${caseId}/bundle-analysis`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch bundle analysis');
    }

    const data = await response.json();
    return {
      cached: data.cached,
      data: data.data,
      analyzedAt: data.analyzedAt,
      tokensUsed: data.tokensUsed
    };
  } catch (error) {
    console.error('Error fetching bundle analysis:', error);
    throw error;
  }
}

/**
 * Force refresh bundle analysis
 */
export async function refreshBundleAnalysis(caseId: string) {
  try {
    const response = await fetch(`/api/ai/${caseId}/bundle-analysis`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to refresh bundle analysis');
    }

    return await response.json();
  } catch (error) {
    console.error('Error refreshing bundle analysis:', error);
    throw error;
  }
}

/**
 * Get precedent analysis
 */
export async function getPrecedents(
  caseId: string,
  forceRefresh = false
): Promise<PrecedentAnalysisResult> {
  try {
    const response = await fetch(`/api/ai/${caseId}/precedents`, {
      method: forceRefresh ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: forceRefresh ? JSON.stringify({ forceRefresh: true }) : undefined
    });

    if (!response.ok) {
      throw new Error('Failed to fetch precedents');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching precedents:', error);
    throw error;
  }
}

/**
 * Get risk assessment
 */
export async function getRiskAssessment(
  caseId: string,
  forceRefresh = false
): Promise<RiskAssessmentResult> {
  try {
    const response = await fetch(`/api/ai/${caseId}/risk-assessment`, {
      method: forceRefresh ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: forceRefresh ? JSON.stringify({ forceRefresh: true }) : undefined
    });

    if (!response.ok) {
      throw new Error('Failed to fetch risk assessment');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching risk assessment:', error);
    throw error;
  }
}

/**
 * Get constitutional rights mapping
 */
export async function getRightsMapping(
  caseId: string,
  forceRefresh = false
): Promise<ConstitutionalRightsResult> {
  try {
    const response = await fetch(`/api/cases/${caseId}/ai-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        analysisType: 'rights',
        forceRefresh 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rights mapping');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching rights mapping:', error);
    throw error;
  }
}

/**
 * Get relief evaluation
 */
export async function getReliefEvaluation(
  caseId: string,
  forceRefresh = false
): Promise<ReliefEvaluationResult> {
  try {
    const response = await fetch(`/api/cases/${caseId}/ai-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        analysisType: 'relief',
        forceRefresh 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch relief evaluation');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching relief evaluation:', error);
    throw error;
  }
}

/**
 * Get narrative analysis
 */
export async function getNarrativeAnalysis(
  caseId: string,
  forceRefresh = false
) {
  try {
    const response = await fetch(`/api/cases/${caseId}/ai-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        analysisType: 'narrative',
        forceRefresh 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch narrative analysis');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching narrative analysis:', error);
    throw error;
  }
}

/**
 * Get counter-argument anticipation
 */
export async function getCounterAnticipation(
  caseId: string,
  forceRefresh = false
) {
  try {
    const response = await fetch(`/api/cases/${caseId}/ai-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        analysisType: 'counter',
        forceRefresh 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch counter-anticipation');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching counter-anticipation:', error);
    throw error;
  }
}

/**
 * Run batch analysis (all analyses at once)
 */
export async function runBatchAnalysis(caseId: string) {
  try {
    const response = await fetch(`/api/cases/${caseId}/ai-insights/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Failed to run batch analysis');
    }

    return await response.json();
  } catch (error) {
    console.error('Error running batch analysis:', error);
    throw error;
  }
}

/**
 * Get all available AI insights for a case
 */
export async function getAllInsights(caseId: string) {
  try {
    const response = await fetch(`/api/cases/${caseId}/ai-insights`);

    if (!response.ok) {
      throw new Error('Failed to fetch insights');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all insights:', error);
    throw error;
  }
}

/**
 * Generate hearing brief
 */
export async function generateHearingBrief(
  caseId: string,
  options?: {
    hearingDate?: string;
    focusAreas?: string[];
  }
) {
  try {
    const response = await fetch(`/api/cases/${caseId}/hearing-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error('Failed to generate hearing brief');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating hearing brief:', error);
    throw error;
  }
}

/**
 * Get hearing briefs history
 */
export async function getHearingBriefs(caseId: string) {
  try {
    const response = await fetch(`/api/cases/${caseId}/hearing-brief`);

    if (!response.ok) {
      throw new Error('Failed to fetch hearing briefs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching hearing briefs:', error);
    throw error;
  }
}

/**
 * Chat with document
 */
export async function chatWithDocument(
  documentId: string,
  message: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        message,
        conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error chatting with document:', error);
    throw error;
  }
}

/**
 * Get analysis statistics
 */
export async function getAnalysisStats(caseId: string) {
  try {
    const response = await fetch(`/api/cases/${caseId}/analysis/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch analysis stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching analysis stats:', error);
    throw error;
  }
}

/**
 * Delete AI analysis
 */
export async function deleteAIAnalysis(caseId: string) {
  try {
    const response = await fetch(`/api/cases/${caseId}/analysis`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete analysis');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
}

/**
 * Export analysis as PDF
 */
export async function exportAnalysisPDF(caseId: string) {
  try {
    const response = await fetch(`/api/cases/${caseId}/analysis/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'pdf' })
    });

    if (!response.ok) {
      throw new Error('Failed to export analysis');
    }

    // Handle blob response for PDF download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-analysis-${caseId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting analysis:', error);
    throw error;
  }
}

/**
 * Check if analysis is available for a case
 */
export async function checkAnalysisAvailability(caseId: string) {
  try {
    const response = await fetch(`/api/cases/${caseId}/analysis/status`);

    if (!response.ok) {
      throw new Error('Failed to check analysis status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking analysis availability:', error);
    throw error;
  }
}

// ============================================
// EXPORT AS OBJECT (for components expecting analysisApi)
// ============================================

export const analysisApi = {
  // Legacy AI Analysis (single analysis)
  getAIAnalysis,
  triggerAIAnalysis,
  retryAIAnalysis,
  deleteAIAnalysis,
  checkAnalysisAvailability,
  
  // New Modular Analyses
  getBundleAnalysis,
  refreshBundleAnalysis,
  getPrecedents,
  getRiskAssessment,
  getRightsMapping,
  getReliefEvaluation,
  getNarrativeAnalysis,
  getCounterAnticipation,
  
  // Batch & Insights
  runBatchAnalysis,
  getAllInsights,
  
  // Hearing Briefs
  generateHearingBrief,
  getHearingBriefs,
  
  // Document Chat
  chatWithDocument,
  
  // Utilities
  getAnalysisStats,
  exportAnalysisPDF,
};

// Also export as default for flexibility
export default analysisApi;