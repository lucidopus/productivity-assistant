import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromNextRequest, verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { UserProfile, isProfileComplete } from '@/types/profile';

export async function GET(request: NextRequest) {
  try {
    // Get token from request
    const token = getTokenFromNextRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Find user
    const user = await db.collection('users').findOne({
      _id: new ObjectId(payload.userId)
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has completed profile
    const profile = await db.collection('profiles').findOne({
      userId: user._id.toString()
    }) as UserProfile | null;

    let profileComplete = false;
    let onboardingProgress = null;

    if (profile) {
      profileComplete = isProfileComplete(profile);
      onboardingProgress = profile.onboardingProgress;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      hasProfile: !!profile,
      profileComplete,
      onboardingProgress,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}