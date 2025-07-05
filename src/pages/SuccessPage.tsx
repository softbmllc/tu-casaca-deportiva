// src/pages/SuccessPage.tsx

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { saveOrderToFirebase } from "../firebaseUtils";
import { useCart } from "../context/CartContext";

export default function SuccessPage() {
  const location = useLocation();
  const { clearCart } = useCart();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [cartData, setCartData] = useState<any[]>([]);
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    const ejecutarPostPago = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentId = urlParams.get("payment_intent");
      const paymentIntentStatus = urlParams.get("redirect_status");

      const cartItemsJSON = localStorage.getItem("cart");
      const clientEmail = localStorage.getItem("clientEmail");
      const clientDataJSON = localStorage.getItem("clientData");

      const cartItems = cartItemsJSON ? JSON.parse(cartItemsJSON) : [];
      const clientData = clientDataJSON ? JSON.parse(clientDataJSON) : null;

      if (
        !clientData ||
        !clientEmail ||
        !Array.isArray(cartItems) ||
        cartItems.length === 0 ||
        !clientData.name ||
        !clientData.phone ||
        !clientData.address ||
        !clientData.city ||
        !clientData.state ||
        !clientData.zip
      ) {
        console.warn("❌ Faltan datos del cliente o del carrito.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const zipRegex = /^\d{5}$/;

      if (!emailRegex.test(clientEmail) || !zipRegex.test(clientData.zip)) {
        console.warn("❌ Email o ZIP inválidos.");
        return;
      }

      const total = cartItems.reduce((acc, item) => {
        return acc + (item.price || 0) * (item.quantity || 1);
      }, 0);

      const order = {
        cartItems,
        client: {
          name: clientData.name,
          email: clientEmail,
          phone: clientData.phone,
          address: `${clientData.address}, ${clientData.city}, ${clientData.state}, ${clientData.zip}`,
          country: clientData.country || "Estados Unidos",
        },
        totalAmount: parseFloat(total.toFixed(2)),
        paymentIntentId: paymentIntentId || "",
        paymentStatus: paymentIntentStatus || "unknown",
        paymentMethod: "Stripe",
        date: new Date().toISOString(),
        estado:
          paymentIntentStatus === "succeeded"
            ? "Confirmado"
            : ("En proceso" as "En proceso" | "Confirmado" | "Cancelado" | "Entregado"),
      };

      if (paymentIntentStatus === "succeeded") {
        try {
          await saveOrderToFirebase(order);
          localStorage.removeItem("cart");
          localStorage.removeItem("clientEmail");
          localStorage.removeItem("clientData");

          // Opcional: limpiar carrito global si está disponible
          clearCart();

          console.log("✅ Pedido guardado y carrito limpiado.");
        } catch (error) {
          console.error("❌ Error al guardar el pedido:", error);
        }
      }
    };

    ejecutarPostPago();
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">¡Pago exitoso!</h1>
      <p className="text-gray-700 mb-2">
        Gracias por tu compra. Te enviaremos un WhatsApp para coordinar el envío.
      </p>

      {cartData.length > 0 && (
        <div className="mt-6 text-left max-w-md w-full bg-white border rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen del pedido</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {cartData.map((item, index) => (
              <li key={index} className="flex justify-between border-b py-1">
                <span>{item.title || item.name} x{item.quantity || 1}</span>
                <span>${(item.price * (item.quantity || 1)).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {clientData && (
        <div className="mt-6 text-left max-w-md w-full bg-white border rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Datos del cliente</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><strong>Nombre:</strong> {clientData.name}</li>
            <li><strong>Email:</strong> {clientData.email}</li>
            <li><strong>Teléfono:</strong> {clientData.phone}</li>
            <li><strong>Dirección:</strong> {clientData.address}</li>
            <li><strong>Ciudad:</strong> {clientData.city}</li>
            <li><strong>Estado:</strong> {clientData.state}</li>
            <li><strong>ZIP:</strong> {clientData.zip}</li>
          </ul>
        </div>
      )}

      {paymentId && (
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg mt-4 text-sm">
          <p><strong>ID de pago:</strong> {paymentId}</p>
          <p><strong>Estado:</strong> {status}</p>
        </div>
      )}

      <button
        onClick={() => {
          clearCart();
          window.location.href = "/";
        }}
        className="mt-6 bg-black text-white px-6 py-3 rounded-full hover:bg-black/90 transition"
      >
        Volver al inicio
      </button>
    </section>
  );
}