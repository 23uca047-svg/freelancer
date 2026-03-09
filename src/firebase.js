import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const env = process.env;

const firebaseConfig = {
  apiKey: env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAvtVxYT1IdAfCkha5DcGHmzBWM1tkArG0",
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN || "fiverr-ed0e8.firebaseapp.com",
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID || "fiverr-ed0e8",
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET || "fiverr-ed0e8.firebasestorage.app",
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "288376592410",
  appId: env.REACT_APP_FIREBASE_APP_ID || "1:288376592410:web:f36deb90a6ba37c37b59a3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
