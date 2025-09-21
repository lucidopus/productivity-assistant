/**
 * LLM-as-Judge Prompts for Weekly Planning AI Analysis
 *
 * Research-based prompt design following best practices:
 * - Atomic evaluation components (single-aspect assessments)
 * - Evidence-driven feedback with specific examples
 * - Confidence scoring for meta-evaluation
 * - Systematic focus on repeatable issues
 * - Balanced assessment (positive + negative observations)
 */

import {
  GeminiAnalysisRequest,
  GeminiAnalysisResponse,
  PromptIssue,
  PromptImprovement
} from '@/types/judge';

export interface JudgePromptTemplate {
  template: string;
  description: string;
  variables?: string[];
  researchBasis?: string;
}

// ===== JUDGE SYSTEM PROMPTS =====

export const JudgePrompts = {
  /**
   * Main system prompt for LLM-as-Judge evaluation
   * Research basis: Stanford DSPy framework + LLM-as-judge methodologies
   */
  systemPrompt: {
    template: `You are an expert LLM-as-Judge specializing in evaluating weekly planning AI systems.

Your expertise:
- Weekly planning AI evaluation with 4 proven metrics
- Evidence-based assessment with confidence scoring
- Systematic improvement identification (not one-off issues)
- Balanced evaluation highlighting both strengths and weaknesses
- Production-grade prompt optimization recommendations

Evaluation Framework (MVP - Research-Validated):
1. **Feasibility** (0-100): Realistic and actionable recommendations
   - Can users actually execute these tasks?
   - Are time estimates reasonable?
   - Do recommendations account for real-world constraints?

2. **Specificity** (0-100): Detail level vs vague "work blocks"
   - Are tasks clearly defined and actionable?
   - Do descriptions provide enough context for execution?
   - Is the plan specific enough to follow without interpretation?

3. **Context-Alignment** (0-100): Use of user profile data
   - Does the plan reflect user's peak productivity hours?
   - Are personal commitments and constraints considered?
   - Is the plan tailored to the user's work style and preferences?

4. **Time-Accuracy** (0-100): Realistic time allocations
   - Are task durations realistic for the described activities?
   - Do transitions between activities include adequate buffer time?
   - Is the overall daily schedule achievable?

Analysis Standards:
- ALWAYS provide specific evidence from the plan
- Rate confidence in each assessment (0-1)
- Focus on systematic patterns, not isolated incidents
- Identify what's working well, not just problems
- Suggest improvements with implementation difficulty and business priority`,
    description: "Core system prompt for LLM-as-Judge evaluation",
    variables: [],
    researchBasis: "Stanford DSPy framework + Planning AI evaluation research"
  },

  /**
   * Comprehensive analysis prompt with all context
   * Research basis: DeepEval production patterns + multi-dimensional assessment
   */
  analysisPrompt: {
    template: `# Weekly Planning Prompt Effectiveness Analysis

You are evaluating the effectiveness of weekly planning AI prompts in producing high-quality, user-satisfying plans.

## User Profile Context
{userProfile}

## Temporal Context
{temporalContext}

## Current Prompts Being Evaluated

### System Prompt
{systemPrompt}

### Initial Message
{initialMessage}

### Plan Completion Message
{planCompletionMessage}

### Final Planning Prompt
{finalPlanningPrompt}

## Generated Weekly Plan to Evaluate
{weeklyPlan}

## Your Analysis Task

Evaluate how effectively the current prompts produced the weekly plan above. Use the submit_prompt_analysis function to provide:

### 1. Overall Assessment
- Score (0-100) representing overall prompt effectiveness
- Concise summary of prompt performance
- Confidence level in your assessment (0-1)

### 2. Core Metrics (MVP Framework)
Rate each metric 0-100 with specific evidence:

**Feasibility**: Are the recommendations realistic and actionable?
- Example evidence: "8:00-9:00 AM: Review quarterly reports (60 min)" - is this realistic for the user's morning routine?

**Specificity**: Does the plan provide detail vs vague "work blocks"?
- Example evidence: Compare "Morning work block" vs "8:00-9:30 AM: Complete Q3 budget analysis, focusing on marketing spend variance"

**Context-Alignment**: How well does the plan use user profile data?
- Example evidence: Does the plan align with user's stated peak hours, commitments, and preferences?

**Time-Accuracy**: Are time allocations and transitions realistic?
- Example evidence: "9:00-9:15 AM: Travel to downtown office, 9:15-9:30 AM: Team meeting" - is 15 min travel realistic?

### 3. Specific Issues (Evidence-Based)
For each issue identified:
- Which prompt section needs improvement
- Severity level (critical/major/minor)
- Specific problem description
- Concrete evidence from the generated plan
- Your confidence in this assessment (0-1)

### 4. Actionable Improvements
For each suggested improvement:
- Target prompt to modify
- Current problematic text
- Suggested replacement text
- Rationale for the change
- Expected impact on plan quality
- Implementation difficulty (easy/medium/hard)
- Business priority (high/medium/low)

### 5. Positive Observations
What are the prompts doing well? Balance is crucial for actionable feedback.

## Critical Guidelines
- **Evidence-first**: Every claim must be supported by specific examples from the plan
- **Systematic focus**: Target repeatable patterns, not one-off edge cases
- **Confidence scoring**: Rate your certainty in each assessment
- **Atomic evaluation**: Assess one dimension at a time to reduce bias
- **Implementation guidance**: Consider both business impact and technical difficulty`,
    description: "Comprehensive prompt analysis template with full context",
    variables: [
      "userProfile",
      "temporalContext",
      "systemPrompt",
      "initialMessage",
      "planCompletionMessage",
      "finalPlanningPrompt",
      "weeklyPlan"
    ],
    researchBasis: "DeepEval patterns + Multi-dimensional LLM-as-judge assessment"
  }
};

