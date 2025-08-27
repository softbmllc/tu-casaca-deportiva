// src/utils/createPreference.ts
import { CartItem, ShippingInfo } from "@/data/types";

/**
 * Crea una preferencia de Mercado Pago.
 * Devuelve la URL (init_point) o null si no pudo crearla.
 * Motivos comunes de 400:
 *  - items vacío o con precios no válidos
 *  - access token ausente o incorrecto
 */
export const createPreference = async (
  cartItems: CartItem[],
  shippingData: ShippingInfo & { shippingCost?: number }
): Promise<string | null> => {
  try {
    // 1) Validar token
    const isLocalhost =
      typeof window !== "undefined" && /^(localhost|127\.?0\.?0\.?1)/.test(window.location.hostname);
    const accessToken =
      (isLocalhost ? import.meta.env.VITE_MP_ACCESS_TOKEN_DEV : import.meta.env.VITE_MP_ACCESS_TOKEN) ||
      import.meta.env.VITE_MP_ACCESS_TOKEN;
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
      console.error("❌ Falta VITE_MP_ACCESS_TOKEN en las variables de entorno.");
      return null;
    }

    // 2) Normalizar items (filtrar inválidos)
    const normalizedItems = (cartItems || [])
      .map((item) => {
        const quantity = Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0 ? Math.floor(Number(item.quantity)) : 1;
        const unit_price = Number(item.price);
        return {
          title: (item as any).name || (item as any).title || "Producto",
          quantity,
          unit_price,
          currency_id: "UYU" as const,
        };
      })
      .filter((it) => Number.isFinite(it.unit_price) && it.unit_price > 0 && it.quantity > 0);

    // 3) Agregar envío si corresponde
    const shippingCost = Number((shippingData as any)?.shippingCost);
    if (Number.isFinite(shippingCost) && shippingCost > 0) {
      normalizedItems.push({
        title: "Costo de envío",
        quantity: 1,
        unit_price: shippingCost,
        currency_id: "UYU",
      });
    }

    // 4) Si no hay items válidos, no pegamos al endpoint
    if (!normalizedItems.length) {
      console.warn("⚠️ No hay items válidos para crear la preferencia (carrito vacío o precios inválidos).");
      return null;
    }

    // 5) Base URL (prod por defecto)
    const baseUrl =
      import.meta.env.VITE_PUBLIC_BASE_URL ??
      (typeof window !== "undefined" ? window.location.origin : "https://tucasacadeportiva.com");

    const payload = {
      items: normalizedItems,
      payer: {
        name: (shippingData as any)?.name || "No especificado",
        email: (shippingData as any)?.email || "noemail@tucasacadeportiva.com",
      },
      back_urls: {
        success: `${baseUrl}/success`,
        failure: `${baseUrl}/failure`,
        pending: `${baseUrl}/pending`,
      },
      auto_return: "approved",
    };

    console.log("🧾 MP payload:", payload);

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({} as any));
    // Extra debug para entender errores 400 en local
    if (!response.ok) {
      console.error("❌ MP error detallado:", {
        status: response.status,
        statusText: response.statusText,
        body: data,
      });
    }
    if (!response.ok) {
      console.error("❌ MP respondió error", { status: response.status, data });
      // 400 suele ser por items vacíos o token inválido.
      return null;
    }

    const initPoint: string | undefined = (data as any)?.init_point || (data as any)?.sandbox_init_point;
    if (!initPoint) {
      console.error("❌ No se recibió init_point en la respuesta de MP", data);
      return null;
    }

    return initPoint;
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return null;
  }
};