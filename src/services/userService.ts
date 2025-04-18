import { usersCollection } from '../config/firebase';
import { User, MailingAddress } from '../models/users';
import pino from 'pino';

/**
 * Service for user-related operations in the IVR system
 */
export class UserService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    });
  }

  /**
   * Formats phone number by removing +1 prefix if present
   * @param phoneNumber - The phone number to format
   * @returns Formatted phone number without +1 prefix
   */
  private formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/^\+1/, '');
  }

  /**
   * Retrieves a user by their phone number
   * @param phoneNumber - The phone number in E.164 format
   * @returns The user document or null if not found
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    try {
      // Remove +1 prefix if present
      const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
      
      // Using the formatted phone number as the document ID
      const userDoc = await usersCollection.doc(formattedPhoneNumber).get();
      
      if (!userDoc.exists) {
        this.logger.info({ phoneNumber: formattedPhoneNumber }, 'User not found');
        return null;
      }
      
      return userDoc.data() as User;
    } catch (error) {
      this.logger.error({ error, phoneNumber }, 'Error retrieving user');
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Verifies a user's identity based on their phone number and provided verification data
   * @param phoneNumber - The caller's phone number
   * @param fullName - The provided full name for verification
   * @param zipCode - The provided ZIP code for address verification
   * @returns Boolean indicating if verification was successful
   */
  async verifyUserIdentity(
    phoneNumber: string, 
    fullName: string, 
    mailingAddress: MailingAddress
  ): Promise<boolean> {
    try {
      const user = await this.getUserByPhoneNumber(phoneNumber);
      
      if (!user) {
        this.logger.info({ phoneNumber }, 'User not found during verification');
        return false; // User not found
      }
      
      // Case insensitive name comparison
      const nameMatches = user.fullName.toLowerCase() === fullName.toLowerCase();
      
      // Full mailing address verification
      const addressMatches = 
        user.mailingAddress.street.toLowerCase() === mailingAddress.street.toLowerCase() &&
        user.mailingAddress.city.toLowerCase() === mailingAddress.city.toLowerCase() &&
        user.mailingAddress.state.toLowerCase() === mailingAddress.state.toLowerCase() &&
        user.mailingAddress.zipCode === mailingAddress.zipCode; // ZIP codes should match exactly

      this.logger.info({
        phoneNumber,
        nameMatches,
        addressMatches
      }, 'Verification attempt result');
      
      return nameMatches && addressMatches;
    } catch (error) {
      this.logger.error({ error, phoneNumber }, 'Error verifying user identity');
      return false;
    }
  }

  /**
   * Updates the verified status of a user
   * @param phoneNumber - The user's phone number
   * @param verified - The verification status to set
   */
  async updateUserVerificationStatus(phoneNumber: string, verified: boolean): Promise<void> {
    try {
      await usersCollection.doc(phoneNumber).update({ verified });
      this.logger.info({ phoneNumber, verified }, 'User verification status updated');
    } catch (error) {
      this.logger.error({ error, phoneNumber }, 'Error updating user verification status');
      throw new Error('Failed to update user verification status');
    }
  }

  /**
   * Gets the claim ID associated with a user
   * @param phoneNumber - The user's phone number
   * @returns The claim ID or null if not found
   */
  async getUserClaimId(phoneNumber: string): Promise<string | null> {
    try {
      const user = await this.getUserByPhoneNumber(phoneNumber);
      
      if (!user || !user.claimId) {
        this.logger.info({ phoneNumber }, 'No claim ID found for user');
        return null;
      }
      
      return user.claimId;
    } catch (error) {
      this.logger.error({ error, phoneNumber }, 'Error retrieving user claim ID');
      throw new Error('Failed to retrieve user claim ID');
    }
  }
}