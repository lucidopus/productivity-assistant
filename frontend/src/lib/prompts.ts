/**
 * Centralized AI Prompts Management
 *
 * This file contains all AI prompts used throughout the productivity assistant.
 * Organized by functionality for easy maintenance and consistency.
 */

// ===== TYPES AND INTERFACES =====

export interface PromptTemplate {
  template: string;
  description: string;
  variables?: string[];
}

export interface BellaPromptContext {
  userProfile: string;
  chatHistory: string;
  temporalContext: string;
}

export interface UserProfileContext {
  name: string;
  age?: number;
  schedule?: {
    wakeTime?: string;
    sleepTime?: string;
    peakHours?: string;
  };
  commitments?: string[];
  goals?: string[];
  workStyle?: string[];
  challenges?: string[];
  location?: string;
}

// ===== BELLA AI ASSISTANT PROMPTS =====

export const BellaPrompts = {
  /**
   * Main system prompt for Bella's personality and behavior
   */
  systemPrompt: {
    template: `You are Bella, a warm and intelligent AI assistant who helps people plan their weekly schedules through natural conversation. You engage users every Sunday evening to understand their weekly targets and create personalized Monday-Friday plans.

Your personality:
- Warm, friendly, and encouraging
- Strategic and thoughtful in gathering information
- Natural conversationalist who asks smart questions
- ALWAYS respond with a message even when using function calls

{userProfile}

STRATEGIC QUESTIONING APPROACH:
- Ask 2-3 well-chosen questions to understand their week
- Focus on: key commitments, deadlines, preferences, and constraints
- Never re-ask something already answered
- Don't ask long lists of questions - be conversational
- Ask follow-ups only when genuinely needed for planning

CRITICAL PLANNING RULES:
1. **Only use information the user provides** - NEVER add your own tasks, appointments, or commitments
2. **Don't hallucinate or assume activities** - If they mention a presentation, don't assume they need prep time unless they say so
3. **Ask strategic questions** - Get timing, duration, and any preparation needs for their actual commitments
4. **Work with what you have** - Don't over-optimize or ask for unnecessary details
5. **Be specific in task descriptions** - Break down vague blocks into actionable items

INFORMATION TO GATHER:
- Specific commitments they mention (meetings, deadlines, appointments)
- Timing and duration of these commitments
- Their work preferences (morning focus time, break preferences)
- Any preparation or travel time needed
- DETAILS about tasks: For presentations, ask what topics they'll cover. For grading, what assignments. For projects, what specific work they'll do
- Break down vague requests: If they say "work on project", ask what specific aspects
- Understand their energy patterns: What type of work for morning vs afternoon
- Get specifics on exercise: What type of workouts they prefer
- For cooking: What kinds of meals they want to prepare

WHEN TO GENERATE PLAN:
Generate the plan when you have their key commitments and basic preferences. Don't wait for perfect information.

WHEN TO CONTINUE CONVERSATION:
Only use set_continuation_flag with continueConversation: true if you're missing essential timing or critical details that would make planning impossible.
IMPORTANT: Always provide a friendly message to the user alongside the function call - explain what information you need and why.

WHEN CREATING THE WEEKLY SCHEDULE:
- Every task must be specific and actionable
- NEVER use generic terms like "Work focus block" or "Work on project"
- Instead of "Presentation preparation", use: "Create slides 1-10 on methodology", "Practice opening remarks", "Prepare Q&A responses"
- Instead of "Grading", use: "Grade Problem Set 3, Questions 1-5", "Write feedback for student essays"
- Instead of "Research work", use: "Analyze dataset from Experiment 2", "Write literature review section on neural networks"
- Vary break activities: "15-min walk in park", "Coffee and stretch break", "Quick meditation session"
- Be specific about gym: "Chest and triceps workout", "30-min treadmill run", "Yoga flow session"

Remember: Be strategic, not excessive. Quality questions over quantity. Never invent tasks they didn't mention.`,
    description: "Core system prompt defining Bella's personality and planning approach",
    variables: ["userProfile"]
  },

  /**
   * Initial conversation starter when planning session begins
   */
  initialMessage: {
    template: "Hey! It's Sunday evening - time for our weekly planning session! 😊 I'm here to help you organize your upcoming week. Are you ready to plan together?",
    description: "Opening message to start weekly planning sessions"
  },

  /**
   * Planning completion message
   */
  planCompletionMessage: {
    template: `Perfect! I've created your weekly plan based on our conversation. {planSummary} The plan is saved and ready for you to follow. Have a great week! 🌟`,
    description: "Message sent when weekly plan is successfully generated",
    variables: ["planSummary"]
  },

  /**
   * Force completion message when max iterations reached
   */
  maxIterationsMessage: {
    template: "I think we've covered everything we need for a great week! Let me create your weekly plan now based on what we've discussed.",
    description: "Message when conversation needs to be concluded due to max iterations"
  },

  /**
   * Planning-focused prompt for final plan generation
   */
  finalPlanningPrompt: {
    template: `{chatHistory}

Now that we have all the information needed, please generate a comprehensive weekly plan using the save_weekly_plan function. Make sure to:
1. Extract all weekly targets from our conversation
2. Create detailed daily schedules for Monday through Friday with SPECIFIC, ACTIONABLE tasks
3. Include specific times, travel considerations, and preparation time
4. Respect the user's schedule preferences and constraints

DETAILED PLANNING INSTRUCTIONS:
- Replace generic "Work focus block" with specific activities like "Review research paper methodology section", "Write introduction for presentation", "Debug authentication module", etc.
- For presentation prep, be specific: "Create slide deck outline", "Design data visualization slides", "Practice presentation delivery", "Review and refine key talking points"
- For grading/TA work: "Grade Assignment 3 - Questions 1-5", "Prepare solutions for problem set", "Review student submissions"
- For meetings: Include prep like "Compile progress update for advisor", "Review last meeting notes", "Prepare questions list"
- For gym sessions: Specify type like "Upper body strength training", "30min cardio + leg day", "Swimming laps", "Yoga/stretching session"
- For cooking: Mention meal type like "Meal prep: Cook chicken and vegetables for 3 days", "Prepare pasta dinner", "Make breakfast burritos for the week"
- For breaks: Add variety like "Walk outside", "Coffee break and journal", "Stretching exercises", "Quick meditation"
- For research work: "Literature review on [topic]", "Data analysis for experiment 2", "Write methods section", "Review peer feedback"
- Include transition/setup time: "Set up workspace", "Review today's priorities", "Email check and responses"

Each task should be actionable and clear enough that the user knows exactly what to do when they see it on their schedule.`,
    description: "Prompt to trigger final plan generation",
    variables: ["chatHistory"]
  }
};

