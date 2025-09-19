import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { UserProfile, isProfileComplete } from '@/types/profile'
import { getTokenFromNextRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get token and verify user
    const token = getTokenFromNextRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Find the user's profile
    const profile = await db.collection('profiles').findOne({
      userId: payload.userId
    }) as UserProfile | null;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'No user profile found' },
        { status: 404 }
      )
    }

    // Check if profile is complete
    const profileComplete = isProfileComplete(profile);

    if (!profileComplete) {
      return NextResponse.json(
        { success: false, error: 'Profile not completed yet' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile,
      profileComplete,
      onboardingProgress: profile.onboardingProgress
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}