export interface ChatMessage {
  id: string;
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

export interface ChatSession {
  _id?: string;
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  continuationFlag: boolean;
  iteration: number;
  extractedTargets: string[];
  status: 'active' | 'awaiting_user' | 'planning' | 'completed' | 'error';
  createdAt: Date;
  completedAt?: Date;
  weeklyPlanId?: string;
}

export interface TaskItem {
  time: string; // "8:00 AM"
  task: string; // "Wake up and morning routine"
  duration?: number; // duration in minutes
  type?: 'routine' | 'work' | 'break' | 'personal' | 'travel';
}

export interface DayPlan {
  date: Date;
  tasks: TaskItem[];
}

export interface WeeklyPlan {
  _id?: string;
  userId: string;

  // Week identification
  weekStart: Date; // Monday date
  weekEnd: Date; // Friday date

  // Conversation reference
  sessionId: string;

  // Extracted weekly targets from conversation
  weeklyTargets: string[];

  // The actual plan - one entry per day
  days: {
    monday: DayPlan;
    tuesday: DayPlan;
    wednesday: DayPlan;
    thursday: DayPlan;
    friday: DayPlan;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'archived';
}

// API Response types
export interface BellaChatResponse {
  success: boolean;
  message?: string;
  planReady?: boolean;
  weeklyPlan?: WeeklyPlan;
  error?: string;
}

export interface BellaFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Groq Function Call Types
export interface SetContinuationFlagCall {
  continueConversation: boolean;
  reason: string;
  missingInfo?: string[];
}

export interface SaveWeeklyPlanCall {
  weeklyTargets: string[];
  days: {
    monday: DayPlan;
    tuesday: DayPlan;
    wednesday: DayPlan;
    thursday: DayPlan;
    friday: DayPlan;
  };
}

// Error handling types
export interface ErrorNotification {
  type: 'LLM_FAILURE' | 'DB_FAILURE' | 'TIMEOUT' | 'INVALID_INPUT';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalDetails?: unknown;
  timestamp: Date;
}