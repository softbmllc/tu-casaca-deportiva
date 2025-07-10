// src/components/checkout/PaymentSection.tsx

import React, { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const shippingData = JSON.parse(localStorage.getItem("shippingData") || "{}");
    const email = user?.email || localStorage.getItem("email") || shippingData?.email || "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Por favor, ingresa un correo electrónico válido para poder enviarte la confirmación del pedido.");
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success",
      },
    });

    if (result.error) {
      alert(result.error.message);
    } else {
      if (
        result &&
        typeof result === 'object' &&
        'paymentIntent' in result &&
        typeof (result as any).paymentIntent === 'object' &&
        (result as any).paymentIntent?.status === "succeeded"
      ) {
        const shippingData = JSON.parse(localStorage.getItem("shippingData") || "{}");
        // Nueva versión mejorada de orderData
        const orderData = {
          ...prepareInitialOrderData(cartItems, shippingData),
          clientEmail: user?.email || localStorage.getItem("email") || shippingData?.email || "",
          createdAt: new Date().toISOString(),
          paymentIntentId: (result as any).paymentIntent?.id,
          paymentIntentStatus: (result as any).paymentIntent?.status,
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
    <form onSubmit={handleSubmit} id="stripe-checkout-form" className="space-y-4">
      <PaymentElement className="p-4 border rounded" />
      <button
        type="submit"
        disabled={!stripe}
        className="w-full bg-[#3B82F6] text-white py-2 rounded-md hover:scale-105 hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-[#3B82F6] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Pagar
      </button>
    </form>
  );
};

const PaymentSection: React.FC = () => {
  const { total, cartItems } = useCart();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (total <= 0) return;

    const shippingData = JSON.parse(localStorage.getItem("shippingData") || "{}");
    const email = user?.email || localStorage.getItem("email") || shippingData?.email || "";

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems,
        clientEmail: email,
        shippingInfo: shippingData,
        amount: Math.round(parseFloat(localStorage.getItem("checkoutTotal") || "0") * 100)
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else console.error("No se recibió clientSecret:", data);
      })
      .catch(err => {
        console.error("❌ Error creando el intent:", err.message);
      });
  }, [total]);

  const options = {
    clientSecret,
  };

  if (!clientSecret) {
    return <p className="text-center py-10">Cargando formulario de pago...</p>;
  }

  return (
    <div className="mt-6 bg-white shadow-lg rounded-lg border border-gray-200 px-8 py-6 w-full max-w-3xl mx-auto transition-all duration-300">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
        Pago Seguro
      </h2>
      <p className="text-sm text-gray-500 mb-4">Usá tu tarjeta con seguridad</p>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default PaymentSection;