// ===== JSON SCHEMA FOR GEMINI FUNCTION CALLING =====

export const judgeAnalysisSchema = {
  name: "submit_prompt_analysis",
  description: "Submit structured analysis of weekly planning prompts with evidence-based evaluation",
  parameters: {
    type: "object",
    properties: {
      overallAssessment: {
        type: "object",
        properties: {
          score: {
            type: "number",
            description: "Overall prompt effectiveness score (0-100)",
            minimum: 0,
            maximum: 100
          },
          summary: {
            type: "string",
            description: "Concise summary of prompt performance"
          },
          confidence: {
            type: "number",
            description: "Judge confidence in this assessment (0-1)",
            minimum: 0,
            maximum: 1
          }
        },
        required: ["score", "summary", "confidence"]
      },
      judgeMetrics: {
        type: "object",
        properties: {
          feasibility: {
            type: "number",
            description: "Realistic and actionable recommendations (0-100)",
            minimum: 0,
            maximum: 100
          },
          specificity: {
            type: "number",
            description: "Detail level vs vague work blocks (0-100)",
            minimum: 0,
            maximum: 100
          },
          contextAlignment: {
            type: "number",
            description: "Use of user profile data (0-100)",
            minimum: 0,
            maximum: 100
          },
          timeAccuracy: {
            type: "number",
            description: "Realistic time allocations (0-100)",
            minimum: 0,
            maximum: 100
          }
        },
        required: ["feasibility", "specificity", "contextAlignment", "timeAccuracy"]
      },
      promptIssues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            promptSection: {
              type: "string",
              enum: ["systemPrompt", "finalPlanningPrompt", "initialMessage", "planCompletionMessage"],
              description: "Which prompt section has the issue"
            },
            category: {
              type: "string",
              enum: ["critical", "major", "minor"],
              description: "Issue severity level"
            },
            issue: {
              type: "string",
              description: "Specific problem identified"
            },
            evidence: {
              type: "string",
              description: "Concrete examples from the plan supporting this finding"
            },
            confidence: {
              type: "number",
              description: "Judge confidence in this assessment (0-1)",
              minimum: 0,
              maximum: 1
            }
          },
          required: ["promptSection", "category", "issue", "evidence", "confidence"]
        }
      },
      improvements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            targetPrompt: {
              type: "string",
              description: "Which prompt to modify"
            },
            currentText: {
              type: "string",
              description: "Current problematic text"
            },
            suggestedText: {
              type: "string",
              description: "Proposed improvement"
            },
            rationale: {
              type: "string",
              description: "Why this change would help"
            },
            expectedImpact: {
              type: "string",
              description: "Expected improvement in plan quality"
            },
            difficulty: {
              type: "string",
              enum: ["easy", "medium", "hard"],
              description: "Implementation complexity"
            },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "Business impact priority"
            }
          },
          required: ["targetPrompt", "currentText", "suggestedText", "rationale", "expectedImpact", "difficulty", "priority"]
        }
      },
      positiveObservations: {
        type: "array",
        items: { type: "string" },
        description: "What prompts are doing well - balanced feedback"
      }
    },
    required: ["overallAssessment", "judgeMetrics", "promptIssues", "improvements", "positiveObservations"]
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Format the comprehensive analysis prompt with all context
 * Research basis: Template filling following existing groq-client patterns
 */
