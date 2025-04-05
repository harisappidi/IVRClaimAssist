/**
 * RepairClaim interface representing a vehicle repair claim in the system.
 * Contains all relevant information about a claim and its current status.
 */
export interface RepairClaim {
  id: string;             // Claim ID
  userId: string;         // Reference to user ID
  vehicleInfo: {
    make: string;         // Vehicle make
    model: string;        // Vehicle model
    year: number;         // Vehicle year
    licensePlate?: string; // Optional license plate
  };
  rentalInfo: {
    rentalCompany: string; // Rental company name
    reservationNumber?: string; // Optional reservation number
  };
  status: ClaimStatus;    // Current status of the claim
  statusDetails?: string; // Optional additional details about the status
  estimatedCompletionDate?: Date; // Optional estimated completion date
  createdAt: Date;        // Claim creation timestamp
  updatedAt: Date;        // Last update timestamp
}

/**
 * Enum defining possible states of a repair claim.
 * Used for consistent status representation throughout the system.
 */
export enum ClaimStatus {
  SUBMITTED = "submitted",
  INSPECTION = "inspection",
  PARTS_ORDERED = "parts_ordered",
  IN_REPAIR = "in_repair",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}