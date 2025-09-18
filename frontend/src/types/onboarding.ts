export interface UserProfile {
  // Personal Information
  personal: {
    name: string;
    dateOfBirth: Date;
    location: {
      city: string;
      country: string;
      timezone: string;
    };
    background: {
      livingStatus: string;
      culturalContext?: string;
      personalValues: string[];
    };
  };

  // Professional Information
  professional: {
    status: 'student' | 'employed' | 'self-employed' | 'other';
    organization?: string;
    role?: string;
    experience?: number;
    workLocation: 'remote' | 'hybrid' | 'onsite';
    goals: {
      shortTerm: string[];
      longTerm: string[];
      skillsDevelopment: string[];
    };
  };

  // Schedule & Routines
  schedule: {
    wakeTime: string;
    sleepTime: string;
    workHours: {
      start: string;
      end: string;
    };
    productivePeriods: string[];
    breakPreferences: {
      frequency: number;
      duration: number;
    };
  };

  // Work Style
  workStyle: {
    planningPreference: 'detailed' | 'flexible' | 'mixed';
    focusDuration: number;
    taskPreferences: string[];
    motivators: string[];
    blockers: string[];
  };

  // Health & Wellness
  wellness: {
    exerciseRoutine?: string;
    energyPatterns: {
      morning: number;
      afternoon: number;
      evening: number;
    };
    stressManagement: string[];
  };

  // Current Commitments
  commitments: {
    recurring: Array<{
      title: string;
      frequency: string;
      day?: string;
      time?: string;
      endTime?: string;
      travelTime?: number; // in minutes
    }>;
    projects: Array<{
      name: string;
      deadline?: Date;
      priority: 'high' | 'medium' | 'low';
    }>;
  };

  // Metadata
  metadata: {
    onboardingCompleted: Date;
    lastUpdated: Date;
    profileVersion: string;
  };
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: string[];
  formData: Partial<UserProfile>;
}