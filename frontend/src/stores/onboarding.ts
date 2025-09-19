import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OnboardingProgress, UserProfile } from '@/types/profile'

interface OnboardingStore {
  progress: OnboardingProgress | null
  currentFormData: Partial<UserProfile>
  setProgress: (progress: OnboardingProgress) => void
  setCurrentStep: (step: number) => void
  updateFormSection: (section: keyof UserProfile, data: unknown, step: number) => Promise<void>
  markStepCompleted: (step: number) => void
  resetOnboarding: () => void
  loadProfile: () => Promise<void>
}

const initialProgress: OnboardingProgress = {
  currentStep: 1,
  completedSteps: [],
  isComplete: false,
  startedAt: new Date(),
  lastUpdatedAt: new Date(),
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      progress: null,
      currentFormData: {},

      setProgress: (progress: OnboardingProgress) => {
        set({ progress })
      },

      setCurrentStep: (step: number) => {
        set((state) => ({
          progress: state.progress ? {
            ...state.progress,
            currentStep: step,
            lastUpdatedAt: new Date(),
          } : null
        }))
      },

      updateFormSection: async (section: keyof UserProfile, data: unknown, step: number) => {
        // Update local state immediately
        set((state) => ({
          currentFormData: {
            ...state.currentFormData,
            [section]: data
          }
        }))

        try {
          const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              step,
              section,
              data,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Profile update failed:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              requestBody: { step, section, data }
            });
            throw new Error(`Failed to save profile section: ${response.status} ${errorText}`)
          }

          const result = await response.json()

          // Update progress based on server response
          if (result.profile) {
            set((state) => ({
              progress: {
                currentStep: result.profile.currentStep,
                completedSteps: result.profile.completedSteps,
                isComplete: result.profile.isComplete,
                lastActiveStep: result.profile.lastActiveStep,
                startedAt: state.progress?.startedAt || new Date(),
                lastUpdatedAt: new Date(),
              }
            }))
          }

          return result
        } catch (error) {
          console.error('Error saving profile section:', error)
          throw error
        }
      },

      markStepCompleted: (step: number) => {
        set((state) => ({
          progress: state.progress ? {
            ...state.progress,
            completedSteps: state.progress.completedSteps.includes(step)
              ? state.progress.completedSteps
              : [...state.progress.completedSteps, step],
            lastUpdatedAt: new Date(),
          } : null
        }))
      },

      loadProfile: async () => {
        try {
          const response = await fetch('/api/profile/update', {
            method: 'GET',
            credentials: 'include',
          })

          if (response.ok) {
            const result = await response.json()
            if (result.onboardingProgress) {
              set({
                progress: result.onboardingProgress,
                currentFormData: result.profile || {}
              })
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      },

      resetOnboarding: () =>
        set({
          progress: initialProgress,
          currentFormData: {}
        }),
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        progress: state.progress,
        currentFormData: state.currentFormData
      })
    }
  )
)