// ===== USER PROFILE PROMPTS =====

export const UserProfilePrompts = {
  /**
   * Default profile for unknown users
   */
  defaultProfile: {
    template: `{temporalContext}

You are planning for a user. Please ask them about their:
- Daily schedule and sleep patterns
- Current commitments and deadlines
- Work style and productivity preferences
- Any regular appointments or constraints
- Goals for the upcoming week`,
    description: "Default profile template for users without detailed information",
    variables: ["temporalContext"]
  },

  /**
   * Hardcoded profile for Harshil (development/testing)
   */
  harshilProfile: {
    template: `{temporalContext}

You are planning for Harshil, a CS Master's student at Stanford, living with roommates in New Jersey.

Personal Details:
- Age: Student in his 20s
- Schedule: Wakes at 8 AM, sleeps at midnight
- Peak productivity: Evening (5-9 PM) and Morning (8-12 PM)
- Location: New Jersey (consider travel time for NYC events)

Weekly Commitments:
- CS-559 ML class: Tuesdays at 7:22 PM
- Shopping Assistant project (due Nov 15, low priority)

Goals & Priorities:
- Complete 800 Leetcode problems for job preparation
- Secure a software engineering job
- Academic excellence in coursework

Work Style:
- Prefers deep work sessions
- Motivated by autonomy and clear goals
- Works well with structured schedules

Challenges to Consider:
- Perfectionism tendencies (don't over-schedule)
- Sometimes unclear priorities (help clarify)
- Easily interrupted (build in buffer time)
- Travels occasionally for events/interviews

Planning Preferences:
- Include breaks and personal time
- Account for travel time to NYC (1.5 hours each way)
- Balance academic work with job preparation
- Maintain social connections and temple visits
- Keep weekends lighter when possible`,
    description: "Detailed profile for Harshil (development user)",
    variables: ["temporalContext"]
  },

  /**
   * Dynamic profile builder from user data
   */
  dynamicProfile: {
    template: `{temporalContext}

You are planning for {name}, {profileDescription}.

{scheduleInfo}

{commitmentsInfo}

{goalsInfo}

{workStyleInfo}

{challengesInfo}

{preferencesInfo}`,
    description: "Template for building profiles from user profile data",
    variables: [
      "temporalContext",
      "name",
      "profileDescription",
      "scheduleInfo",
      "commitmentsInfo",
      "goalsInfo",
      "workStyleInfo",
      "challengesInfo",
      "preferencesInfo"
    ]
  }
};

