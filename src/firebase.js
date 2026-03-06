<<<<<<< HEAD
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";   // ✅ ADD THIS


const firebaseConfig = {
   apiKey: "AIzaSyAvtVxYT1IdAfCkha5DcGHmzBWM1tkArG0",
  authDomain: "fiverr-ed0e8.firebaseapp.com",
  projectId: "fiverr-ed0e8",
  storageBucket: "fiverr-ed0e8.firebasestorage.app",
  messagingSenderId: "288376592410",
  appId: "1:288376592410:web:f36deb90a6ba37c37b59a3",
  
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);   
=======
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
   apiKey: "AIzaSyAvtVxYT1IdAfCkha5DcGHmzBWM1tkArG0",
  authDomain: "fiverr-ed0e8.firebaseapp.com",
  projectId: "fiverr-ed0e8",
  storageBucket: "fiverr-ed0e8.firebasestorage.app",
  messagingSenderId: "288376592410",
  appId: "1:288376592410:web:f36deb90a6ba37c37b59a3",
  
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
>>>>>>> d2cf519 (Update project files)
