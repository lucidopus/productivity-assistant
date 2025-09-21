import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyPlansCollection } from '@/lib/mongodb';
import { HARDCODED_USER_ID } from '@/lib/constants';

// GET: Fetch current active weekly plan
export async function GET() {
  try {
    const weeklyPlansCollection = await getWeeklyPlansCollection();

    // Find the most recent active weekly plan
    const plan = await weeklyPlansCollection.findOne(
      {
        userId: HARDCODED_USER_ID,
        status: 'active'
      },
      { sort: { createdAt: -1 } }
    );

    if (!plan) {
      return NextResponse.json({
        success: true,
        plan: null,
        hasActivePlan: false
      });
    }

    return NextResponse.json({
      success: true,
      plan: {
        _id: plan._id,
        userId: plan.userId,
        weekStart: plan.weekStart,
        weekEnd: plan.weekEnd,
        weeklyTargets: plan.weeklyTargets,
        days: plan.days,
        createdAt: plan.createdAt,
        status: plan.status
      },
      hasActivePlan: true
    });

  } catch (error) {
    console.error('Plans API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Fetch plan history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { limit = 5 } = body;

    const weeklyPlansCollection = await getWeeklyPlansCollection();

    const plans = await weeklyPlansCollection.find(
      { userId: HARDCODED_USER_ID },
      {
        sort: { createdAt: -1 },
        limit: parseInt(limit)
      }
    ).toArray();

    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        _id: plan._id,
        weekStart: plan.weekStart,
        weekEnd: plan.weekEnd,
        weeklyTargets: plan.weeklyTargets,
        status: plan.status,
        createdAt: plan.createdAt
      }))
    });

  } catch (error) {
    console.error('Plan history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}