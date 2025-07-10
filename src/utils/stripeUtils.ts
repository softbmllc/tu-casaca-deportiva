// src/utils/stripeUtils.ts

export async function createPaymentIntent(amount: number) {
  try {
    console.log("🧾 Datos que se mandan a create-payment-intent:", { amount });
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseURL}/api/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      throw new Error('Error al crear el PaymentIntent');
    }

    const data = await res.json();

    if (!data.clientSecret) {
      throw new Error('No se recibió clientSecret desde el backend');
    }

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error) {
    console.error('❌ Error en createPaymentIntent:', error);
    throw error;
  }
}
