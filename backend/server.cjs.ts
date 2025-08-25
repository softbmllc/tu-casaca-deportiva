// backend/server.cjs.ts

import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });


import express from "express";
import getImagekitAuth from "./api/getImagekitAuth-express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// 🟢 Mercado Pago TEST credentials
const client = new MercadoPagoConfig({
  accessToken: "TEST-658775613438800-041721-4b4c92acf172d6c53c4c453f41945943-34063410",
});

// 🎯 Crear preferencia de pago
app.post("/api/create_preference", async (req, res) => {
  const { items, payer } = req.body;

  try {
    const preference = await new Preference(client).create({
      body: {
        items,
        payer,
        back_urls: {
          success: "https://tucasacadeportiva.com/success",
          failure: "https://tucasacadeportiva.com/failure",
          pending: "https://tucasacadeportiva.com/pending",
        },
        auto_return: "approved",
        notification_url: "https://tucasacadeportiva.com/api/webhook"
      },
    });

    return res.json({ init_point: preference.init_point });
  } catch (error) {
    console.error("❌ Error al crear la preferencia:", error);
    return res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

// 🧲 Webhook para recibir notificaciones de pago
app.post("/webhook", (req, res) => {
  console.log("📬 Webhook recibido:");
  console.log(JSON.stringify(req.body, null, 2));

  // Acá podrías guardar en DB, enviar mail, etc.
  res.sendStatus(200);
});


app.get("/api/imagekit-signature", getImagekitAuth);

app.listen(port, () => {
  console.log(`🟢 Servidor backend corriendo en http://localhost:${port}`);
});