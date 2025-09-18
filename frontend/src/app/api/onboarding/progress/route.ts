import { NextRequest, NextResponse } from 'next/server'
import { OnboardingProgress } from '@/types/onboarding'
import { getOnboardingSessionsCollection } from '@/lib/mongodb'

export async function PUT(request: NextRequest) {
  try {
    const progress: OnboardingProgress = await request.json()

    // Validate the data structure
    if (!progress.currentStep && progress.currentStep !== 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid progress data: missing currentStep' },
        { status: 400 }
      )
    }

    if (!Array.isArray(progress.completedSteps)) {
      return NextResponse.json(
        { success: false, error: 'Invalid progress data: completedSteps must be an array' },
        { status: 400 }
      )
    }

    // Generate or get session ID from request headers/cookies
    // For now, we'll use a simple session ID based on timestamp
    const sessionId = request.headers.get('x-session-id') || `session_${Date.now()}`

    // Save progress to MongoDB
    const onboardingSessionsCollection = await getOnboardingSessionsCollection()

    const sessionData = {
      sessionId,
      currentStep: progress.currentStep,
      completedSteps: progress.completedSteps,
      formData: progress.formData || {},
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire in 24 hours
    }

    // Upsert the session data
    const result = await onboardingSessionsCollection.replaceOne(
      { sessionId },
      {
        ...sessionData,
        createdAt: new Date() // This will only be set on first insert
      },
      { upsert: true }
    )

    console.log('Saved onboarding progress to database:', {
      sessionId,
      currentStep: progress.currentStep,
      completedSteps: progress.completedSteps,
      formDataKeys: Object.keys(progress.formData || {}),
      upserted: result.upsertedCount > 0,
      modified: result.modifiedCount > 0
    })

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Progress saved successfully to database',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving onboarding progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save progress to database' },
      { status: 500 }
    )
  }
}