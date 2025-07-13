// scripts/setAdminRole.ts

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Inicializar la app de Firebase Admin
if (!admin.apps.length) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../firebase-admin-key.json'), 'utf8')
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const setCustomUserClaim = async (email: string) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Usuario ${email} ahora tiene rol: admin`);
  } catch (error) {
    console.error('❌ Error al asignar el rol:', error);
  }
};

// 📌 Reemplazar con el email del admin (John)
const emailDelAdmin = 'lilianpresa@hotmail.com';

setCustomUserClaim(emailDelAdmin);
