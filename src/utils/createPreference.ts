// src/utils/createPreference.ts

import { CartItem, ShippingInfo } from "@/data/types";

export const createPreference = async (
  cartItems: CartItem[],
  shippingData: ShippingInfo
): Promise<string | null> => {
    try {
      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map((item: CartItem) => ({
            title: item.name || item.title || "Producto",
            quantity: item.quantity,
            unit_price: Number(item.price),
            currency_id: "UYU",
          })),
          payer: {
            name: shippingData?.name,
            email: shippingData?.email,
          },
          back_urls: {
            success: "https://mutter-games.vercel.app/success",
            failure: "https://mutter-games.vercel.app/failure",
            pending: "https://mutter-games.vercel.app/pending",
          },
          auto_return: "approved",
        }),
      });
  
      const data = await response.json();
      return data.init_point;
    } catch (error) {
      console.error("Error al crear preferencia:", error);
      return null;
    }
  };