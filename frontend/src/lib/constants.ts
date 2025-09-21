/**
 * Shared constants for the productivity assistant application
 */

// Hardcoded user ID as specified in the implementation plan
// This should eventually be replaced with dynamic user management
export const HARDCODED_USER_ID = "68cca41fb015304ecc79c64a";

// Other application constants can be added here as needed
export const APP_CONFIG = {
  // Default timezone for the application
  DEFAULT_TIMEZONE: "America/New_York",

  // Default work hours
  DEFAULT_WORK_START: "10:00",
  DEFAULT_WORK_END: "20:00",

  // Default session settings
  DEFAULT_FOCUS_SESSION_DURATION: 120, // minutes
  DEFAULT_BREAK_DURATION: 30, // minutes
} as const;