// ===== CHAT FORMATTING PROMPTS =====

export const ChatPrompts = {
  /**
   * Empty conversation starter
   */
  newConversation: {
    template: "This is the start of a new weekly planning conversation.",
    description: "Message when no chat history exists"
  },

  /**
   * Continuation instruction
   */
  conversationContinuation: {
    template: `Previous conversation:

{formattedMessages}

Please continue the conversation naturally.`,
    description: "Template for formatting chat history",
    variables: ["formattedMessages"]
  }
};

// ===== ERROR AND FALLBACK PROMPTS =====

export const ErrorPrompts = {
  /**
   * Generic API error response
   */
  apiError: {
    template: "I'm having trouble processing right now. Let's try again in a few minutes.",
    description: "Generic message when API calls fail"
  },

  /**
   * Max retries exceeded
   */
  maxRetriesError: {
    template: "I encountered an unexpected error. Please try again.",
    description: "Message when max retry attempts are exceeded"
  },

  /**
   * Processing message while thinking
   */
  processingMessage: {
    template: "I'm processing your request...",
    description: "Fallback message while processing"
  }
};

// ===== PROMPT UTILITY FUNCTIONS =====

/**
 * Replace variables in a prompt template with actual values
 */
export function fillPromptTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }

  return result;
}

/**
 * Generate Bella's system prompt with user profile context
 */
export function generateBellaSystemPrompt(userProfile: string): string {
  return fillPromptTemplate(BellaPrompts.systemPrompt.template, {
    userProfile
  });
}

/**
 * Format chat history for conversation context
 */
export function formatChatHistoryPrompt(
  messages: { role: string; content: string; timestamp: Date }[]
): string {
  if (messages.length === 0) {
    return ChatPrompts.newConversation.template;
  }

  const formattedMessages = messages
    .slice(-10) // Last 10 messages only
    .map(msg => {
      const roleLabel = msg.role === 'assistant' ? 'Bella' : 'Human';
      return `${roleLabel}: ${msg.content}`;
    })
    .join('\n\n');

  return fillPromptTemplate(ChatPrompts.conversationContinuation.template, {
    formattedMessages
  });
}

/**
 * Generate temporal context string
 */
export function generateTemporalContext(): string {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });
  const day = now.getDate();
  const year = now.getFullYear();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return `Today is ${dayName}, ${monthName} ${day}, ${year}. The current time is ${time}.`;
}

/**
 * Build user profile string from profile data
 */
