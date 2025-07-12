// src/firebaseConfig.ts

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAESHeAWAug3kZ7kPjLFcw8us6Fk5X24-Q",
  authDomain: "mutter-games.firebaseapp.com",
  projectId: "mutter-games",
  storageBucket: "mutter-games.firebasestorage.app",
  messagingSenderId: "26777776532",
  appId: "1:26777776532:web:0154bd9503e24aea12df81",
  measurementId: "G-61BRRWRW5H"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);