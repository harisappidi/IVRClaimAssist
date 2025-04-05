/**
 * Represents a user (caller) in the IVRClaimAssist system.
 * Matches structure in Firestore `users` collection.
 */
export interface User {
  phoneNumber: string;        // Used as doc ID and for matching
  fullName: string;           // Full name of the user
  email?: string;             // Optional email
  mailingAddress: string;     // Full address as a string
  verified: boolean;          // Voice verification flag
}
