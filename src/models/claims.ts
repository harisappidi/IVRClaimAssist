/**
 * Represents a single status update in the repair claim's lifecycle.
 */
export interface ClaimUpdate {
  date: string;     // ISO 8601 string, e.g., "2025-04-01T09:00:00Z"
  status: string;   // e.g., "In repair", "Completed"
  notes: string;    // e.g., "Parts ordered, repair in progress"
}

/**
 * Represents a vehicle repair claim stored in Firestore under `claims`.
 */
export interface RepairClaim {
  claimId: string;             // Unique claim ID (e.g., "CLM12345")
  customerName: string;        // Full name of the customer
  phoneNumber: string;         // Caller’s phone number
  vehicleInfo: string;         // e.g., "2020 Toyota Camry"
  damageType: string;          // e.g., "Rear bumper damage"
  status: string;              // Current status (e.g., "In repair")
  estimatedCompletion: string; // Date string, e.g., "2025-04-10"
  lastUpdated: string;         // ISO timestamp, e.g., "2025-04-03T14:30:00Z"
  rentalCompany: string;       // e.g., "Enterprise"
  updates: ClaimUpdate[];      // History of status updates
}
