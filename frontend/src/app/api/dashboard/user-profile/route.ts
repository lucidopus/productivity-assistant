import { NextRequest, NextResponse } from 'next/server'
import { getUserProfilesCollection, getOnboardingSessionsCollection } from '@/lib/mongodb'
import { UserProfile } from '@/types/onboarding'

export async function GET(request: NextRequest) {
  try {
    // For now, we'll get the most recent completed onboarding session
    // In a real app, you'd use user authentication to get the specific user's data
    const onboardingSessionsCollection = await getOnboardingSessionsCollection()

    // Find the most recent session with completed onboarding data
    const recentSession = await onboardingSessionsCollection
      .findOne(
        {
          'formData.personal': { $exists: true },
          'formData.professional': { $exists: true },
          'formData.schedule': { $exists: true },
          'formData.workStyle': { $exists: true },
          'formData.wellness': { $exists: true },
          'formData.commitments': { $exists: true }
        },
        { sort: { updatedAt: -1 } }
      )

    if (!recentSession || !recentSession.formData) {
      return NextResponse.json(
        { success: false, error: 'No completed user profile found' },
        { status: 404 }
      )
    }

    // Convert the MongoDB document to our UserProfile type
    const userProfile: UserProfile = {
      personal: {
        ...recentSession.formData.personal,
        dateOfBirth: new Date(recentSession.formData.personal.dateOfBirth)
      },
      professional: recentSession.formData.professional,
      schedule: recentSession.formData.schedule,
      workStyle: recentSession.formData.workStyle,
      wellness: recentSession.formData.wellness,
      commitments: {
        ...recentSession.formData.commitments,
        projects: recentSession.formData.commitments.projects?.map((project: any) => ({
          ...project,
          deadline: project.deadline ? new Date(project.deadline) : undefined
        })) || []
      },
      metadata: {
        onboardingCompleted: new Date(recentSession.createdAt),
        lastUpdated: new Date(recentSession.updatedAt),
        profileVersion: "1.0"
      }
    }

    return NextResponse.json({
      success: true,
      data: userProfile,
      sessionId: recentSession.sessionId
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}