const admin = require('firebase-admin');

const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

let firebaseApp;
try {
  firebaseApp = admin.initializeApp(firebaseConfig);
} catch (err) {
  // Already initialized or missing config — allow graceful degradation
  console.warn('Firebase init skipped:', err.message);
}

module.exports = { admin, firebaseApp };
