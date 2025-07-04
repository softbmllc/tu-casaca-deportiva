// backend/api/save-customer.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../../../secrets/firebase-admin.json')),
  });
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, ...rest } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await db.collection('customers').doc(email).set(rest, { merge: true });

    return res.status(200).json({ message: 'Cliente guardado correctamente' });
  } catch (error: any) {
    console.error('🔥 Error al guardar cliente:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}