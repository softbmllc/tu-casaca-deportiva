// src/components/checkout/ShippingInfo.tsx

import React from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Datos de Envío</h2>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6 text-sm text-gray-800">

        {/* Dirección */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dirección</div>
          <p className="text-gray-900">
            {name || "No especificado"}<br />
            {address || "No especificado"}
            {address2 && `, ${address2}`}<br />
            {city || "No especificado"}, {state || "No especificado"} {postalCode || ""}<br />
            {(country?.trim() && country !== "No especificado") ? country : "Estados Unidos"}
          </p>
        </div>

        {/* Contacto */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contacto</div>
          <p className="text-gray-900">
            {phone || "No especificado"}<br />
            {email || "No especificado"}
          </p>
        </div>

        {/* Botón Editar */}
        <div className="text-right pt-2">
          <button
            onClick={() => navigate("/carrito")}
            className="border border-gray-400 text-sm text-gray-700 px-4 py-1.5 rounded-full hover:border-black hover:text-black transition"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;