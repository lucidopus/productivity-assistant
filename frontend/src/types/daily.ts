import { ObjectId } from 'mongodb';
import { TaskItem } from './bella';

export interface DailyConversation {
  _id?: ObjectId;
  user_id: string;
  user_message: {
    type: 'user' | 'system';
    message: string;
  };
  assistant_message: {
    type: 'assistant';
    message: string;
  };
  tool_usage: Array<{
    tool: 'get_today_plan' | 'update_weekly_plan' | 'reschedule_task';
    toolInput: Record<string, unknown>;
    log: string;
    output: unknown;
  }>;
  timestamp: Date;
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  weekly_plan_id?: string;
  context?: {
    tasks_completed?: string[];
    tasks_rescheduled?: Array<{
      original: TaskItem;
      new: TaskItem;
      reason: string;
    }>;
  };
}

export interface GetTodayPlanInput {
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
}

export interface UpdateWeeklyPlanInput {
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  updatedTasks: TaskItem[];
}

export interface RescheduleTaskInput {
  originalTask: TaskItem;
  originalDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  reason: string;
  preferredDays?: string[];
}

export interface RescheduleTaskOutput {
  success: boolean;
  rescheduledTo: string;
  reason: string;
  newTimeSlot: string;
}

export interface DailyAssistantRequest {
  message: string;
  userId?: string;
}

export interface DailyAssistantResponse {
  success: boolean;
  message: string;
  tools_used?: string[];
  error?: string;
}

export interface DailyBriefing {
  date: Date;
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  tasks: TaskItem[];
  tasksCount: number;
  estimatedDuration: number;
}

export type WeekdayType = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export type ChatType = 'weekly' | 'daily';