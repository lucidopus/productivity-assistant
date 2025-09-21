/**
 * TypeScript interfaces for LLM-as-Judge system
 * Based on MVP evaluation framework with 4 core metrics
 */

// ⚠️ FIXED: Metric schema now matches evaluation framework (MVP 4 metrics)
export interface JudgeMetrics {
  // MVP Core Metrics (Phase 1)
  feasibility: number;      // 0-100: Realistic and actionable recommendations
  specificity: number;      // 0-100: Detail level vs vague "work blocks"
  contextAlignment: number; // 0-100: Use of user profile data
  timeAccuracy: number;     // 0-100: Realistic time allocations

  // Future Expansion (Phase 2)
  completeness?: number;       // 0-100: Coverage of all planning elements
  coherence?: number;          // 0-100: Logical flow and structure
  comprehensiveness?: number;  // 0-100: Coverage without gaps
}

export interface PromptIssue {
  promptSection: 'systemPrompt' | 'finalPlanningPrompt' | 'initialMessage' | 'planCompletionMessage';
  category: 'critical' | 'major' | 'minor';
  issue: string;
  evidence: string;
  confidence: number; // 0-1: Judge confidence in this assessment
}

export interface PromptImprovement {
  targetPrompt: string;
  currentText: string;
  suggestedText: string;
  rationale: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard'; // Implementation complexity
  priority: 'high' | 'medium' | 'low';   // Business impact
}

export interface PromptAnalysis {
  _id?: string;
  userId: string;
  analysisDate: Date;
  weeklyPlanId: string;
  sessionId: string;
  githubIssueNumber?: number;
  githubIssueUrl?: string;
  overallAssessment: {
    score: number;
    summary: string;
    confidence: number; // Judge confidence in overall assessment
  };
  judgeMetrics: JudgeMetrics;  // FIXED: Now matches evaluation framework
  promptIssues: PromptIssue[];
  improvements: PromptImprovement[];
  positiveObservations: string[];
  createdAt: Date;
  status: 'completed' | 'failed';
}

// Gemini Function Calling Schema Types
export interface GeminiAnalysisRequest {
  userProfile: string;
  weeklyPlan: string;
  prompts: {
    systemPrompt: string;
    initialMessage: string;
    planCompletionMessage: string;
    finalPlanningPrompt: string;
  };
  temporal_context: string;
}

export interface GeminiAnalysisResponse {
  overallAssessment: {
    score: number;
    summary: string;
    confidence: number;
  };
  judgeMetrics: JudgeMetrics;
  promptIssues: PromptIssue[];
  improvements: PromptImprovement[];
  positiveObservations: string[];
}

// GitHub Issue Creation Types
export interface GitHubIssueData {
  title: string;
  body: string;
  labels: string[];
}

// MongoDB Query Types
export interface PromptAnalysisQuery {
  userId?: string;
  analysisDate?: {
    $gte?: Date;
    $lte?: Date;
  };
  'overallAssessment.score'?: {
    $gte?: number;
    $lte?: number;
  };
  status?: 'completed' | 'failed';
}

// Error Types
export interface JudgeSystemError {
  code: 'GEMINI_API_ERROR' | 'MONGODB_ERROR' | 'GITHUB_API_ERROR' | 'VALIDATION_ERROR';
  message: string;
  details?: unknown;
  timestamp: Date;
}