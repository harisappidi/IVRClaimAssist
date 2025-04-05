import { UserService } from './userService';
import { ClaimService } from './claimService';
import { MailingAddress } from '../models/users';

/**
 * Service for coordinating the IVR call flow, handling the sequence of:
 * 1. User identification and verification
 * 2. Claim retrieval
 * 3. Status reporting
 */
export class CallFlowService {
  private userService: UserService;
  private claimService: ClaimService;

  constructor() {
    this.userService = new UserService();
    this.claimService = new ClaimService();
  }

  /**
   * Verifies a user based on their phone number and provided verification data
   * @param phoneNumber - The caller's phone number
   * @param fullName - The caller's provided full name
   * @param zipCode - The caller's provided ZIP code
   * @returns Boolean indicating verification success
   */
  async verifyUser(phoneNumber: string, fullName: string, mailingAddress: MailingAddress): Promise<boolean> {
    try {
      return await this.userService.verifyUserIdentity(phoneNumber, fullName, mailingAddress);
    } catch (error) {
      console.error('Error in user verification flow:', error);
      return false;
    }
  }

  /**
   * Retrieves claim information for a verified user
   * @param phoneNumber - The caller's phone number
   * @returns The formatted claim information or an error message
   */
  async getClaimInfoForVerifiedUser(phoneNumber: string): Promise<string> {
    try {
      // First, try to get the claim using the associated claimId in the user record
      const claim = await this.claimService.getClaimByUserPhone(phoneNumber);
      
      if (claim) {
        return this.claimService.formatClaimForVoice(claim);
      }
      
      // If no claim found via user's claimId, try searching by phone number
      const claims = await this.claimService.getClaimsByPhoneNumber(phoneNumber);
      
      if (claims.length === 0) {
        return "We couldn't find any claims associated with your phone number. Please contact customer service for assistance.";
      }
      
      if (claims.length === 1) {
        return this.claimService.formatClaimForVoice(claims[0]);
      }
      
      // If multiple claims found, provide a summary
      return `We found ${claims.length} claims associated with your phone number. Please contact customer service for detailed information about your claims.`;
    } catch (error) {
      console.error('Error retrieving claim information:', error);
      return "We're experiencing technical difficulties. Please try again later or contact customer service for assistance.";
    }
  }

  /**
   * Handles the complete verification and claim retrieval flow
   * @param phoneNumber - The caller's phone number
   * @param fullName - The caller's provided full name
   * @param zipCode - The caller's provided ZIP code
   * @returns Object with success status and message
   */
  async handleVerificationAndClaimRetrieval(
    phoneNumber: string,
    fullName: string,
    mailingAddress: MailingAddress
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Step 1: Verify the user
      const isVerified = await this.verifyUser(phoneNumber, fullName, mailingAddress);
      
      if (!isVerified) {
        return {
          success: false,
          message: "We couldn't verify your identity. Please check your information and try again, or contact customer service for assistance."
        };
      }
      
      // Step 2: Retrieve and format claim information
      const claimInfo = await this.getClaimInfoForVerifiedUser(phoneNumber);
      
      return {
        success: true,
        message: claimInfo
      };
    } catch (error) {
      console.error('Error in verification and claim retrieval flow:', error);
      return {
        success: false,
        message: "We're sorry, but we encountered an error processing your request. Please try again later or contact customer service for assistance."
      };
    }
  }
}