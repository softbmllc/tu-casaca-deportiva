// backened/api/create-payment-intent-express.ts

import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-06-30.basil',
});

const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, currency = "usd" } = req.body;
    console.log("🧾 Monto recibido en backend:", amount, "Tipo:", typeof amount);

    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a valid number greater than 0" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default createPaymentIntent;
