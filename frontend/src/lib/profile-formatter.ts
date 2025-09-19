// Helper function to format user profile for Bella's context
export function formatUserProfile(userId: string): string {
  // Always include current temporal context in natural language
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });
  const day = now.getDate();
  const year = now.getFullYear();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const temporalContext = `Today is ${dayName}, ${monthName} ${day}, ${year}. The current time is ${time}.`;

  // For now, using hardcoded profile for the specified user ID
  // TODO: Fetch from MongoDB user profile collection
  if (userId === "68cca41fb015304ecc79c64a") {
    return `${temporalContext}

You are planning for Harshil, a CS Master's student at Stanford, living with roommates in New Jersey.

Personal Details:
- Age: Student in his 20s
- Schedule: Wakes at 8 AM, sleeps at midnight
- Peak productivity: Evening (5-9 PM) and Morning (8-12 PM)
- Location: New Jersey (consider travel time for NYC events)

Weekly Commitments:
- CS-559 ML class: Tuesdays at 7:22 PM
- Shopping Assistant project (due Nov 15, low priority)

Goals & Priorities:
- Complete 800 Leetcode problems for job preparation
- Secure a software engineering job
- Academic excellence in coursework

Work Style:
- Prefers deep work sessions
- Motivated by autonomy and clear goals
- Works well with structured schedules

Challenges to Consider:
- Perfectionism tendencies (don't over-schedule)
- Sometimes unclear priorities (help clarify)
- Easily interrupted (build in buffer time)
- Travels occasionally for events/interviews

Planning Preferences:
- Include breaks and personal time
- Account for travel time to NYC (1.5 hours each way)
- Balance academic work with job preparation
- Maintain social connections and temple visits
- Keep weekends lighter when possible`;
  }

  // Default profile for other users
  return `${temporalContext}

You are planning for a user. Please ask them about their:
- Daily schedule and sleep patterns
- Current commitments and deadlines
- Work style and productivity preferences
- Any regular appointments or constraints
- Goals for the upcoming week`;
}

// Helper function to calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}