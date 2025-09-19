import { formatProfileFromMongoDB, getHardcodedProfile } from './prompts';

// Helper function to format user profile for Bella's context
export async function formatUserProfile(userId: string): Promise<string> {
  // Use dynamic MongoDB-based profile formatting
  return await formatProfileFromMongoDB(userId);
}

// Synchronous fallback for places that need immediate profile data
export function formatUserProfileSync(userId: string): string {
  // Use centralized profile management as fallback
  return getHardcodedProfile(userId);
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