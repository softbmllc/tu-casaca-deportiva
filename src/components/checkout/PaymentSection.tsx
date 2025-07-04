// src/components/checkout/PaymentSection.tsx

import React, { useEffect, useState } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { prepareInitialOrderData } from "../../utils/orderUtils";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error("❌ ERROR: No se encontró VITE_STRIPE_PUBLIC_KEY. Verifica tu archivo .env y reiniciá con 'npm run dev'.");
  alert("Error crítico: falta la clave pública de Stripe. Contactá soporte.");
}

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { total, cartItems } = useCart();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (total <= 0) return; // ⛔️ Evita ejecutar si total aún no está listo

    console.log("🧪 Total enviado al backend:", total);

    fetch("http://localhost:4000/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(total * 100) }) // total en centavos
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error("Error al crear el pago");
        }
        return res.json();
      })
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error("No se recibió clientSecret:", data);
        }
      })
      .catch(err => {
        console.error("❌ Error creando el intent:", err.message);
      });
  }, [total]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const shippingData = JSON.parse(localStorage.getItem("shippingData") || "{}");
    const email = user?.email || localStorage.getItem("email") || shippingData?.email || "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Por favor, ingresa un correo electrónico válido para poder enviarte la confirmación del pedido.");
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!
      }
    });

    if (result.error) {
      alert(result.error.message);
    } else {
      if (result.paymentIntent?.status === "succeeded") {
        const shippingData = JSON.parse(localStorage.getItem("shippingData") || "{}");
        // Nueva versión mejorada de orderData
        const orderData = {
          ...prepareInitialOrderData(cartItems, shippingData),
          clientEmail: user?.email || localStorage.getItem("email") || shippingData?.email || "",
          createdAt: new Date().toISOString(),
          paymentIntentId: result.paymentIntent?.id,
          paymentIntentStatus: result.paymentIntent?.status,
          paymentMethod: "Stripe",
          status: "Pagado",
          clientInfo: {
            fullName: shippingData.fullName || "",
            phone: shippingData.phone || "",
            address: shippingData.address || "",
            address2: shippingData.address2 || "",
            city: shippingData.city || "",
            state: shippingData.state || "",
            zip: shippingData.zip || "",
            country: shippingData.country || "Estados Unidos"
          }
        };

        console.log("🛒 cartItems:", cartItems);
        console.log("📦 shippingData:", shippingData);
        console.log("💵 total:", total);

        // Debug: inspeccionar datos antes de enviar
        console.log("🧾 Order que se enviará al backend:", orderData);
        if (!orderData.clientEmail) {
          alert("❌ No se encontró el email del cliente. No se puede guardar la orden.");
          return;
        }

        try {
          const response = await fetch("http://localhost:4000/api/save-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...orderData,
              totalAmount: total,
              items: cartItems,
              shippingInfo: shippingData
            })
          });

          if (!response.ok) {
            throw new Error("Error al guardar el pedido");
          }

          const text = await response.text();
          try {
            const data = JSON.parse(text);
          } catch (e) {
            console.warn("Respuesta vacía o no JSON. Redirigiendo igual.");
          }

          localStorage.removeItem("cart");
          window.location.href = "/success";
        } catch (err) {
          console.error("Error al guardar el pedido:", err);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-4 border rounded" />
      <button
        type="submit"
        disabled={!stripe}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-900"
      >
        Pagar
      </button>
    </form>
  );
};

const PaymentSection: React.FC = () => {
  return (
    <div className="mt-6 bg-white shadow-md rounded p-4 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Pago Seguro</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default PaymentSection;