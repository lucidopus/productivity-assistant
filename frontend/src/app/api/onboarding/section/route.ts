import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { section, data } = await request.json()

    if (!section || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing section or data' },
        { status: 400 }
      )
    }

    // Validate section names
    const validSections = [
      'personal', 'professional', 'schedule', 'workStyle', 'wellness', 'commitments'
    ]

    if (!validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section name' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Validate the data against the appropriate schema
    // 2. Save the section data to database
    // 3. Return validation results

    console.log(`Saving onboarding section: ${section}`, {
      dataKeys: Object.keys(data),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      section,
      message: `${section} section saved successfully`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving onboarding section:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save section data' },
      { status: 500 }
    )
  }
}