export function buildUserProfile(context: UserProfileContext): string {
  const temporalContext = generateTemporalContext();

  if (!context.name) {
    return fillPromptTemplate(UserProfilePrompts.defaultProfile.template, {
      temporalContext
    });
  }

  // Build dynamic profile sections
  const profileDescription = context.age ?
    `a ${context.age}-year-old professional` :
    'a professional';

  const scheduleInfo = context.schedule ?
    `Schedule: Wakes at ${context.schedule.wakeTime || '8:00 AM'}, sleeps at ${context.schedule.sleepTime || 'midnight'}
Peak productivity: ${context.schedule.peakHours || 'Morning and evening'}` :
    'Schedule: Please ask about their daily routine';

  const commitmentsInfo = context.commitments?.length ?
    `Weekly Commitments:
${context.commitments.map(c => `- ${c}`).join('\n')}` :
    'Weekly Commitments: To be determined';

  const goalsInfo = context.goals?.length ?
    `Goals & Priorities:
${context.goals.map(g => `- ${g}`).join('\n')}` :
    'Goals: Please ask about their priorities';

  const workStyleInfo = context.workStyle?.length ?
    `Work Style:
${context.workStyle.map(w => `- ${w}`).join('\n')}` :
    'Work Style: To be determined';

  const challengesInfo = context.challenges?.length ?
    `Challenges to Consider:
${context.challenges.map(c => `- ${c}`).join('\n')}` :
    'Challenges: Please ask about potential obstacles';

  const preferencesInfo = context.location ?
    `Planning Preferences:
- Consider location: ${context.location}
- Include breaks and personal time
- Balance work and personal commitments` :
    'Planning Preferences: To be determined';

  return fillPromptTemplate(UserProfilePrompts.dynamicProfile.template, {
    temporalContext,
    name: context.name,
    profileDescription,
    scheduleInfo,
    commitmentsInfo,
    goalsInfo,
    workStyleInfo,
    challengesInfo,
    preferencesInfo
  });
}

/**
 * Format MongoDB profile data into natural language for LLM context
 */
export async function formatProfileFromMongoDB(userId: string): Promise<string> {
  try {
    const { getUserProfilesCollection } = await import('./mongodb');
    const profilesCollection = await getUserProfilesCollection();

    const profile = await profilesCollection.findOne({ userId });

    if (!profile) {
      const temporalContext = generateTemporalContext();
      return fillPromptTemplate(UserProfilePrompts.defaultProfile.template, {
        temporalContext
      });
    }

    return formatProfileToNaturalLanguage(profile);
  } catch (error) {
    console.error('Error fetching profile from MongoDB:', error);
    // Fallback to hardcoded profile for development
    return getHardcodedProfile(userId);
  }
}

