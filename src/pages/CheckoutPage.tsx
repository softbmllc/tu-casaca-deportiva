// src/pages/CheckoutPage.tsx

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutNavbar from '../components/CheckoutNavbar';
import OrderSummary from "../components/checkout/OrderSummary";
import ShippingInfo from '../components/checkout/ShippingInfo';
import PaymentSection from '../components/checkout/PaymentSection';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/orderUtils';
import { saveCartToFirebase } from '../utils/cartUtils';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { cartItems, shippingInfo } = useCart();
  const { user } = useAuth();
  const email = user?.email || '';
  console.log("📦 Datos recibidos en CheckoutPage:", shippingInfo);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

  return (
    <>
      <CheckoutNavbar />
      <div className="w-full border-b border-gray-200 bg-white py-4 mt-24 z-10 relative">
        <div className="max-w-4xl mx-auto px-4 text-sm text-gray-500 flex justify-between items-center">
          <span className="font-semibold text-black">Carrito</span>
          <span>→</span>
          <span className="font-semibold text-black">Envío</span>
          <span>→</span>
          <span className="text-gray-400">Pago</span>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-8">

        {/* Resumen del Pedido */}
        <section className="mb-8">
          {/* Aquí se mostrará el listado de productos, cantidades y total */}
          <div className="bg-gray-100 p-4 rounded">
            <OrderSummary />
          </div>
        </section>

        {/* Datos de Envío */}
        <section className="mb-8">
          
          {/* Mostrar datos que el cliente ya completó en CartPage */}
          <div className="md:bg-white md:shadow-md md:rounded-md md:p-6 md:border md:border-gray-200 md:text-sm md:text-base md:space-y-1">
            <ShippingInfo />
          </div>
        </section>

        {/* Método de Pago */}
        <hr className="my-4 border-t border-gray-300" />
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Método de Pago</h2>
          {/* Aquí se integrará Stripe Elements y un botón para PayPal */}
          <Elements stripe={stripePromise}>
            <PaymentSection />
          </Elements>
        </section>

        {/* Botón Finalizar */}
        <div className="text-right">
          <button
            className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded shadow-md font-semibold text-sm hover:bg-gray-900 transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            onClick={async () => {
              const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);
              if (!stripe) {
                console.error("Stripe no se pudo inicializar");
                return;
              }

              if (!email || cartItems.length === 0) {
                console.error("❌ Email o carrito vacío al intentar guardar en Firebase.");
                return;
              }

              try {
                await saveCartToFirebase(email, cartItems);
                console.log("✅ Carrito guardado en Firebase antes del checkout.");
              } catch (error) {
                console.error("❌ Error al guardar carrito en Firebase:", error);
                return;
              }

              const items = cartItems.map((item) => ({
                name: item.title || "Producto",
                quantity: item.quantity || 1,
                price: typeof item.price === 'string' ? parseFloat(item.price) : item.price || 0
              }));

              try {
                const response = await fetch('/api/create-payment-intent', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ items }),
                });

                const data = await response.json();

                if (!data.url) {
                  throw new Error("No se recibió la URL de redirección desde Stripe");
                }

                // Redirigir al checkout de Stripe
                window.location.href = data.url;

              } catch (error) {
                console.error("❌ Error al iniciar Stripe Checkout:", error);
              }
            }}
          >
            Finalizar Compra
          </button>
        </div>
      </main>
    </>
  );
}