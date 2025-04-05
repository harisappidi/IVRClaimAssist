import { usersCollection } from '../config/firebase';
import { User, MailingAddress } from '../models/users';

/**
 * Service for user-related operations in the IVR system
 */
export class UserService {
  /**
   * Retrieves a user by their phone number
   * @param phoneNumber - The phone number in E.164 format
   * @returns The user document or null if not found
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    try {
      // Using the phone number as the document ID as specified
      const userDoc = await usersCollection.doc(phoneNumber).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return userDoc.data() as User;
    } catch (error) {
      console.error('Error retrieving user:', error);
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
        return false; // User not found
      }
      
      // Case insensitive name comparison
      const nameMatches = user.fullName.toLowerCase() === fullName.toLowerCase();
      
      // ZIP code verification
      const zipMatches = user.mailingAddress === mailingAddress;
      
      return nameMatches && zipMatches;
    } catch (error) {
      console.error('Error verifying user identity:', error);
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
    } catch (error) {
      console.error('Error updating user verification status:', error);
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
        return null;
      }
      
      return user.claimId;
    } catch (error) {
      console.error('Error retrieving user claim ID:', error);
      throw new Error('Failed to retrieve user claim ID');
    }
  }
}