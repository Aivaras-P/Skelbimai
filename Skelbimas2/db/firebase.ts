// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBxRmI6gX7yZRPuwwCTws98ApB-e22U01s",
  authDomain: "coral-velocity-476514-s3.firebaseapp.com",
  projectId: "coral-velocity-476514-s3",
  storageBucket: "coral-velocity-476514-s3.appspot.com",
  messagingSenderId: "385609255235",
  appId: "1:385609255235:web:cbe0be90a6911e5747c7f6",
  measurementId: "G-XK3BCQVN5S"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);