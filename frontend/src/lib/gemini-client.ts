import { GoogleGenerativeAI, SchemaType, FunctionDeclaration, FunctionCallingMode } from '@google/generative-ai';
import {
  GeminiAnalysisRequest,
  GeminiAnalysisResponse,
  JudgeSystemError
} from '@/types/judge';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Gemini function definition for prompt analysis
export const judgeAnalysisFunction: FunctionDeclaration = {
  name: "submit_prompt_analysis",
  description: "Submit structured analysis of weekly planning prompts with evidence-based evaluation",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      overallAssessment: {
        type: SchemaType.OBJECT,
        properties: {
          score: {
            type: SchemaType.NUMBER,
            description: "Overall prompt effectiveness score (0-100)"
          },
          summary: {
            type: SchemaType.STRING,
            description: "Concise summary of prompt performance"
          },
          confidence: {
            type: SchemaType.NUMBER,
            description: "Judge confidence in this assessment (0-1)"
          }
        },
        required: ["score", "summary", "confidence"]
      },
      judgeMetrics: {
        type: SchemaType.OBJECT,
        properties: {
          feasibility: {
            type: SchemaType.NUMBER,
            description: "Realistic and actionable recommendations (0-100)"
          },
          specificity: {
            type: SchemaType.NUMBER,
            description: "Detail level vs vague work blocks (0-100)"
          },
          contextAlignment: {
            type: SchemaType.NUMBER,
            description: "Use of user profile data (0-100)"
          },
          timeAccuracy: {
            type: SchemaType.NUMBER,
            description: "Realistic time allocations (0-100)"
          }
        },
        required: ["feasibility", "specificity", "contextAlignment", "timeAccuracy"]
      },
      promptIssues: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            promptSection: {
              type: SchemaType.STRING,
              description: "Which prompt section has the issue"
            },
            category: {
              type: SchemaType.STRING,
              description: "Issue severity level"
            },
            issue: {
              type: SchemaType.STRING,
              description: "Specific problem identified"
            },
            evidence: {
              type: SchemaType.STRING,
              description: "Concrete examples from the plan supporting this finding"
            },
            confidence: {
              type: SchemaType.NUMBER,
              description: "Judge confidence in this assessment (0-1)"
            }
          },
          required: ["promptSection", "category", "issue", "evidence", "confidence"]
        }
      },
      improvements: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            targetPrompt: {
              type: SchemaType.STRING,
              description: "Which prompt to modify"
            },
            currentText: {
              type: SchemaType.STRING,
              description: "Current problematic text"
            },
            suggestedText: {
              type: SchemaType.STRING,
              description: "Proposed improvement"
            },
            rationale: {
              type: SchemaType.STRING,
              description: "Why this change would help"
            },
            expectedImpact: {
              type: SchemaType.STRING,
              description: "Expected improvement in plan quality"
            },
            difficulty: {
              type: SchemaType.STRING,
              description: "Implementation complexity"
            },
            priority: {
              type: SchemaType.STRING,
              description: "Business impact priority"
            }
          },
          required: ["targetPrompt", "currentText", "suggestedText", "rationale", "expectedImpact", "difficulty", "priority"]
        }
      },
      positiveObservations: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "What prompts are doing well - balanced feedback"
      }
    },
    required: ["overallAssessment", "judgeMetrics", "promptIssues", "improvements", "positiveObservations"]
  }
};

export interface GeminiAnalysisRequestFormatted {
  message: string;
  functionCall?: {
    name: string;
    arguments: GeminiAnalysisResponse;
  };
  error?: string;
}

