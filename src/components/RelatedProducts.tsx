// src/components/RelatedProducts.tsx

import { useEffect, useState } from "react";
import i18n from "../i18n-config";
import { fetchProducts } from "../firebaseUtils";
import ProductCard from "./ProductCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

interface Props {
  excludeSlugs?: string[];
  categoryName?: string;
  title?: string;
}

export default function RelatedProducts({ excludeSlugs = [], categoryName, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => console.error("Error loading products in RelatedProducts:", err));
  }, []);

  console.log("🧩 RelatedProducts: slugs excluidos", excludeSlugs);

  console.log("[🧪 RelatedProducts] Productos cargados:", products);

  console.log("📦 Slugs excluidos:", excludeSlugs);
  console.log("📦 Todos los productos disponibles:", products.map(p => p.slug));

  // const filtered = products.filter(
  //   (p) =>
  //     p.slug &&
  //     !excludeSlugs.includes(p.slug) &&
  //     (!categoryName || p.category?.name?.toLowerCase() === categoryName.toLowerCase())
  // );
  const filtered = products.map((product) => ({
    ...product,
    title: typeof product.title === "object" ? product.title?.es || product.name || "Sin título" : product.title || product.name || "Sin título",
  }));

  console.log("🧩 Productos después del filtro", filtered);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -340 : 340,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {title && (
        <div className="container px-4 mx-auto flex justify-between items-center mt-4 md:mt-8 border-t pt-4 mb-6 md:mb-10">
          <h2 className="text-xl sm:text-3xl font-medium leading-snug text-left text-neutral-900 whitespace-normal mt-2 mb-4 sm:mt-4 sm:mb-6">
            {title}
          </h2>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-3 bg-white rounded-full shadow-md hover:bg-black hover:text-white transition border border-gray-300"
              aria-label="Anterior"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 bg-white rounded-full shadow-md hover:bg-black hover:text-white transition border border-gray-300"
              aria-label="Siguiente"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-4 pb-2 pt-2 scroll-smooth hide-scrollbar snap-x snap-mandatory"
      >
        {filtered.map((product) => {
          const priceUSD = product.priceUSD || 0;
          const slug = product.slug;

          return (
            <div key={product.id} className="flex-shrink-0 snap-start scroll-ml-4 w-[220px] sm:w-[270px]">
              <ProductCard
                product={{
                  ...product,
                  priceUSD,
                  slug
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}