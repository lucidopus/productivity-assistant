import { z } from 'zod';

// Onboarding progress tracking
export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  isComplete: boolean;
  lastActiveStep?: number;
  startedAt: Date;
  lastUpdatedAt: Date;
}

// Personal Information
export interface PersonalInfo {
  name: string;
  age?: number;
  location?: string;
  timezone?: string;
  background?: string;
  values?: string[];
  personalityType?: string;
}

// Professional Information
export interface ProfessionalInfo {
  status: string;
  currentStatus?: string; // Keep for backward compatibility
  profession?: string;
  experience?: string;
  workLocation?: string;
  industry?: string;
  skills?: string[];
  goals?: string[];
  challenges?: string[];
}

// Schedule Information
export interface ScheduleInfo {
  workingHours?: {
    start: string;
    end: string;
  };
  workingDays?: string[];
  timePreferences?: string[];
  availability?: string;
  routines?: {
    morning?: string;
    evening?: string;
  };
}

// Work Style Information
export interface WorkStyleInfo {
  workStyle?: string[];
  productivity?: {
    peakHours?: string;
    focusTime?: string;
    breakPreferences?: string;
  };
  communication?: {
    style?: string;
    frequency?: string;
    channels?: string[];
  };
  collaboration?: string[];
}

// Wellness Information
export interface WellnessInfo {
  healthGoals?: string[];
  exerciseHabits?: string[];
  sleepPattern?: {
    bedtime?: string;
    wakeTime?: string;
    duration?: string;
  };
  stressManagement?: string[];
  wellnessRoutines?: string[];
}

// Commitments Information
export interface CommitmentsInfo {
  currentProjects?: Array<{
    name: string;
    priority: string;
    deadline?: string;
    description?: string;
  }>;
  weeklyCommitments?: Array<{
    name: string;
    frequency: string;
    timeRequired?: string;
  }>;
  goals?: Array<{
    type: string;
    description: string;
    timeframe?: string;
    priority?: string;
  }>;
}

// Complete User Profile
export interface UserProfile {
  _id?: string;
  userId: string;
  onboardingProgress: OnboardingProgress;
  personal: PersonalInfo;
  professional: ProfessionalInfo;
  schedule: ScheduleInfo;
  workStyle: WorkStyleInfo;
  wellness: WellnessInfo;
  commitments: CommitmentsInfo;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}

// Validation schemas for each step
export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(16).max(100).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  background: z.string().optional(),
  values: z.array(z.string()).optional(),
  personalityType: z.string().optional(),
});

export const professionalInfoSchema = z.object({
  currentStatus: z.string().min(1, 'Current status is required'),
  profession: z.string().optional(),
  experience: z.string().optional(),
  workLocation: z.string().optional(),
  industry: z.string().optional(),
  skills: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
});

export const scheduleInfoSchema = z.object({
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  workingDays: z.array(z.string()).optional(),
  timePreferences: z.array(z.string()).optional(),
  availability: z.string().optional(),
  routines: z.object({
    morning: z.string().optional(),
    evening: z.string().optional(),
  }).optional(),
});

export const workStyleInfoSchema = z.object({
  workStyle: z.array(z.string()).optional(),
  productivity: z.object({
    peakHours: z.string().optional(),
    focusTime: z.string().optional(),
    breakPreferences: z.string().optional(),
  }).optional(),
  communication: z.object({
    style: z.string().optional(),
    frequency: z.string().optional(),
    channels: z.array(z.string()).optional(),
  }).optional(),
  collaboration: z.array(z.string()).optional(),
});

export const wellnessInfoSchema = z.object({
  healthGoals: z.array(z.string()).optional(),
  exerciseHabits: z.array(z.string()).optional(),
  sleepPattern: z.object({
    bedtime: z.string().optional(),
    wakeTime: z.string().optional(),
    duration: z.string().optional(),
  }).optional(),
  stressManagement: z.array(z.string()).optional(),
  wellnessRoutines: z.array(z.string()).optional(),
});

export const commitmentsInfoSchema = z.object({
  currentProjects: z.array(z.object({
    name: z.string(),
    priority: z.string(),
    deadline: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  weeklyCommitments: z.array(z.object({
    name: z.string(),
    frequency: z.string(),
    timeRequired: z.string().optional(),
  })).optional(),
  goals: z.array(z.object({
    type: z.string(),
    description: z.string(),
    timeframe: z.string().optional(),
    priority: z.string().optional(),
  })).optional(),
});

// Helper function to check if profile is complete
export function isProfileComplete(profile: UserProfile): boolean {
  const requiredFields = [
    profile.personal?.name,
    profile.professional?.status || profile.professional?.currentStatus,
  ];

  const requiredSteps = [1, 2, 3, 4, 5, 6]; // All onboarding steps
  const completedAllSteps = requiredSteps.every(step =>
    profile.onboardingProgress.completedSteps.includes(step)
  );

  return requiredFields.every(field => field && field.trim().length > 0) && completedAllSteps;
}

// Helper function to create empty profile
export function createEmptyProfile(userId: string): Omit<UserProfile, '_id'> {
  const now = new Date();

  return {
    userId,
    onboardingProgress: {
      currentStep: 1,
      completedSteps: [],
      isComplete: false,
      startedAt: now,
      lastUpdatedAt: now,
    },
    personal: {
      name: '',
    },
    professional: {
      currentStatus: '',
    },
    schedule: {},
    workStyle: {},
    wellness: {},
    commitments: {},
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1,
    },
  };
}