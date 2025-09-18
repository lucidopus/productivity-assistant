import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OnboardingProgress, UserProfile } from '@/types/onboarding'
import { debounce } from '@/lib/utils'

interface OnboardingStore {
  progress: OnboardingProgress
  setCurrentStep: (step: number) => void
  setFormData: (data: Partial<UserProfile>) => void
  updateFormSection: (section: keyof UserProfile, data: any) => void
  markStepCompleted: (stepId: string) => void
  resetOnboarding: () => void
  saveProgress: () => Promise<void>
}

const initialProgress: OnboardingProgress = {
  currentStep: 0,
  completedSteps: [],
  formData: {}
}

// Create a debounced save function
const debouncedSave = debounce(async (progress: OnboardingProgress) => {
  try {
    const response = await fetch('/api/onboarding/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progress),
    })

    if (!response.ok) {
      console.error('Failed to save progress:', response.statusText)
    }
  } catch (error) {
    console.error('Error saving progress:', error)
  }
}, 1000)

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      progress: initialProgress,

      setCurrentStep: (step: number) => {
        set((state) => ({
          progress: {
            ...state.progress,
            currentStep: step
          }
        }))
        // Auto-save progress
        debouncedSave(get().progress)
      },

      setFormData: (data: Partial<UserProfile>) => {
        set((state) => ({
          progress: {
            ...state.progress,
            formData: { ...state.progress.formData, ...data }
          }
        }))
        // Auto-save progress
        debouncedSave(get().progress)
      },

      updateFormSection: (section: keyof UserProfile, data: any) => {
        set((state) => ({
          progress: {
            ...state.progress,
            formData: {
              ...state.progress.formData,
              [section]: data
            }
          }
        }))
        // Auto-save progress
        debouncedSave(get().progress)
      },

      markStepCompleted: (stepId: string) => {
        set((state) => ({
          progress: {
            ...state.progress,
            completedSteps: state.progress.completedSteps.includes(stepId)
              ? state.progress.completedSteps
              : [...state.progress.completedSteps, stepId]
          }
        }))
        // Auto-save progress
        debouncedSave(get().progress)
      },

      resetOnboarding: () =>
        set({
          progress: initialProgress
        }),

      saveProgress: async () => {
        const { progress } = get()
        try {
          const response = await fetch('/api/onboarding/progress', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(progress),
          })

          if (!response.ok) {
            throw new Error('Failed to save progress')
          }
        } catch (error) {
          console.error('Error saving progress:', error)
          throw error
        }
      }
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({ progress: state.progress })
    }
  )
)