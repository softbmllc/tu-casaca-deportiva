// src/components/ProductCard.tsx
import { Product } from "../data/types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/producto/${product.slug}`} className="block">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Imagen */}
        <div className="w-full h-60 overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col gap-3">
          <h2 className="text-base font-semibold text-black leading-tight">
            {product.name}
          </h2>
          <p className="text-sm font-bold text-green-600">
            {product.priceUSD}
            <span className="text-gray-500 ml-1">USD</span> /{" "}
            <span className="text-green-600">{product.priceUYU}</span>
            <span className="text-gray-500 ml-1">UYU</span>
          </p>
          <span className="flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold py-2 rounded-full w-full transition group-hover:scale-105 group-hover:bg-black/90">
            Ver más <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;