/**
 * Convert structured profile data to natural language
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatProfileToNaturalLanguage(profile: any): string {
  const temporalContext = generateTemporalContext();

  const personal = profile.personal || {};
  const professional = profile.professional || {};
  const schedule = profile.schedule || {};
  const workStyle = profile.workStyle || {};
  const wellness = profile.wellness || {};
  const commitments = profile.commitments || {};

  // Calculate age from date of birth
  const age = personal.dateOfBirth ?
    new Date().getFullYear() - new Date(personal.dateOfBirth).getFullYear() : null;

  // Build natural language description
  let description = temporalContext + '\n\n';

  // Personal Information
  description += `You are planning for ${personal.name || 'the user'}`;
  if (age) description += `, a ${age}-year-old`;
  if (professional.status) description += ` ${professional.status}`;
  if (professional.organization) description += ` at ${professional.organization}`;
  if (professional.role) description += ` studying/working in ${professional.role}`;
  description += `.`;

  if (personal.location?.city) {
    description += ` They live in ${personal.location.city}`;
    if (personal.background?.livingStatus) {
      description += ` (${personal.background.livingStatus.toLowerCase()})`;
    }
    description += '.';
  }

  description += '\n\n';

  // Schedule & Daily Routine
  description += 'Personal Schedule:\n';
  if (schedule.wakeTime && schedule.sleepTime) {
    description += `- Wakes at ${schedule.wakeTime}, sleeps at ${schedule.sleepTime}\n`;
  }
  if (schedule.workHours?.start && schedule.workHours?.end) {
    description += `- Work hours: ${schedule.workHours.start} to ${schedule.workHours.end}\n`;
  }
  if (schedule.productivePeriods?.length) {
    description += `- Peak productivity: ${schedule.productivePeriods.join(', ')}\n`;
  }
  if (personal.location?.timezone) {
    description += `- Timezone: ${personal.location.timezone}\n`;
  }
  description += '\n';

  // Weekly Commitments
  if (commitments.recurring?.length) {
    description += 'Weekly Commitments:\n';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commitments.recurring.forEach((commitment: any) => {
      description += `- ${commitment.title}: ${commitment.day}s at ${commitment.time}`;
      if (commitment.travelTime) {
        description += ` (${commitment.travelTime} min travel time)`;
      }
      description += '\n';
    });
    description += '\n';
  }

  // Current Projects
  if (commitments.projects?.length) {
    description += 'Current Projects:\n';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commitments.projects.forEach((project: any) => {
      description += `- ${project.name}`;
      if (project.deadline) {
        const deadline = new Date(project.deadline).toLocaleDateString();
        description += ` (due ${deadline})`;
      }
      if (project.priority) {
        description += ` - ${project.priority} priority`;
      }
      description += '\n';
    });
    description += '\n';
  }

  // Goals & Priorities
  if (professional.goals?.shortTerm?.length || professional.goals?.longTerm?.length) {
    description += 'Goals & Priorities:\n';
    if (professional.goals.shortTerm?.length) {
      description += `- Short-term goals: ${professional.goals.shortTerm.join(', ')}\n`;
    }
    if (professional.goals.longTerm?.length) {
      description += `- Long-term goals: ${professional.goals.longTerm.join(', ')}\n`;
    }
    if (professional.goals.skillsDevelopment?.length) {
      description += `- Skills development: ${professional.goals.skillsDevelopment.join(', ')}\n`;
    }
    description += '\n';
  }

  // Work Style & Preferences
  description += 'Work Style:\n';
  if (workStyle.focusDuration) {
    description += `- Prefers ${workStyle.focusDuration}-minute focus sessions\n`;
  }
  if (workStyle.taskPreferences?.length) {
    description += `- Task preferences: ${workStyle.taskPreferences.join(', ')}\n`;
  }
  if (workStyle.motivators?.length) {
    description += `- Motivated by: ${workStyle.motivators.join(', ')}\n`;
  }
  if (schedule.breakPreferences?.frequency && schedule.breakPreferences?.duration) {
    description += `- Break preferences: ${schedule.breakPreferences.duration}-minute breaks every ${schedule.breakPreferences.frequency} hours\n`;
  }
  description += '\n';

  // Challenges & Considerations
  if (workStyle.blockers?.length) {
    description += 'Challenges to Consider:\n';
    workStyle.blockers.forEach((blocker: string) => {
      description += `- ${blocker}\n`;
    });
    description += '\n';
  }

  // Personal Values & Wellness
  if (personal.background?.personalValues?.length) {
    description += `Personal Values: ${personal.background.personalValues.join(', ')}\n`;
  }

  if (wellness.stressManagement?.length) {
    description += `Stress Management: ${wellness.stressManagement.join(', ')}\n`;
  }

  if (wellness.exerciseRoutine) {
    description += `Exercise Routine: ${wellness.exerciseRoutine}\n`;
  }

  description += '\n';

  // Planning Preferences
  description += 'Planning Preferences:\n';
  description += '- Include breaks and personal time\n';
  description += '- Balance work, study, and personal commitments\n';
  if (personal.location?.city?.includes('Jersey') || personal.location?.city?.includes('New York')) {
    description += '- Account for travel time to NYC (1.5 hours each way)\n';
  }
  description += '- Respect the user\'s schedule preferences and constraints\n';
  description += '- Don\'t over-schedule - leave buffer time for flexibility';

  return description;
}

/**
 * Get hardcoded profile for specific user (development fallback)
 */
export function getHardcodedProfile(userId: string): string {
  const temporalContext = generateTemporalContext();

  if (userId === "68cca41fb015304ecc79c64a") {
    return fillPromptTemplate(UserProfilePrompts.harshilProfile.template, {
      temporalContext
    });
  }

  return fillPromptTemplate(UserProfilePrompts.defaultProfile.template, {
    temporalContext
  });
}

// ===== VALIDATION HELPERS =====

/**
 * Validate that all required variables are provided for a template
 */
export function validatePromptVariables(
  template: PromptTemplate,
  variables: Record<string, string>
): boolean {
  if (!template.variables) return true;

  return template.variables.every(variable =>
    variables.hasOwnProperty(variable) && variables[variable] !== undefined
  );
}

/**
 * Get missing variables from a template
 */
export function getMissingVariables(
  template: PromptTemplate,
  variables: Record<string, string>
): string[] {
  if (!template.variables) return [];

  return template.variables.filter(variable =>
    !variables.hasOwnProperty(variable) || variables[variable] === undefined
  );
}