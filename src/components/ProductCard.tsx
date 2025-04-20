// src/components/ProductCard.tsx
import { Product } from "../data/types";
import { ArrowRight, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import stock from "../data/stock";

function ProductCard({ product }: { product: Product }) {
  const isExpress = stock.some((item) => item.slug === product.slug);

  return (
    <Link to={`/producto/${product.slug}`} className="block">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-visible group relative">
        {/* Imagen */}
        <div className="w-full aspect-square overflow-hidden bg-gray-100 relative">
          {/* Mostrar cinta solo si está en stock */}
          {isExpress && (
            <div className="absolute top-[30px] right-[-36px] w-[150px] bg-amber-500 text-white text-[10px] py-1 px-2 text-center font-bold rotate-45 z-10 flex items-center justify-center gap-1 animate-pulse drop-shadow-sm">
              <Rocket size={12} className="inline-block" /> Entrega Express
            </div>
          )}

          <img
            src={product.image}
            alt={product.name}
            onError={(e) =>
              ((e.target as HTMLImageElement).src = "/images/placeholder.jpg")
            }
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