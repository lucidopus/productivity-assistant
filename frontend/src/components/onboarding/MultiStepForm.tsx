'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const { progress, setCurrentStep, markStepCompleted } = useOnboardingStore()
  const [showWelcome, setShowWelcome] = useState(true)

  const currentStepData = ONBOARDING_STEPS.map(step => ({
    ...step,
    completed: progress.completedSteps.includes(step.id)
  }))

  const handleGetStarted = () => {
    setShowWelcome(false)
    setCurrentStep(0)
    markStepCompleted('welcome')
  }

  const handleNext = () => {
    const nextStep = progress.currentStep + 1
    if (nextStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(nextStep)
      markStepCompleted(ONBOARDING_STEPS[progress.currentStep].id)
    }
  }

  const handlePrevious = () => {
    const prevStep = progress.currentStep - 1
    if (prevStep >= 0) {
      setCurrentStep(prevStep)
    }
  }

  const handleComplete = async () => {
    markStepCompleted(ONBOARDING_STEPS[progress.currentStep].id)

    // Here you would typically save to the backend
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progress.formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      // Move to completion step (step 6, which is index 6)
      setCurrentStep(6)
    } catch (error) {
      console.error('Error saving profile:', error)
      // Still show completion even if save fails
      setCurrentStep(6)
    }
  }

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {progress.currentStep < 6 && (
          <ProgressBar
            currentStep={progress.currentStep}
            totalSteps={6} // 6 actual form steps (0-5)
            steps={currentStepData.slice(1, -1)} // Exclude welcome and complete from progress
          />
        )}

        <AnimatePresence mode="wait">
          {progress.currentStep === 0 && (
            <PersonalInfoStep
              key="personal"
              onNext={handleNext}
              onPrevious={handlePrevious}
              showPrevious={false}
            />
          )}

          {progress.currentStep === 1 && (
            <ProfessionalInfoStep
              key="professional"
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {progress.currentStep === 2 && (
            <ScheduleInfoStep
              key="schedule"
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {progress.currentStep === 3 && (
            <WorkStyleStep
              key="workstyle"
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {progress.currentStep === 4 && (
            <WellnessStep
              key="wellness"
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {progress.currentStep === 5 && (
            <CommitmentsStep
              key="commitments"
              onNext={handleComplete}
              onPrevious={handlePrevious}
              isLastStep={true}
            />
          )}

          {progress.currentStep === 6 && (
            <CompletionStep key="complete" />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}