export async function analyzePromptEffectiveness(
  analysisRequest: GeminiAnalysisRequest,
  maxRetries: number = 3
): Promise<GeminiAnalysisRequestFormatted> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-pro',
        tools: [{
          functionDeclarations: [judgeAnalysisFunction]
        }]
      });

      // Format the analysis prompt
      const analysisPrompt = formatAnalysisPrompt(analysisRequest);

      // DEBUG: Log the complete prompt being sent to the LLM
      console.log('='.repeat(80));
      console.log('🔍 DEBUG: COMPLETE PROMPT BEING SENT TO GEMINI');
      console.log('='.repeat(80));
      console.log('\n📋 ANALYSIS PROMPT:');
      console.log('-'.repeat(40));
      console.log(analysisPrompt);
      console.log('-'.repeat(40));

      // SPECIAL DEBUG: Log the final formatted prompt with clear tag
      console.log('\n' + '='.repeat(100));
      console.log('FINAL PROMPT SENT TO GEMINI');
      console.log('='.repeat(100));
      console.log(analysisPrompt);
      console.log('='.repeat(100));
      console.log('\n');
      console.log('\n🔧 MODEL:', process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-pro');
      console.log('🌡️  TEMPERATURE:', 0.3);
      console.log('🛠️  TOOLS ENABLED:', judgeAnalysisFunction.name);
      console.log('='.repeat(80));
      console.log('\n');

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
        generationConfig: {
          temperature: 0.3, // Low temperature for consistent evaluation
          maxOutputTokens: 4000,
        },
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingMode.ANY  // Force function calling
          }
        }
      });

      const response = result.response;

      if (!response) {
        throw new Error('No response from Gemini');
      }

      // DEBUG: Log the LLM response
      console.log('='.repeat(80));
      console.log('✅ DEBUG: GEMINI RESPONSE RECEIVED');
      console.log('='.repeat(80));
      console.log('\n📝 Message Content:');
      console.log('-'.repeat(40));
      console.log(response.text() || '[No text content]');
      console.log('-'.repeat(40));

      let functionCall;
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        const toolCall = functionCalls[0];
        console.log('\n🔧 Function Call Detected:');
        console.log('  Function Name:', toolCall.name);
        console.log('  Raw Arguments:', JSON.stringify(toolCall.args, null, 2));

        try {
          const args = toolCall.args as Record<string, unknown>;

          // Validate that we have proper structured data, not just string placeholders
          if (typeof args.promptIssues === 'string' || typeof args.improvements === 'string') {
            console.error('Gemini returned string placeholders instead of structured data');
            console.error('Raw arguments:', args);
            throw new Error('Gemini function call returned invalid structure - got strings instead of objects');
          }

          functionCall = {
            name: toolCall.name,
            arguments: args as unknown as GeminiAnalysisResponse
          };
          console.log('  Parsed Arguments:', JSON.stringify(functionCall.arguments, null, 2));
        } catch (parseError) {
          console.error('Failed to parse function call arguments:', parseError);
          console.error('Raw arguments:', toolCall.args);
          // Continue without function call if parsing fails
          functionCall = undefined;
        }
      } else {
        console.log('\n🔧 No function calls in response');
      }
      console.log('='.repeat(80));
      console.log('\n');

      return {
        message: response.text() || 'Analysis completed successfully',
        functionCall
      };

    } catch (error: unknown) {
      retryCount++;
      console.error(`Gemini API attempt ${retryCount} failed:`, error);

      if (retryCount === maxRetries) {
        return {
          message: 'Failed to analyze prompts after multiple attempts',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Exponential backoff - same pattern as groq-client.ts
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }

  return {
    message: 'Max retries exceeded for prompt analysis',
    error: 'Max retries exceeded'
  };
}

// Helper function to format the analysis prompt
export function formatAnalysisPrompt(request: GeminiAnalysisRequest): string {
  return `You are an expert LLM-as-Judge evaluating the effectiveness of weekly planning AI prompts.

# Your Task
Analyze the relationship between the current prompts and the generated weekly plan to identify systematic issues and improvement opportunities.

# Evaluation Framework (MVP - 4 Core Metrics)
Focus on these proven satisfaction predictors:

1. **Feasibility** (0-100): Are recommendations realistic and actionable?
2. **Specificity** (0-100): Does the plan provide detail vs vague "work blocks"?
3. **Context-Alignment** (0-100): How well does the plan use user profile data?
4. **Time-Accuracy** (0-100): Are time allocations and transitions realistic?

# Analysis Guidelines
- **Evidence-based**: Include specific examples from the plan
- **Systematic focus**: Target repeatable issues, not one-off problems
- **Balanced assessment**: Identify both issues AND what's working well
- **Confidence scoring**: Rate your confidence in each assessment (0-1)
- **Atomic evaluation**: Assess one aspect at a time to reduce bias

# User Profile Context
${request.userProfile}

# Temporal Context
${request.temporal_context}

# Current Prompts Being Evaluated
## System Prompt
${request.prompts.systemPrompt}

## Initial Message
${request.prompts.initialMessage}

## Plan Completion Message
${request.prompts.planCompletionMessage}

## Final Planning Prompt
${request.prompts.finalPlanningPrompt}

# Generated Weekly Plan to Evaluate
${request.weeklyPlan}

# Instructions
Analyze the effectiveness of these prompts in producing the weekly plan shown above.

**CRITICAL**: You MUST call the submit_prompt_analysis function with proper structured data. Do NOT return placeholder strings like "unknown".

Required structure:
1. overallAssessment: object with score (number), summary (string), confidence (number)
2. judgeMetrics: object with feasibility, specificity, contextAlignment, timeAccuracy (all numbers 0-100)
3. promptIssues: array of objects with promptSection, category, issue, evidence, confidence
4. improvements: array of objects with targetPrompt, currentText, suggestedText, rationale, expectedImpact, difficulty, priority
5. positiveObservations: array of strings

Focus on systematic improvements that will enhance user trust and satisfaction with the planning AI.`;
}

// Helper function to handle Gemini errors with proper typing
export function handleGeminiError(error: unknown): JudgeSystemError {
  if (error instanceof Error) {
    return {
      code: 'GEMINI_API_ERROR',
      message: error.message,
      details: error,
      timestamp: new Date()
    };
  }

  return {
    code: 'GEMINI_API_ERROR',
    message: 'Unknown Gemini API error',
    details: error,
    timestamp: new Date()
  };
}

// Utility function for retry logic with exponential backoff (shared pattern)
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;
      console.error(`Operation attempt ${retryCount} failed:`, error);

      if (retryCount === maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, retryCount) * baseDelay)
      );
    }
  }

  throw new Error('Max retries exceeded');
}

// Shared logging patterns (following groq-client.ts)
export function logGeminiRequest(prompt: string, config: object): void {
  console.log('📤 GEMINI REQUEST:', {
    promptLength: prompt.length,
    config,
    timestamp: new Date().toISOString()
  });
}

export function logGeminiResponse(response: object): void {
  console.log('📥 GEMINI RESPONSE:', {
    response,
    timestamp: new Date().toISOString()
  });
}