import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for required Firebase environment variables
const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error('Missing Firebase configuration environment variables');
}

// Initialize Firebase Admin SDK if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      // The private key needs to be properly formatted as it comes from .env with escaped newlines
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Export Firestore instance
export const db = admin.firestore();

// Export collections with proper typing
export const usersCollection = db.collection('users');
export const claimsCollection = db.collection('claims');

// Export admin for other potential uses
export default admin;