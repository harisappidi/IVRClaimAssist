/**
 * Represents a user (caller) in the IVRClaimAssist system.
 * Matches structure in Firestore `users` collection.
 */
export interface MailingAddress {
  street: string;            // Street address
  city: string;              // City
  state: string;             // State or province
  zipCode: string;           // ZIP or postal code
}
export interface User {
  phoneNumber: string;        // Used as doc ID and for matching
  fullName: string;           // Full name of the user
  email?: string;             // Optional email
  mailingAddress: MailingAddress;     // Full address as a nested object
  verified: boolean;          // Voice verification flag
}
