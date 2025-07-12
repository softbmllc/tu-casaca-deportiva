// src/utils/mercadoPagoUtils.ts

/**
 * Stub para crear una preferencia de pago en Mercado Pago.
 * Este helper será reemplazado por lógica real cuando se reciban las credenciales.
 */

export async function createPreference(cartItems: any[], customerData: any) {
  // TODO: reemplazar esta URL por el endpoint real de tu backend o de Mercado Pago si usás redirección directa
  const response = await fetch('/api/mercado-pago-stub', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Agregar aquí el Access Token real de Mercado Pago cuando esté disponible
    },
    body: JSON.stringify({
      items: cartItems,
      customer: customerData,
    }),
  });

  if (!response.ok) {
    throw new Error('Error al crear la preferencia de pago');
  }

  const data = await response.json();
  return data;
}