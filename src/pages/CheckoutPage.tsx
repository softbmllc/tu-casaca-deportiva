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
      <main className="w-full px-4 pt-32 pb-16">
        <div className="grid grid-cols-1 gap-8 items-start max-w-3xl mx-auto">
          {/* Columna izquierda: Resumen del Pedido */}
          <div className="bg-white shadow-md p-6 rounded-md border border-gray-200">
            <OrderSummary />
          </div>

          {/* Columna derecha: Datos de Envío + Pago */}
          <div className="space-y-8">
            <div className="bg-white shadow-md p-6 rounded-md border border-gray-200">
              <ShippingInfo />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Método de Pago</h2>
              <Elements stripe={stripePromise}>
                <PaymentSection />
              </Elements>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}