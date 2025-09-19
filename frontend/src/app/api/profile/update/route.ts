import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getTokenFromNextRequest, verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import {
  isProfileComplete,
  UserProfile
} from '@/types/profile';

// Remove module-level schema definition - will create inside function

export async function POST(request: NextRequest) {
  try {
    // Get token and verify user
    const token = getTokenFromNextRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Manual validation to avoid Zod module caching issues
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { step, section, data } = body;

    // Validate step
    if (typeof step !== 'number' || step < 1 || step > 6) {
      return NextResponse.json(
        { error: 'Invalid step number' },
        { status: 400 }
      );
    }

    // Validate section
    const validSections = ['personal', 'professional', 'schedule', 'workStyle', 'wellness', 'commitments'];
    if (typeof section !== 'string' || !validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

    // Validate data exists
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data object' },
        { status: 400 }
      );
    }

    const validatedData = { step, section, data };

    // For now, accept the data as-is (we can add detailed validation later)
    const validatedSectionData = data;

    // Connect to database
    const { db } = await connectToDatabase();

    // Find the user's profile
    const profile = await db.collection('profiles').findOne({
      userId: payload.userId
    }) as UserProfile | null;

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Update the profile with new section data
    const updatedCompletedSteps = [...new Set([...profile.onboardingProgress.completedSteps, step])];

    // Update currentStep to the next step if this step is completed and it's not the last step
    const nextStep = step < 6 ? step + 1 : (step === 6 ? 7 : step); // Step 7 is completion

    const updateData = {
      [`${section}`]: validatedSectionData,
      'onboardingProgress.completedSteps': updatedCompletedSteps,
      'onboardingProgress.currentStep': nextStep,
      'onboardingProgress.lastActiveStep': step,
      'onboardingProgress.lastUpdatedAt': new Date(),
      'metadata.updatedAt': new Date(),
      'metadata.version': profile.metadata.version + 1,
    };

    // Update the profile
    const result = await db.collection('profiles').updateOne(
      { userId: payload.userId },
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get the updated profile to check completion
    const updatedProfile = await db.collection('profiles').findOne({
      userId: payload.userId
    }) as UserProfile | null;

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated profile' },
        { status: 500 }
      );
    }

    // Check if profile is now complete
    const isComplete = isProfileComplete(updatedProfile);

    // Update completion status if needed
    if (step === 6 || (isComplete && !updatedProfile.onboardingProgress.isComplete)) {
      await db.collection('profiles').updateOne(
        { userId: payload.userId },
        {
          $set: {
            'onboardingProgress.isComplete': true,
            'onboardingProgress.currentStep': 7, // Completion step
            'metadata.updatedAt': new Date(),
          }
        }
      );
    }

    // If step 6 was completed, set to completion step
    const finalStep = step === 6 ? 7 : nextStep;

    return NextResponse.json({
      success: true,
      profile: {
        currentStep: finalStep,
        completedSteps: updatedCompletedSteps,
        isComplete: step === 6 || isComplete,
        lastActiveStep: step,
      },
      message: `${section} information updated successfully`
    });

  } catch (error) {
    console.error('Profile update error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current profile state
export async function GET(request: NextRequest) {
  try {
    // Get token and verify user
    const token = getTokenFromNextRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
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
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: profile,
      onboardingProgress: profile.onboardingProgress,
    });

  } catch (error) {
    console.error('Profile get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}