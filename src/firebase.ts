import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: process.env.PORTAL_APP_API_KEY,
  authDomain: process.env.PORTAL_APP_AUTH_DOMAIN,
  databaseURL: process.env.PORTAL_APP_DB_URL,
  projectId: process.env.PORTAL_APP_PROJECT_ID,
  storageBucket: process.env.PORTAL_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.PORTAL_APP_MESSAGING_SENDER_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
