/**
 * Represents a log of a single phone call to the IVR system.
 * Tracks who called, how long the call lasted, and its outcome.
 */
export interface CallLog {
  phoneNumber: string;        // Caller’s phone number (used to link with User)
  claimId?: string;           // Optional: Claim ID if discussed during the call
  timestamp: string;          // When the call started (ISO format)
  duration: number;           // Duration of the call in seconds
  status: CallStatus;         // Status of the call
}

/**
 * Enum for call outcomes.
 */
export enum CallStatus {
  COMPLETED = "completed",
  FAILED = "failed",
  ABANDONED = "abandoned"
}
