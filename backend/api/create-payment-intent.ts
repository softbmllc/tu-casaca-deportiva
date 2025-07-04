// backened/api/create-payment-intent.ts

import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("🚨 STRIPE_SECRET_KEY is not defined in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🛬 Request body:', req.body);

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    // Calcular el total del pedido en centavos
    const amount = items.reduce((total: number, item: any) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe espera centavos
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    console.log("✅ PaymentIntent created:", paymentIntent);

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('❌ Stripe Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
