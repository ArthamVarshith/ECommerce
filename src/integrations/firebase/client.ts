import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCBPsaG0kJNr1Y5qeRnojbcTVKdjjvVvDo",
  authDomain: "ecommerce-548ee.firebaseapp.com",
  projectId: "ecommerce-548ee",
  storageBucket: "ecommerce-548ee.firebasestorage.app",
  messagingSenderId: "852498560815",
  appId: "1:852498560815:web:ca7786bf0d8bafa01f53da",
  measurementId: "G-3K418WMF2S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth & db
export const auth = getAuth(app);
export const db = getFirestore(app);