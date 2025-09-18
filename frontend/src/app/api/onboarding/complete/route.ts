import { NextRequest, NextResponse } from 'next/server'
import { UserProfile } from '@/types/onboarding'
import { getUserProfilesCollection } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const profileData: Partial<UserProfile> = await request.json()

    // Basic validation
    if (!profileData) {
      return NextResponse.json(
        { success: false, error: 'No profile data provided' },
        { status: 400 }
      )
    }

    // Generate a user ID (in a real app, this would come from your auth system)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`

    // Create a complete user profile with metadata
    const completeProfile = {
      userId,
      ...profileData,
      metadata: {
        onboardingCompleted: new Date(),
        lastUpdated: new Date(),
        profileVersion: '1.0.0'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Save to MongoDB
    const userProfilesCollection = await getUserProfilesCollection()
    const result = await userProfilesCollection.insertOne(completeProfile)

    console.log('Successfully saved user profile to database:', {
      userId,
      insertedId: result.insertedId,
      hasPersonal: !!completeProfile.personal,
      hasProfessional: !!completeProfile.professional,
      hasSchedule: !!completeProfile.schedule,
      hasWorkStyle: !!completeProfile.workStyle,
      hasWellness: !!completeProfile.wellness,
      hasCommitments: !!completeProfile.commitments,
      completedAt: completeProfile.metadata.onboardingCompleted
    })

    return NextResponse.json({
      success: true,
      userId,
      profileId: result.insertedId.toString(),
      message: 'Onboarding completed successfully and saved to database',
      profile: {
        id: userId,
        completedAt: completeProfile.metadata.onboardingCompleted,
        version: completeProfile.metadata.profileVersion
      },
      nextSteps: {
        dashboardUrl: '/dashboard',
        slackSetupUrl: '/setup/slack',
        firstPlanningDate: getNextSundayEvening()
      }
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding and save to database' },
      { status: 500 }
    )
  }
}

function getNextSundayEvening(): string {
  const now = new Date()
  const nextSunday = new Date(now)

  // Find next Sunday
  const daysUntilSunday = (7 - now.getDay()) % 7
  if (daysUntilSunday === 0 && now.getHours() >= 21) {
    // If it's already Sunday evening, go to next Sunday
    nextSunday.setDate(now.getDate() + 7)
  } else {
    nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday))
  }

  // Set to 9 PM
  nextSunday.setHours(21, 0, 0, 0)

  return nextSunday.toISOString()
}