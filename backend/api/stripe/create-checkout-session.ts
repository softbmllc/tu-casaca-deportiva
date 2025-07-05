//backened/api/stripe/create-checkout-session.ts

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, shippingData, emailCliente } = req.body;

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100), // price in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        customer_name: shippingData.name,
        customer_email: emailCliente,
        customer_address1: shippingData.address1,
        customer_address2: shippingData.address2,
        customer_city: shippingData.city,
        customer_state: shippingData.state,
        customer_zip: shippingData.zip,
        customer_country: shippingData.country,
      },
    });

    res.status(200).json({ id: session.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
