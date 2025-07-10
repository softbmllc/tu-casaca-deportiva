// src/pages/SuccessPage.tsx

import SuccessNavbar from "../components/SuccessNavbar";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { saveOrderToFirebase } from "../firebaseUtils";
import { getCartFromFirebase } from "../firebaseUtils";
import { registerClient } from "../firebaseUtils";
import { fetchClientsFromFirebase } from "../firebaseUtils";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";

export default function SuccessPage() {
  const location = useLocation();
  const { clearCart } = useCart();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [cartData, setCartData] = useState<any[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const ejecutarPostPago = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentId = urlParams.get("payment_intent");
      const paymentIntentStatus = urlParams.get("redirect_status");

      const clientDataJSON = localStorage.getItem("clientData");
      console.log("💾 clientDataJSON crudo desde localStorage:", clientDataJSON);
      let clientDataParsed = null;
      let clientEmail = "";

      try {
        clientDataParsed = clientDataJSON ? JSON.parse(clientDataJSON) : null;
        console.log("🧠 clientDataParsed:", clientDataParsed);
        clientEmail = clientDataParsed?.email || "";
        console.log("📧 Email del cliente obtenido:", clientEmail);
      } catch (error) {
        console.error("❌ Error al parsear clientData:", error);
        return;
      }

      if (!clientEmail || typeof clientEmail !== "string") {
        console.warn("❌ Email del cliente no disponible o inválido.");
        return;
      }

      let cartItems: any[] = [];
      const MAX_RETRIES = 5;

      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          cartItems = await getCartFromFirebase(clientEmail);
          console.log(`🛒 Intento ${i + 1}: Carrito desde Firebase:`, cartItems);

          if (Array.isArray(cartItems) && cartItems.length > 0 && typeof cartItems[0] === "object") {
            break;
          }

          await new Promise(res => setTimeout(res, 500)); // espera 500ms antes de reintentar
        } catch (error) {
          console.warn("❌ Error al cargar el carrito desde Firebase:", error);
          return;
        }
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0 || typeof cartItems[0] !== "object") {
        console.warn("❌ Carrito no válido tras múltiples intentos:", cartItems);
        return;
      }

      console.log("📋 Campos requeridos antes del chequeo:", {
        name: clientDataParsed?.name,
        phone: clientDataParsed?.phone,
        address: clientDataParsed?.address,
        city: clientDataParsed?.city,
        state: clientDataParsed?.state,
        email: clientEmail,
      });
      console.log("🔍 Campos requeridos del cliente:", {
        name: clientDataParsed?.name,
        phone: clientDataParsed?.phone,
        address: clientDataParsed?.address,
        city: clientDataParsed?.city,
        state: clientDataParsed?.state,
        email: clientEmail,
      });
      const requiredFields = [
        clientDataParsed?.nombre || clientDataParsed?.name,
        clientDataParsed?.telefono || clientDataParsed?.phone,
        clientDataParsed?.direccion || clientDataParsed?.address,
        clientDataParsed?.ciudad || clientDataParsed?.city,
        clientDataParsed?.estado || clientDataParsed?.state,
        clientEmail,
      ];
      if (requiredFields.some(field => !field)) {
        console.warn("❌ Faltan campos obligatorios del cliente. Intentando obtenerlos desde Firebase...");

        try {
          const allClients = await fetchClientsFromFirebase();
          const clientMatch = allClients.find(client => client.email === clientEmail);
          if (clientMatch && typeof clientMatch === "object") {
            clientDataParsed = clientMatch;
            console.log("📦 Datos del cliente recuperados desde Firebase:", clientDataParsed);
          } else {
            console.warn("❌ No se pudieron obtener los datos completos del cliente desde Firebase.");
            return;
          }
        } catch (error) {
          console.error("❌ Error al recuperar datos del cliente desde Firebase:", error);
          return;
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientEmail)) {
        console.warn("❌ Email inválido.");
        return;
      }

      setPaymentId(paymentIntentId);
      setStatus(paymentIntentStatus);
      setClientData(clientDataParsed);
      setCartData(cartItems);

      console.log("📦 Intentando guardar orden...");
      console.log("🧾 cartItems:", cartItems);
      console.log("📮 shippingData:", clientDataParsed);
      console.log("📧 email:", clientEmail);

      if (!clientEmail || !clientDataParsed || cartItems.length === 0) {
        console.error("❌ Datos faltantes. No se puede guardar la orden.");
        return;
      }

      const order = {
        cartItems: cartItems,
        items: cartItems.map(item => ({
          id: item.id || item.slug || "",
          title: item.title || item.name || "",
          price: item.price || 0,
          quantity: item.quantity || 1,
          size: item.size || "",
          variantLabel: item.variantLabel || "",
          slug: item.slug || "",
          image: item.image || item.images?.[0] || "",
        })),
        client: {
          name: clientDataParsed.nombre || clientDataParsed.name || "",
          email: clientDataParsed.email || "",
          phone: clientDataParsed.telefono || clientDataParsed.phone || "",
          address: clientDataParsed.direccion || clientDataParsed.address || "",
          city: clientDataParsed.ciudad || clientDataParsed.city || "",
          state: clientDataParsed.estado || clientDataParsed.state || "",
          zip: clientDataParsed.zip || clientDataParsed.postalCode || "",
          address2: clientDataParsed.address2 || clientDataParsed.direccion2 || "",
          country: clientDataParsed.pais || clientDataParsed.country || "Estados Unidos",
        },
        clientEmail: clientDataParsed.email,
        clientInfo: {
          name: clientDataParsed.nombre || clientDataParsed.name || "",
          email: clientDataParsed.email || "",
          phone: clientDataParsed.telefono || clientDataParsed.phone || "",
          address: clientDataParsed.direccion || clientDataParsed.address || "",
          city: clientDataParsed.ciudad || clientDataParsed.city || "",
          state: clientDataParsed.estado || clientDataParsed.state || "",
          zip: clientDataParsed.zip || clientDataParsed.postalCode || "",
          address2: clientDataParsed.address2 || clientDataParsed.direccion2 || "",
          country: clientDataParsed.pais || clientDataParsed.country || "Estados Unidos",
        },
        shippingInfo: {
          name: clientDataParsed.nombre || clientDataParsed.name || "",
          email: clientDataParsed.email || "",
          phone: clientDataParsed.telefono || clientDataParsed.phone || "",
          address: clientDataParsed.direccion || clientDataParsed.address || "",
          city: clientDataParsed.ciudad || clientDataParsed.city || "",
          state: clientDataParsed.estado || clientDataParsed.state || "",
          zip: clientDataParsed.zip || clientDataParsed.postalCode || "",
          address2: clientDataParsed.address2 || clientDataParsed.direccion2 || "",
          country: clientDataParsed.pais || clientDataParsed.country || "Estados Unidos",
        },
        totalAmount: parseFloat(
          cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0).toFixed(2)
        ),
        paymentIntentId: paymentIntentId || "",
        paymentStatus: paymentIntentStatus || "unknown",
        paymentMethod: "Stripe",
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        estado:
          paymentIntentStatus === "succeeded"
            ? "Confirmado"
            : ("En proceso" as "En proceso" | "Confirmado" | "Cancelado" | "Entregado"),
      };

      if (paymentIntentStatus === "succeeded" && cartItems.length > 0) {
        try {
          try {
            await registerClient({
              client: {
                name: clientDataParsed.name,
                email: clientDataParsed.email,
                phone: clientDataParsed.phone || "",
                address: clientDataParsed.address || "",
                city: clientDataParsed.city || "",
                state: clientDataParsed.state || "",
                zip: clientDataParsed.zip || "",
                country: clientDataParsed.country || "Estados Unidos",
              },
              shouldRegister: false,
            });
            console.log("✅ Cliente registrado en Firestore.");
          } catch (error) {
            console.warn("ℹ️ Cliente ya registrado o error al guardar. Se continúa sin sobrescribir.");
          }

          console.log("🧾 Orden lista para guardar:", order);
          await saveOrderToFirebase(order);
          console.log("✅ Pedido guardado en Firebase:", order);

          localStorage.removeItem("cart");
          localStorage.removeItem("clientEmail");
          localStorage.removeItem("clientData");
          clearCart();
        } catch (error) {
          console.error("❌ Error al guardar el pedido:", error);
        }
      }
    };

    ejecutarPostPago();
  }, []);

  const subtotal = cartData.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const taxes = parseFloat((subtotal * 0.075).toFixed(2));
  const shipping = 0;
  const total = parseFloat((subtotal + taxes + shipping).toFixed(2));

  return (
    <>
      <SuccessNavbar />
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-green-600">{t("success.title")}</h1>
        <p className="text-lg text-gray-700 mb-6">
          {t("success.subtitle")}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {t("success.tagline")}
        </p>

        {cartData.length > 0 && (
          <div className="mt-6 text-left max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">{t("success.orderSummary")}</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              {cartData.map((item, index) => {
                const name = typeof item.name === 'object' ? item.name.es : item.name;
                const title = typeof item.title === 'object' ? item.title.es : item.title;
                return (
                  <li key={index} className="flex justify-between border-b py-1">
                    <span>{title || name} x{item.quantity || 1}</span>
                    <span>${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="border-t pt-2 mt-2 space-y-1 text-sm text-gray-900">
              <div className="flex justify-between">
                <span>{t("success.subtotal")}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("success.taxes")}</span>
                <span>${taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("success.shipping")}</span>
                <span>{t("success.shippingFree")}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>{t("success.total")}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {paymentId && (
          <>
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg mt-4 text-sm">
              <p><strong>{t("success.paymentId")}</strong> {paymentId}</p>
              <p><strong>{t("success.status")}</strong> {status}</p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-full transition text-sm">
                {t("success.backToStore")}
              </a>
              <a
                href="https://wa.me/1XXXXXXXXXX?text=Hola!%20Acabo%20de%20realizar%20una%20compra%20en%20Bionova"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full transition text-sm"
              >
                {t("success.whatsappHelp")}
              </a>
            </div>
          </>
        )}
      </section>
      <Footer />
    </>
  );
}