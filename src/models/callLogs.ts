/**
 * CallLog interface for tracking interactions with the IVR system.
 * Used for analytics, debugging, and improving the user experience.
 */
export interface CallLog {
  id: string;             // Call ID
  callSid: string;        // Twilio Call SID
  userId?: string;        // Reference to user ID (if identified)
  claimId?: string;       // Reference to claim ID (if retrieved)
  phoneNumber: string;    // Caller's phone number
  callFlow: CallFlowStep[]; // Array of steps in the call flow
  status: CallStatus;     // Call status
  startTime: Date;        // Call start timestamp
  endTime?: Date;         // Call end timestamp (if completed)
  duration?: number;      // Call duration in seconds (if completed)
}

/**
 * Enum defining possible states of a call.
 */
export enum CallStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  ABANDONED = "abandoned"
}

/**
 * Interface representing a step in the IVR call flow.
 * Used for detailed tracking of the conversation flow.
 */
export interface CallFlowStep {
  step: string;           // Step identifier (e.g., "welcome", "verification")
  input?: string;         // User input if applicable
  timestamp: Date;        // When this step occurred
  success?: boolean;      // Whether the step was successful
  details?: string;       // Additional details about the step
}