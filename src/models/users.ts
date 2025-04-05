/**
 * User interface representing a customer in the IVRClaimAssist system.
 * Contains information needed for user identification and verification.
 */
export interface User {
  id: string;             // User ID
  phone: string;          // Phone number (E.164 format)
  firstName: string;      // First name
  lastName: string;       // Last name
  email?: string;         // Optional email
  mailingAddress: {       // Mailing address for verification
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;        // User creation timestamp
  updatedAt: Date;        // Last update timestamp
}