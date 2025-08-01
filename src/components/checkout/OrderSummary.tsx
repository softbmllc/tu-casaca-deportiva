// src/components/checkout/OrderSummary.tsx
import { useCart } from "@/context/CartContext";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getProductById } from "@/utils/productUtils";

type ExtendedCartItem = {
  id: string;
  name: string;
  image: string;
  priceUSD: number;
  quantity: number;
  size?: string;
  options?: string;
  variantId?: string;
  variantLabel?: string;
  selectedOption?: {
    value: string;
  };
  variant?: {
    label?: string;
  };
};

export default function OrderSummary() {
  const { cartItems: rawCartItems } = useCart();
  const cartItems = rawCartItems as ExtendedCartItem[];
  const { t, i18n } = useTranslation();
  const [variantLabels, setVariantLabels] = useState<Record<string, { label: string; value: string }>>({});

  useEffect(() => {
    const labels: Record<string, { label: string; value: string }> = {};
    const lang = i18n.language;

    for (const item of cartItems) {
      const key = `${item.id}-${item.variantId || item.size}`;
      const label = item.variant?.label || item.variantLabel || item.options || item.size || "-";
      const value = item.selectedOption?.value || "-";
      labels[key] = { label, value };
    }

    setVariantLabels(labels);
  }, [cartItems, i18n.language]);

  const total = cartItems.reduce((acc, item) => acc + item.priceUSD * item.quantity, 0);
  const shipping = 0;
  const taxRate = 0.07;
  const taxes = total * taxRate;
  const grandTotal = total + shipping + taxes;

  if (cartItems.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-white shadow-sm w-full mx-auto
        max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <p className="text-center text-gray-500">
          {t("cart.emptyMessage", "Tu carrito está vacío")}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 bg-white shadow-sm w-full mx-auto
      max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">
        {t("checkout.orderSummary", "Resumen del Pedido")}
      </h2>
      <ul className="space-y-4">
        {cartItems.map((item) => {
          const key = `${item.id}-${item.variantId || item.size}`;
          const translatedName = item.name;

          return (
            <li key={key} className="flex items-start gap-4 border-b pb-4">
              <img
                src={item.image}
                alt={translatedName}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900">{translatedName}</p>
                <p className="text-sm text-gray-500">
                  {variantLabels[key]
                    ? `${variantLabels[key].label}: ${variantLabels[key].value}`
                    : "-"}
                  {" "}
                  – {t("checkout.quantity", "Cantidad")}: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">US${item.priceUSD.toFixed(2)}</p>
                <p className="font-medium">
                  US${(item.priceUSD * item.quantity).toFixed(2)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="text-right mt-6 border-t border-gray-200 pt-6 space-y-1">
        <p className="text-sm text-gray-700">
          {t("checkout.subtotal", "Subtotal")}: US${total.toFixed(2)}
        </p>
        <p className="text-sm text-gray-700">
          {t("checkout.shipping", "Envío")}: {t("checkout.freeShipping", "Gratis")}
        </p>
        <p className="text-sm text-gray-700">
          {t("checkout.taxes", "Impuestos")}: US${taxes.toFixed(2)}
        </p>
        <p className="text-lg font-semibold mt-2">
          {t("checkout.total", "Total")}: US${grandTotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}