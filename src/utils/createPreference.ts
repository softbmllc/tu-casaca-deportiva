// src/utils/createPreference.ts

import { CartItem, ShippingInfo } from "@/data/types";

export const createPreference = async (
  cartItems: CartItem[],
  shippingData: ShippingInfo
): Promise<string | null> => {
    try {
      const items = cartItems.map((item: CartItem) => ({
        title: item.name || item.title || "Producto",
        quantity: item.quantity,
        unit_price: Number(item.price) || 0,
        currency_id: "UYU",
      }));

      if (shippingData?.shippingCost && shippingData.shippingCost > 0) {
        items.push({
          title: "Costo de envío",
          quantity: 1,
          unit_price: shippingData.shippingCost,
          currency_id: "UYU",
        });
      }

      const payload = {
        items,
        payer: {
          name: shippingData?.name || "No especificado",
          email: shippingData?.email || "noemail@muttergames.com",
        },
        back_urls: {
          success: "https://mutter-games.vercel.app/success",
          failure: "https://mutter-games.vercel.app/failure",
          pending: "https://mutter-games.vercel.app/pending",
        },
        auto_return: "approved",
      };

      console.log("🔥 Payload enviado a Mercado Pago:", payload);

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log("📥 Status de respuesta:", response.status);
      console.log("📥 Respuesta completa:", data);
      return data.init_point;
    } catch (error) {
      console.error("Error al crear preferencia:", error);
      return null;
    }
  };