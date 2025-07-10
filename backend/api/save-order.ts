// backend/api/save-order.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Buffer } from 'buffer';
import { adjustStockAfterOrder } from '../../src/utils/orderUtils';

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY as string);

if (!(global as any).firebaseApp) {
  (global as any).firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    interface OrderPayload {
      items: any[];
      shippingInfo: any;
      emailCliente: string;
      paymentIntentId: string;
      paymentIntentStatus?: string;
      [key: string]: any;
    }

    const order = JSON.parse(rawBody.toString()) as OrderPayload;
    console.log("📦 Received order:", order);

    // Validación mínima
    if (!order.items || !order.shippingInfo || !order.emailCliente || !order.paymentIntentId) {
      return res.status(400).json({ error: 'Missing required fields in order payload.' });
    }

    // Verificar que el estado del paymentIntent sea 'succeeded'
    if (order.paymentIntentStatus !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful. Order not saved.' });
    }

    // Guardar orden en Firebase (estructura mejorada)
    const docRef = await db.collection('orders').add({
      items: order.items,
      client: {
        name: order.shippingInfo?.name || '',
        email: order.shippingInfo?.email || '',
        phone: order.shippingInfo?.phone || '',
        address: order.shippingInfo?.address || '',
        address2: order.shippingInfo?.address2 || '',
        city: order.shippingInfo?.city || '',
        state: order.shippingInfo?.state || '',
        zip: order.shippingInfo?.zip || '',
        country: order.shippingInfo?.country || '',
      },
      shippingInfo: order.shippingInfo,
      paymentIntentId: order.paymentIntentId,
      paymentIntentStatus: order.paymentIntentStatus,
      createdAt: new Date(),
      totalAmount: order.totalAmount || 0,
      status: order.status || "Pagado",
      paymentStatus: order.paymentStatus || "pending",
      clientEmail: order.emailCliente || "",
      estado: order.estado || "En proceso",
    });

    await adjustStockAfterOrder(order.items);

    res.status(200).json({ message: 'Order saved', id: docRef.id });
  } catch (error) {
    console.error('❌ Error saving order:', error);
    res.status(500).json({
      error: 'Failed to save order',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};