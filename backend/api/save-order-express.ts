// backened/api/save-order-express.ts

import { Request, Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";

const serviceAccount = require("../../secrets/firebase-admin.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const saveOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;

    if (!orderData || !orderData.clientEmail) {
      return res.status(400).json({ error: "Missing order data or client email" });
    }

    const orderRef = db.collection("orders").doc();
    await orderRef.set(orderData);

    res.status(200).json({ message: "Order saved", orderId: orderRef.id });
  } catch (error: any) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: error.message });
  }
};

export default saveOrder;
