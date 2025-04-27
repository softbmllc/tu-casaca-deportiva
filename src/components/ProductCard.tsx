// src/components/ProductCard.tsx
import { Link } from "react-router-dom";
import { Product } from "../data/types";
import { motion } from "framer-motion";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  // Asegurarnos de que tenemos un slug limpio y válido
  const safeSlug = product.slug ? encodeURIComponent(product.slug) : `product-${product.id}`;
  
  // Construir la ruta al detalle del producto con el ID para evitar problemas de coincidencia de slug
  const productDetailUrl = `/producto/${safeSlug}`;
  
  // Obtener la imagen principal, asegurando que existe
  const productImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : "");
  
  // Asegurar que tenemos un nombre de producto
  const productName = product.name || product.title || "Producto";
  
  // Asegurar que tenemos precios
  const productPriceUSD = product.priceUSD || product.usdPrice || 0;
  const productPriceUYU = product.priceUYU || product.uyuPrice || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={`product-card-${product.id}-${safeSlug}`} // Key único para evitar problemas de renderizado
    >
      <Link 
        to={productDetailUrl} 
        className="block group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition relative"
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300 ease-out"
            loading="lazy"
            onError={(e) => {
              // Fallback para imágenes que no cargan
              e.currentTarget.src = "/images/placeholder.jpg";
            }}
          />
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-1">{product.subtitle || ""}</div>
          <h3 className="text-lg font-bold text-black leading-tight line-clamp-2 group-hover:text-black/80 transition">
            {productName}
          </h3>
          <div className="mt-1.5 text-base font-semibold">
            ${productPriceUSD} USD / ${productPriceUYU} UYU
          </div>
        </div>
      </Link>
    </motion.div>
  );
}