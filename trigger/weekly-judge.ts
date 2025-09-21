import { schedules, logger } from "@trigger.dev/sdk";
import {
  getWeeklyPlansCollection,
  getPromptAnalysesCollection,
  getChatsCollection,
  createPromptAnalysesIndexes
} from "../frontend/src/lib/mongodb";
import { analyzePromptEffectiveness } from "../frontend/src/lib/gemini-client";
import { formatGitHubIssueBody } from "../frontend/src/lib/judge-prompts";
import { BellaPrompts, generateTemporalContext } from "../frontend/src/lib/prompts";
import { PromptAnalysis, GeminiAnalysisRequest } from "../frontend/src/types/judge";
import { Octokit } from "@octokit/rest";
import { ObjectId } from "mongodb";
import { HARDCODED_USER_ID } from "../frontend/src/lib/constants";

// GitHub client configuration
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Helper function to get the latest weekly plan
async function getLatestWeeklyPlan(userId: string) {
  try {
    const weeklyPlansCollection = await getWeeklyPlansCollection();

    const latestPlan = await weeklyPlansCollection
      .findOne(
        { userId, status: 'active' },
        { sort: { createdAt: -1 } }
      );

    if (!latestPlan) {
      logger.warn("No active weekly plan found", { userId });
      return null;
    }

    logger.info("Latest weekly plan retrieved", {
      planId: latestPlan._id,
      weekStart: latestPlan.weekStart,
      targetsCount: latestPlan.weeklyTargets.length
    });

    return latestPlan;
  } catch (error) {
    logger.error("Failed to get latest weekly plan", {
      error: (error as Error).message,
      userId
    });
    throw error;
  }
}

// Helper function to get conversation history for the plan
async function getConversationHistory(sessionId: string) {
  try {
    const chatsCollection = await getChatsCollection();

    const chatSession = await chatsCollection.findOne({ sessionId });

    if (!chatSession) {
      logger.warn("No chat session found for plan", { sessionId });
      return "No conversation history available";
    }

    // Format the conversation for analysis
    const formattedMessages = chatSession.messages.map((message: any) =>
      `**${message.role.toUpperCase()}** (${new Date(message.timestamp).toLocaleString()}): ${message.content}`
    ).join('\n\n');

    logger.info("Conversation history retrieved", {
      sessionId,
      messageCount: chatSession.messages.length,
      continuationFlag: chatSession.continuationFlag,
      status: chatSession.status
    });

    return `# Conversation History (Session: ${sessionId})
Status: ${chatSession.status}
Continuation Flag: ${chatSession.continuationFlag}
Extracted Targets: ${chatSession.extractedTargets ? chatSession.extractedTargets.join(', ') : 'None'}

## Messages:
${formattedMessages}`;

  } catch (error) {
    logger.error("Failed to get conversation history", {
      error: (error as Error).message,
      sessionId
    });
    return `Error retrieving conversation history: ${(error as Error).message}`;
  }
}

// Helper function to format weekly plan for analysis
function formatWeeklyPlanForAnalysis(plan: any): string {
  const formatDay = (dayName: string, dayData: any) => {
    if (!dayData || !dayData.tasks) return `${dayName}: No tasks scheduled`;

    const tasks = dayData.tasks.map((task: any) =>
      `  ${task.time}: ${task.task}${task.duration ? ` (${task.duration} min)` : ''}${task.type ? ` [${task.type}]` : ''}`
    ).join('\n');

    return `${dayName} (${dayData.date}):\n${tasks}`;
  };

  return `
Weekly Targets:
${plan.weeklyTargets.map((target: string) => `- ${target}`).join('\n')}

Daily Schedule:
${formatDay('Monday', plan.days.monday)}

${formatDay('Tuesday', plan.days.tuesday)}

${formatDay('Wednesday', plan.days.wednesday)}

${formatDay('Thursday', plan.days.thursday)}

${formatDay('Friday', plan.days.friday)}

Plan Created: ${plan.createdAt}
Session ID: ${plan.sessionId}
`.trim();
}

// Helper function to get user profile context
async function getUserProfileContext(userId: string): Promise<string> {
  try {
    const { formatProfileFromMongoDB } = await import("../frontend/src/lib/prompts");
    return await formatProfileFromMongoDB(userId);
  } catch (error) {
    logger.error("Failed to get user profile", {
      error: (error as Error).message,
      userId
    });
    return "User profile data unavailable";
  }
}

