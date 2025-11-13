// backend/config/firebase.js
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
let firebaseApp;

const initializeFirebase = () => {
  try {
    if (!firebaseApp) {
      const serviceAccount = require('./firebase-service-account.json');
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully');
    }
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
};

// Export Firebase services
const getAuth = () => admin.auth();
const getFirestore = () => admin.firestore();
const getStorage = () => admin.storage();
const getMessaging = () => admin.messaging();

module.exports = {
  initializeFirebase,
  getAuth,
  getFirestore,
  getStorage,
  getMessaging,
  admin
};
