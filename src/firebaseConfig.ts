// src/firebaseConfig.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Importante:
 * Este archivo está configurado para leer únicamente variables de entorno.
 * Así evitamos exponer claves ni volver a apuntar al proyecto de Mutter.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app }; // named export para poder importar { app } en cualquier archivo
export default app;

// --- DEBUG: confirmar proyecto en runtime (local y Vercel) ---
try {
  console.log("🔥 Firebase projectId:", app.options.projectId);
  console.log("🔥 Firebase authDomain:", (app.options as any).authDomain);
} catch (e) {
  console.warn("No se pudo imprimir firebase app options:", e);
}
// --- FIN DEBUG ---