// Helper function to extract all current prompts
function getCurrentPrompts() {
  try {
    return {
      systemPrompt: BellaPrompts.systemPrompt.template,
      initialMessage: BellaPrompts.initialMessage.template,
      planCompletionMessage: BellaPrompts.planCompletionMessage.template,
      finalPlanningPrompt: BellaPrompts.finalPlanningPrompt.template
    };
  } catch (error) {
    logger.error("Failed to extract current prompts", {
      error: (error as Error).message
    });
    throw error;
  }
}

// Helper function to save analysis results to MongoDB
async function saveAnalysisResults(
  userId: string,
  weeklyPlanId: string,
  sessionId: string,
  analysisResults: any
): Promise<PromptAnalysis> {
  try {
    const promptAnalysesCollection = await getPromptAnalysesCollection();

    const analysisData = {
      userId,
      analysisDate: new Date(),
      weeklyPlanId,
      sessionId,
      overallAssessment: analysisResults.overallAssessment,
      judgeMetrics: analysisResults.judgeMetrics,
      promptIssues: analysisResults.promptIssues,
      improvements: analysisResults.improvements,
      positiveObservations: analysisResults.positiveObservations,
      createdAt: new Date(),
      status: 'completed' as const
    };

    const result = await promptAnalysesCollection.insertOne(analysisData);

    logger.info("Analysis results saved to MongoDB", {
      analysisId: result.insertedId,
      overallScore: analysisResults.overallAssessment.score,
      issuesCount: analysisResults.promptIssues.length,
      improvementsCount: analysisResults.improvements.length
    });

    return { ...analysisData, _id: result.insertedId.toString() };
  } catch (error) {
    logger.error("Failed to save analysis results", {
      error: (error as Error).message,
      userId,
      weeklyPlanId
    });
    throw error;
  }
}

// Helper function to create GitHub issue
async function createGitHubIssue(
  analysisResults: any,
  overallScore: number
): Promise<{ issueNumber: number; issueUrl: string }> {
  try {
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;

    if (!repoOwner || !repoName) {
      throw new Error("GitHub repository configuration missing");
    }

    const issueTitle = `Weekly Planning AI Analysis - Score: ${overallScore}/100`;
    const issueBody = formatGitHubIssueBody(analysisResults);

    const labels = [
      'prompt-optimization',
      overallScore >= 80 ? 'low-priority' : overallScore >= 60 ? 'medium-priority' : 'high-priority'
    ];

    const response = await octokit.rest.issues.create({
      owner: repoOwner,
      repo: repoName,
      title: issueTitle,
      body: issueBody,
      labels
    });

    logger.info("GitHub issue created successfully", {
      issueNumber: response.data.number,
      issueUrl: response.data.html_url,
      score: overallScore
    });

    return {
      issueNumber: response.data.number,
      issueUrl: response.data.html_url
    };
  } catch (error) {
    logger.error("Failed to create GitHub issue", {
      error: (error as Error).message,
      overallScore
    });
    throw error;
  }
}

// Helper function to update analysis with GitHub issue info
async function updateAnalysisWithGitHubInfo(
  analysisId: string,
  issueNumber: number,
  issueUrl: string
): Promise<void> {
  try {
    const promptAnalysesCollection = await getPromptAnalysesCollection();

    await promptAnalysesCollection.updateOne(
      { _id: new ObjectId(analysisId) },
      {
        $set: {
          githubIssueNumber: issueNumber,
          githubIssueUrl: issueUrl
        }
      }
    );

    logger.info("Analysis updated with GitHub issue information", {
      analysisId,
      issueNumber,
      issueUrl
    });
  } catch (error) {
    logger.error("Failed to update analysis with GitHub info", {
      error: (error as Error).message,
      analysisId
    });
    throw error;
  }
}

