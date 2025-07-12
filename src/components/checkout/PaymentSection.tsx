// src/components/checkout/PaymentSection.tsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const PaymentSection: React.FC = () => {
  const { t } = useTranslation();
  const { total, cartItems } = useCart();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");

  return (
    <div className="mt-6 bg-white shadow-lg rounded-lg border border-gray-200 px-8 py-6 w-full mx-auto transition-all duration-300">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">
        {t("checkout.method", "Método de pago")}
      </h2>
      <p className="text-gray-600">La integración con Mercado Pago estará disponible próximamente.</p>
    </div>
  );
};

export default PaymentSection;