export function formatAnalysisPrompt(request: GeminiAnalysisRequest): string {
  return JudgePrompts.analysisPrompt.template
    .replace('{userProfile}', request.userProfile)
    .replace('{temporalContext}', request.temporal_context)
    .replace('{systemPrompt}', request.prompts.systemPrompt)
    .replace('{initialMessage}', request.prompts.initialMessage)
    .replace('{planCompletionMessage}', request.prompts.planCompletionMessage)
    .replace('{finalPlanningPrompt}', request.prompts.finalPlanningPrompt)
    .replace('{weeklyPlan}', request.weeklyPlan);
}

/**
 * Create GitHub issue content from analysis results
 * Research basis: Actionable feedback patterns from production systems
 */
export function formatGitHubIssueBody(analysis: GeminiAnalysisResponse): string {
  const { overallAssessment, judgeMetrics, promptIssues, improvements, positiveObservations } = analysis;

  return `# Weekly Planning AI Prompt Analysis Report

## Overall Assessment
**Score:** ${overallAssessment.score}/100
**Confidence:** ${Math.round(overallAssessment.confidence * 100)}%

${overallAssessment.summary}

## Core Metrics (MVP Framework)

| Metric | Score | Description |
|--------|-------|-------------|
| **Feasibility** | ${judgeMetrics.feasibility}/100 | Realistic and actionable recommendations |
| **Specificity** | ${judgeMetrics.specificity}/100 | Detail level vs vague work blocks |
| **Context-Alignment** | ${judgeMetrics.contextAlignment}/100 | Use of user profile data |
| **Time-Accuracy** | ${judgeMetrics.timeAccuracy}/100 | Realistic time allocations |

## Issues Identified

${promptIssues.map((issue: PromptIssue, index: number) => `
### ${index + 1}. ${issue.category.toUpperCase()}: ${issue.promptSection}
**Issue:** ${issue.issue}
**Evidence:** ${issue.evidence}
**Confidence:** ${Math.round(issue.confidence * 100)}%
`).join('')}

## Recommended Improvements

${improvements.map((improvement: PromptImprovement, index: number) => `
### ${index + 1}. ${improvement.targetPrompt} [Priority: ${improvement.priority.toUpperCase()}, Difficulty: ${improvement.difficulty}]

**Current Text:**
\`\`\`
${improvement.currentText}
\`\`\`

**Suggested Text:**
\`\`\`
${improvement.suggestedText}
\`\`\`

**Rationale:** ${improvement.rationale}
**Expected Impact:** ${improvement.expectedImpact}
`).join('')}

## Positive Observations

${positiveObservations.map((observation: string) => `- ${observation}`).join('\n')}

---
*Generated by LLM-as-Judge system on ${new Date().toISOString()}*
*Research basis: Stanford DSPy + DeepEval + Planning AI evaluation methodologies*`;
}

/**
 * Extract prompts from the prompts.ts file programmatically
 * This function would be used by the Trigger.dev task to get current prompts
 */
export function extractCurrentPrompts() {
  // This would need to import from prompts.ts and extract the current BellaPrompts
  // Implementation depends on the structure of prompts.ts
  return {
    systemPrompt: "System prompt would be extracted here",
    initialMessage: "Initial message would be extracted here",
    planCompletionMessage: "Plan completion message would be extracted here",
    finalPlanningPrompt: "Final planning prompt would be extracted here"
  };
}

// ===== RESEARCH REFERENCES =====

/**
 * Research foundations for this implementation:
 *
 * 1. Stanford DSPy Framework: Declarative approach with 13% accuracy improvements
 * 2. DeepEval Framework: Production-grade LLM evaluation with 40+ metrics
 * 3. OpenAI/Gemini Structured Outputs: 100% reliability for complex schemas
 * 4. LLM-as-Judge Methodologies: Multi-metric evaluation preventing bias
 * 5. Planning AI Research: Feasibility and trust as strongest satisfaction predictors
 * 6. Evidence-based Assessment: Atomic evaluation with confidence scoring
 */