// Main scheduled task - runs every Saturday at 3 PM
export const weeklyJudge = schedules.task({
  id: "weekly-judge",
  // cron: "35 21 * * 6", // Every Saturday at 9:35 PM (21:35) - Configured on dashboard
  maxDuration: 900, // 15 minutes
  run: async () => {
    logger.info("Weekly judge task started", { timestamp: new Date() });

    try {
      // Check if judge system is enabled
      if (process.env.JUDGE_SYSTEM_ENABLED !== 'true') {
        logger.info("Judge system is disabled, skipping analysis");
        return {
          success: true,
          skipped: true,
          reason: "Judge system disabled"
        };
      }

      const userId = HARDCODED_USER_ID;

      logger.info("Starting weekly prompt analysis", { userId });

      // Step 1: Create MongoDB indexes if they don't exist
      await createPromptAnalysesIndexes();
      logger.info("MongoDB indexes ensured");

      // Step 2: Fetch the latest weekly plan
      const latestPlan = await getLatestWeeklyPlan(userId);
      if (!latestPlan) {
        logger.warn("No weekly plan found for analysis");
        return {
          success: true,
          skipped: true,
          reason: "No weekly plan available"
        };
      }

      // Step 3: Get user profile context
      const userProfile = await getUserProfileContext(userId);

      // Step 4: Extract all current prompts
      const currentPrompts = getCurrentPrompts();

      // Step 5: Generate temporal context
      const temporalContext = generateTemporalContext();

      // Step 6: Get conversation history for the plan
      const conversationHistory = await getConversationHistory(latestPlan.sessionId);

      // Step 7: Format weekly plan for analysis
      const formattedPlan = formatWeeklyPlanForAnalysis(latestPlan);

      // Step 8: Prepare analysis request with conversation context
      const analysisRequest: GeminiAnalysisRequest = {
        userProfile,
        weeklyPlan: `${conversationHistory}\n\n# Generated Weekly Plan\n${formattedPlan}`,
        prompts: currentPrompts,
        temporal_context: temporalContext
      };

      logger.info("Analysis request prepared", {
        userProfileLength: userProfile.length,
        weeklyPlanLength: formattedPlan.length,
        conversationHistoryLength: conversationHistory.length,
        promptsCount: Object.keys(currentPrompts).length
      });

      // Step 9: Call Gemini for analysis
      const analysisResponse = await analyzePromptEffectiveness(analysisRequest);

      if (analysisResponse.error) {
        throw new Error(`Gemini analysis failed: ${analysisResponse.error}`);
      }

      if (!analysisResponse.functionCall) {
        throw new Error("No structured analysis received from Gemini");
      }

      const analysisResults = analysisResponse.functionCall.arguments;

      logger.info("Gemini analysis completed", {
        overallScore: analysisResults.overallAssessment.score,
        issuesCount: analysisResults.promptIssues.length,
        improvementsCount: analysisResults.improvements.length
      });

      // Step 9: Save analysis results to MongoDB
      const savedAnalysis = await saveAnalysisResults(
        userId,
        latestPlan._id.toString(),
        latestPlan.sessionId,
        analysisResults
      );

      // Step 10: Create GitHub issue
      const { issueNumber, issueUrl } = await createGitHubIssue(
        analysisResults,
        analysisResults.overallAssessment.score
      );

      // Step 11: Update analysis with GitHub issue information
      await updateAnalysisWithGitHubInfo(
        savedAnalysis._id!,
        issueNumber,
        issueUrl
      );

      logger.info("Weekly judge task completed successfully", {
        analysisId: savedAnalysis._id,
        issueNumber,
        overallScore: analysisResults.overallAssessment.score
      });

      return {
        success: true,
        analysisId: savedAnalysis._id,
        overallScore: analysisResults.overallAssessment.score,
        issuesCount: analysisResults.promptIssues.length,
        improvementsCount: analysisResults.improvements.length,
        githubIssueNumber: issueNumber,
        githubIssueUrl: issueUrl,
        completedAt: new Date()
      };

    } catch (error) {
      logger.error("Weekly judge task failed", {
        error: (error as Error).message,
        stack: (error as Error).stack
      });

      // Try to save failed analysis record
      try {
        const promptAnalysesCollection = await getPromptAnalysesCollection();
        await promptAnalysesCollection.insertOne({
          userId: HARDCODED_USER_ID,
          analysisDate: new Date(),
          weeklyPlanId: 'unknown',
          sessionId: 'unknown',
          overallAssessment: {
            score: 0,
            summary: 'Analysis failed due to system error',
            confidence: 0
          },
          judgeMetrics: {
            feasibility: 0,
            specificity: 0,
            contextAlignment: 0,
            timeAccuracy: 0
          },
          promptIssues: [{
            promptSection: 'systemPrompt' as const,
            category: 'critical' as const,
            issue: 'Judge system failure',
            evidence: (error as Error).message,
            confidence: 1
          }],
          improvements: [],
          positiveObservations: [],
          createdAt: new Date(),
          status: 'failed' as const
        });
      } catch (saveError) {
        logger.error("Failed to save error analysis record", {
          error: (saveError as Error).message
        });
      }

      return {
        success: false,
        error: (error as Error).message
      };
    }
  },
});