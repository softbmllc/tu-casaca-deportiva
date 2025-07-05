// src/components/ProductCard.tsx
import { Link } from "react-router-dom";
import { Product } from "../data/types";

type LocalizedTitle = {
  en: string;
  es: string;
};
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type ProductCardProps = {
  product: Product;
  className?: string;
  imgClassName?: string;
};

export default function ProductCard({ product, className, imgClassName }: ProductCardProps) {
  // Asegurarnos de que tenemos un slug limpio y válido
  const safeSlug = product.slug ? encodeURIComponent(product.slug) : `product-${product.id}`;

  // Construir la ruta al detalle del producto con el ID para evitar problemas de coincidencia de slug
  const productDetailUrl = `/producto/${safeSlug}`;

  // Obtener la imagen principal, asegurando que existe
  const productImage = (product.images && product.images.length > 0 ? product.images[0] : "");

  const { i18n } = useTranslation();
  const language = i18n.language as "en" | "es";

  const productName = product.title?.[language] || "Sin título";

  const productSubtitle = (typeof product.subtitle === "string")
    ? product.subtitle
    : (typeof product.subtitle === "object" && product.subtitle !== null)
      ? product.subtitle[language] || ""
      : "";

  // Asegurar que tenemos precios
  const productPriceUSD = product.priceUSD || 0;

  console.log("🧩 DEBUG CARD —", product.slug, product.title);

  const categoryBorderColors: { [key: string]: string } = {
    PURE: "ring-[#1D4ED8]",          // azul
    FUXION: "ring-[#0ea5e9]",        // celeste
    "DOUBLE WOODS": "ring-[#15803d]" // verde
  };
  const borderColor = categoryBorderColors[product.category?.name?.toUpperCase() || ""] || "ring-transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={`product-card-${product.id}-${safeSlug}`} // Key único para evitar problemas de renderizado
      className={`h-[320px] relative ring-2 ring-offset-2 ${borderColor} rounded-2xl shadow-sm transition-transform duration-300 hover:scale-[1.015] ${className || ""}`}
    >
      <Link
        to={productDetailUrl}
        className="h-full flex flex-col justify-between group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition relative"
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={productImage}
            alt={productName}
            className={`${imgClassName || "w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"}`}
            loading="lazy"
            onError={(e) => {
              // Fallback para imágenes que no cargan
              e.currentTarget.src = "/images/placeholder.jpg";
            }}
          />
        </div>
        <div className="p-4">
          {productSubtitle && (
            <div className="text-sm text-gray-600 mb-1">{productSubtitle}</div>
          )}
          <div className="h-[48px] overflow-hidden">
            <h3 className="text-lg font-bold text-black leading-tight group-hover:text-black/80 transition line-clamp-2">
              {productName}
            </h3>
          </div>
          <div className="mt-1.5 text-base font-semibold">
            US$ {productPriceUSD.toFixed(2)}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}