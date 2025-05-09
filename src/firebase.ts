// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD6Blhu3eNWqRk8twwM7zccXNlOET_iadk",
  authDomain: "tu-casaca-deportiva.firebaseapp.com",
  projectId: "tu-casaca-deportiva",
  storageBucket: "tu-casaca-deportiva.appspot.com",
  messagingSenderId: "556546831204",
  appId: "1:556546831204:web:98a9137ef6b011810e8071",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export const firebaseDB = db;