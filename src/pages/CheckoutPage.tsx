// src/pages/CheckoutPage.tsx

import CheckoutNavbar from '../components/CheckoutNavbar';
import OrderSummary from "../components/checkout/OrderSummary";
import ShippingInfo from '../components/checkout/ShippingInfo';
import PaymentSection from '../components/checkout/PaymentSection';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/orderUtils';
import { saveCartToFirebase } from '../utils/cartUtils';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

export default function CheckoutPage() {
  const { cartItems, shippingInfo } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const email = user?.email || '';
  console.log("📦 Datos recibidos en CheckoutPage:", shippingInfo);

  return (
    <>
      <CheckoutNavbar />
      <div className="w-full border-b border-gray-200 bg-white py-6 mt-24 z-10 relative">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-semibold">1</span>
          <span className="text-blue-600 font-semibold">{t('checkoutNavbar.cart')}</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-semibold">2</span>
          <span className="text-blue-600 font-semibold">{t('checkoutNavbar.shipping')}</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-2">
          <span className="text-gray-400">3</span>
          <span className="text-gray-400">{t('checkoutNavbar.payment')}</span>
          </div>
        </div>
      </div>
      <main className="w-full px-4 pt-32 pb-16">
        <div className="grid grid-cols-1 gap-8 items-start max-w-4xl mx-auto">
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
              <p className="text-sm uppercase text-gray-500 mb-1">{t('checkout.method')}</p>
              <PaymentSection />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}