import { z } from 'zod'

export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.date({
    message: 'Date of birth is required'
  }),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    timezone: z.string().min(1, 'Timezone is required')
  }),
  background: z.object({
    livingStatus: z.string().min(1, 'Living status is required'),
    culturalContext: z.string().optional(),
    personalValues: z.array(z.string()).min(1, 'Please select at least one value')
  })
})

export const professionalInfoSchema = z.object({
  status: z.enum(['student', 'employed', 'self-employed', 'other'], {
    message: 'Please select your current status'
  }),
  organization: z.string().optional(),
  role: z.string().optional(),
  experience: z.number().min(0).optional(),
  workLocation: z.enum(['remote', 'hybrid', 'onsite'], {
    message: 'Please select your work location'
  }),
  goals: z.object({
    shortTerm: z.array(z.string()).min(1, 'Please add at least one short-term goal'),
    longTerm: z.array(z.string()).min(1, 'Please add at least one long-term goal'),
    skillsDevelopment: z.array(z.string()).min(1, 'Please add at least one skill to develop')
  })
})

export const scheduleInfoSchema = z.object({
  wakeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
  sleepTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
  workHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time')
  }),
  productivePeriods: z.array(z.string()).min(1, 'Please select at least one productive period'),
  breakPreferences: z.object({
    frequency: z.number().min(1, 'Frequency must be at least 1'),
    duration: z.number().min(5, 'Duration must be at least 5 minutes')
  })
})

export const workStyleSchema = z.object({
  planningPreference: z.enum(['detailed', 'flexible', 'mixed'], {
    message: 'Please select your planning preference'
  }),
  focusDuration: z.string({
    message: 'Please select your focus duration'
  }).transform((val) => parseInt(val, 10)).pipe(
    z.number().min(15, 'Focus duration must be at least 15 minutes')
  ),
  taskPreferences: z.array(z.string()).min(1, 'Please select at least one task preference'),
  motivators: z.array(z.string()).min(1, 'Please select at least one motivator'),
  blockers: z.array(z.string()).min(1, 'Please select at least one blocker')
})

export const wellnessSchema = z.object({
  exerciseRoutine: z.string().optional(),
  energyPatterns: z.object({
    morning: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(10)),
    afternoon: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(10)),
    evening: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(10))
  }),
  stressManagement: z.array(z.string()).min(1, 'Please select at least one stress management technique')
})

export const commitmentsSchema = z.object({
  recurring: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    day: z.string().optional(),
    time: z.string().optional(),
    endTime: z.string().optional(),
    travelTime: z.number().min(0, 'Travel time must be 0 or more minutes').optional()
  })),
  projects: z.array(z.object({
    name: z.string().min(1, 'Project name is required'),
    deadline: z.date().optional(),
    priority: z.enum(['high', 'medium', 'low'])
  }))
})

export const userProfileSchema = z.object({
  personal: personalInfoSchema,
  professional: professionalInfoSchema,
  schedule: scheduleInfoSchema,
  workStyle: workStyleSchema,
  wellness: wellnessSchema,
  commitments: commitmentsSchema,
  metadata: z.object({
    onboardingCompleted: z.date(),
    lastUpdated: z.date(),
    profileVersion: z.string()
  })
})