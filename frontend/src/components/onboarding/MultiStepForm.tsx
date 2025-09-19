'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboarding'
import { ProgressBar } from './ProgressBar'
import { WelcomeScreen } from './WelcomeScreen'
import { PersonalInfoStep } from './steps/PersonalInfoStep'
import { ProfessionalInfoStep } from './steps/ProfessionalInfoStep'
import { ScheduleInfoStep } from './steps/ScheduleInfoStep'
import { WorkStyleStep } from './steps/WorkStyleStep'
import { WellnessStep } from './steps/WellnessStep'
import { CommitmentsStep } from './steps/CommitmentsStep'
import { CompletionStep } from './steps/CompletionStep'

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', completed: false },
  { id: 'personal', title: 'Personal', completed: false },
  { id: 'professional', title: 'Professional', completed: false },
  { id: 'schedule', title: 'Schedule', completed: false },
  { id: 'workstyle', title: 'Work Style', completed: false },
  { id: 'wellness', title: 'Wellness', completed: false },
  { id: 'commitments', title: 'Goals', completed: false },
  { id: 'complete', title: 'Complete', completed: false }
]

export function MultiStepForm() {
  const { progress, setCurrentStep, setProgress, loadProfile } = useOnboardingStore()
  const [showWelcome, setShowWelcome] = useState(true)

  // Initialize progress if it's null
  useEffect(() => {
    if (!progress) {
      // Try to load existing profile first
      loadProfile().then(() => {
        // If still no progress after loading, initialize with default
        const currentProgress = useOnboardingStore.getState().progress
        if (!currentProgress) {
          setProgress({
            currentStep: 1,
            completedSteps: [],
            isComplete: false,
            startedAt: new Date(),
            lastUpdatedAt: new Date(),
          })
        }
      })
    }
  }, [progress, loadProfile, setProgress])

  const currentStepData = ONBOARDING_STEPS.map((step, index) => ({
    ...step,
    completed: progress?.completedSteps?.includes(index + 1) || false
  }))

  const handleGetStarted = () => {
    setShowWelcome(false)
    setCurrentStep(1) // Start with step 1 (1-based indexing)
  }

  const handleNext = () => {
    const currentStep = progress?.currentStep || 1
    const nextStep = currentStep + 1
    if (nextStep <= 6) { // Steps 1-6
      setCurrentStep(nextStep)
    }
  }

  const handlePrevious = () => {
    const currentStep = progress?.currentStep || 1
    const prevStep = currentStep - 1
    if (prevStep >= 1) { // Minimum step is 1
      setCurrentStep(prevStep)
    }
  }

  const handleComplete = async () => {
    // All individual steps have already been saved via updateFormSection
    // Just mark onboarding as complete and show completion step
    setCurrentStep(7) // Completion step
  }

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {(progress?.currentStep || 1) < 7 && (
          <ProgressBar
            currentStep={progress?.currentStep || 1}
            totalSteps={6} // 6 actual form steps (1-6)
            steps={currentStepData.slice(1, -1)} // Exclude welcome and complete from progress
          />
        )}

        <AnimatePresence mode="wait">
          {(progress?.currentStep || 1) === 1 && (
            <PersonalInfoStep
              key="personal"
              onNext={handleNext}
              onPrevious={handlePrevious}
              showPrevious={false}
            />
          )}

          {(progress?.currentStep || 1) === 2 && (
            <ProfessionalInfoStep
              key="professional"
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {(progress?.currentStep || 1) === 3 && (
            <ScheduleInfoStep
              key="schedule"
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {(progress?.currentStep || 1) === 4 && (
            <WorkStyleStep
              key="workstyle"
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {(progress?.currentStep || 1) === 5 && (
            <WellnessStep
              key="wellness"
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {(progress?.currentStep || 1) === 6 && (
            <CommitmentsStep
              key="commitments"
              onNext={handleComplete}
              onPrevious={handlePrevious}
              isLastStep={true}
            />
          )}

          {(progress?.currentStep || 1) === 7 && (
            <CompletionStep key="complete" />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}