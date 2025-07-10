// src/components/checkout/ShippingInfo.tsx

import React from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ShippingInfo: React.FC = () => {
  const { shippingData } = useCart();

  const {
    name,
    address,
    address2,
    city,
    state,
    postalCode,
    phone,
    email,
    country,
  } = shippingData;

  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">
        {t("checkout.shippingInfoTitle", "Datos de Envío")}
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6 text-sm text-gray-800 divide-y divide-gray-200 transition-all duration-300">

        {/* Dirección */}
        <div className="group">
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
            {t("checkout.address", "Dirección")}
          </div>
          <p className="text-gray-900">
            {name || "No especificado"}<br />
            {address || "No especificado"}
            {address2 && `, ${address2}`}<br />
            {city || "No especificado"}, {state || "No especificado"} {postalCode || ""}<br />
            {(country?.trim() && country !== "No especificado") ? country : "Estados Unidos"}
          </p>
        </div>

        {/* Contacto */}
        <div className="group">
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
            {t("checkout.contact", "Contacto")}
          </div>
          <p className="text-gray-900">
            {phone || "No especificado"}<br />
            {email || "No especificado"}
          </p>
        </div>

        {/* Botón Editar */}
        <div className="text-right pt-2">
          <button
            onClick={() => navigate("/carrito")}
            className="border border-gray-300 text-sm font-medium text-gray-700 px-5 py-2 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {t("checkout.edit", "Editar")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;