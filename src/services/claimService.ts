import { claimsCollection } from '../config/firebase';
import { RepairClaim, ClaimUpdate } from '../models/claims';
import { UserService } from './userService';

/**
 * Service for claim-related operations in the IVR system
 */
export class ClaimService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Retrieves a repair claim by its ID
   * @param claimId - The unique identifier of the claim
   * @returns The claim document or null if not found
   */
  async getClaimById(claimId: string): Promise<RepairClaim | null> {
    try {
      // Using getDoc instead of where clause for direct document retrieval
      const claimDoc = await claimsCollection.doc(claimId).get();
      
      if (!claimDoc.exists) {
        return null;
      }
      
      return claimDoc.data() as RepairClaim;
    } catch (error) {
      console.error('Error retrieving claim:', error);
      throw new Error('Failed to retrieve claim');
    }
  }

  /**
   * Gets the latest status update for a claim
   * @param claimId - The unique identifier of the claim
   * @returns The latest status update or null if not found
   */
  async getLatestStatusUpdate(claimId: string): Promise<ClaimUpdate | null> {
    try {
      const claim = await this.getClaimById(claimId);
      
      if (!claim || !claim.updates || claim.updates.length === 0) {
        return null;
      }
      
      // Sort updates by date (most recent first) and return the latest
      const sortedUpdates = [...claim.updates].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      return sortedUpdates[0];
    } catch (error) {
      console.error('Error retrieving latest status update:', error);
      throw new Error('Failed to retrieve latest status update');
    }
  }

  /**
   * Gets a claim using the user's phone number by leveraging the claimId in User model
   * @param phoneNumber - The phone number of the user
   * @returns The claim associated with the user or null if not found
   */
  async getClaimByUserPhone(phoneNumber: string): Promise<RepairClaim | null> {
    try {
      // Get the claim ID from the user record using userService
      const claimId = await this.userService.getUserClaimId(phoneNumber);
      
      if (!claimId) {
        return null;
      }
      
      // Use the claim ID to retrieve the full claim
      return await this.getClaimById(claimId);
    } catch (error) {
      console.error('Error retrieving claim by user phone:', error);
      throw new Error('Failed to retrieve claim by user phone');
    }
  }

  /**
   * Gets claims for a specific phone number
   * @param phoneNumber - The phone number of the customer
   * @returns Array of claims associated with the phone number
   */
  async getClaimsByPhoneNumber(phoneNumber: string): Promise<RepairClaim[]> {
    try {
      const claimsQuery = await claimsCollection
        .where('phoneNumber', '==', phoneNumber)
        .get();
      
      if (claimsQuery.empty) {
        return [];
      }
      
      return claimsQuery.docs.map(doc => doc.data() as RepairClaim);
    } catch (error) {
      console.error('Error retrieving claims by phone number:', error);
      throw new Error('Failed to retrieve claims');
    }
  }

  /**
   * Formats claim information into a human-readable string for TwiML
   * @param claim - The repair claim to format
   * @returns Formatted string with claim information
   */
  formatClaimForVoice(claim: RepairClaim): string {
    const today = new Date();
    const estimatedCompletion = claim.estimatedCompletion ? new Date(claim.estimatedCompletion) : null;
    
    let formattedText = `Your claim for ${claim.vehicleInfo} is currently ${claim.status}. `;
    
    if (estimatedCompletion && estimatedCompletion > today) {
      const daysRemaining = Math.ceil((estimatedCompletion.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      formattedText += `The estimated completion date is ${claim.estimatedCompletion}, which is ${daysRemaining} days from now. `;
    } else if (claim.estimatedCompletion) {
      formattedText += `The estimated completion date was ${claim.estimatedCompletion}. `;
    }
    
    if (claim.updates && claim.updates.length > 0) {
      const latestUpdate = claim.updates[0];
      formattedText += `The most recent update notes: ${latestUpdate.notes}`;
    }
    
    return formattedText;
  }
}