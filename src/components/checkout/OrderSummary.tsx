//src/components/checkout/OrderSummary.tsx
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getProductById } from "@/utils/productUtils"; // Esta función la vas a crear en el próximo paso
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  priceUSD: number;
  quantity: number;
  size: string;
  customName?: string;
  customNumber?: string;
  options?: string;
  variantId?: string;
};

const fetchProductName = async (productId: string, lang: string) => {
  const docRef = doc(db, "products", productId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const name = data?.name;
    return typeof name === "object" ? name[lang] : name;
  }
  return "";
};

export default function OrderSummary() {
  const { cartItems } = useCart() as { cartItems: CartItem[] };
  const { t, i18n } = useTranslation();
  const [productLabels, setProductLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchVariantLabels = async () => {
      const labels: Record<string, string> = {};

      for (const item of cartItems) {
        const product = await getProductById(item.id);
        const variant = product?.variants?.find((v: any) => v.size === item.size);
        if (variant) {
          labels[`${item.id}-${item.size}`] = i18n.language === "es" ? variant.label?.es : variant.label?.en;
        }
      }

      setProductLabels(labels);
    };

    if (cartItems.length > 0) {
      fetchVariantLabels();

      const fetchFallbackNames = async () => {
        const fallbackNames: Record<string, string> = {};

        for (const item of cartItems) {
          if (!item.name || (typeof item.name === "object" && !item.name[i18n.language])) {
            const name = await fetchProductName(item.id, i18n.language);
            fallbackNames[`name-${item.id}`] = name;
          }
        }

        setProductLabels((prev) => ({ ...prev, ...fallbackNames }));
      };
      fetchFallbackNames();
    }
  }, [cartItems, i18n.language]);

  const total = cartItems.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-white shadow-sm">
        <p className="text-center text-gray-500">{t("cart.emptyMessage", "Tu carrito está vacío")}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{t("checkout.orderSummary", "Resumen del Pedido")}</h2>
      <ul className="space-y-4">
        {cartItems.map((item) => {
          const key = `${item.id}-${item.size}`;
          return (
            <li key={key} className="flex items-start gap-4 border-b pb-4">
              {item.image && (
                <img src={item.image} alt={typeof item.name === "object" ? item.name[i18n.language] : item.name} className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {typeof item.name === "object"
                    ? item.name[i18n.language]
                    : item.name || productLabels[`name-${item.id}`]}
                </p>
                <p className="text-sm text-gray-600">
                  {productLabels[key] || item.size} – {t("checkout.quantity", "Cantidad")}: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">US${item.priceUSD.toFixed(2)}</p>
                <p className="font-medium">US${(item.priceUSD * item.quantity).toFixed(2)}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="text-right mt-4 border-t pt-4">
        <p className="text-lg font-semibold">
          {t("checkout.total", "Total")}: US${total.toFixed(2)}
        </p>
      </div>
    </div>
  );
}