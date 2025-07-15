// src/components/ProductCard.tsx

import { Link } from "react-router-dom";
import { Product } from "../data/types";
import { motion } from "framer-motion";
import { getFinalPrice } from "../utils/priceUtils";
import PriceBadge from "./PriceBadge";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  // Asegurarnos de que tenemos un slug limpio y válido
  const safeSlug = product.slug ? encodeURIComponent(product.slug) : `product-${product.id}`;

  // Construir la ruta al detalle del producto con el ID para evitar problemas de coincidencia de slug
  const productDetailUrl = `/producto/${safeSlug}`;

  // Obtener la imagen principal, asegurando que existe
  const productImage = (product.images && product.images.length > 0 ? product.images[0] : "");

  // Asegurar que tenemos un nombre de producto
  const productName = product.name || product.title || "Producto";

  // Asegurar que tenemos precios
  const productPriceUYU = product.priceUYU ?? undefined;

  const finalPriceUYU = getFinalPrice(product, "UYU");

  console.log("🧪 Renderizando ProductCard:", product);
  console.log("💸 Precio vs Descuento", {
    precio: product.priceUYU,
    descuento: product.discountPriceUYU,
  });
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={`product-card-${product.id}-${safeSlug}`} // Key único para evitar problemas de renderizado
      className={`relative border-t-4 ${
        product.category?.name === "NBA" ? "border-blue-600" : "border-transparent"
      }`}
    >
      <Link
        to={productDetailUrl}
        className="block group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition relative"
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Fallback para imágenes que no cargan
              e.currentTarget.src = "/images/placeholder.jpg";
            }}
          />
        </div>
        <div className="p-3">
          {typeof product.discountPriceUYU === "number" &&
           product.discountPriceUYU < productPriceUYU && (
            <PriceBadge variant="oferta" />
          )}
          {product.subtitle && (
            <div className="text-sm text-gray-600 mb-1">{product.subtitle}</div>
          )}
          <h3 className="text-lg font-bold text-black leading-tight line-clamp-2 group-hover:text-black/80 transition">
            {productName}
          </h3>
          <div className="mt-2 space-y-1 min-h-[48px]">
            {typeof productPriceUYU === "number" ? (
              typeof product.discountPriceUYU === "number" &&
              !isNaN(product.discountPriceUYU) &&
              product.discountPriceUYU < productPriceUYU ? (
                <div className="flex flex-col leading-tight">
                  <span className="text-sm text-gray-500 line-through">
                    $ {productPriceUYU.toLocaleString("es-UY", {
                      minimumFractionDigits: 0,
                    })} UYU
                  </span>
                  <span className="text-red-600 font-bold text-lg">
                    $ {product.discountPriceUYU.toLocaleString("es-UY", {
                      minimumFractionDigits: 0,
                    })} UYU
                  </span>
                </div>
              ) : (
                <span className="text-black font-semibold text-base">
                  $ {productPriceUYU.toLocaleString("es-UY", {
                    minimumFractionDigits: 0,
                  })} UYU
                </span>
              )
            ) : (
              <span className="text-gray-400 text-sm">Precio no disponible</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}