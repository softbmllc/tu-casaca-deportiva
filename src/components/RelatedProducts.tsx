// src/components/RelatedProducts.tsx
import products from "../data/products";
import ProductCard from "./ProductCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

interface Props {
  excludeSlugs?: string[];
}

export default function RelatedProducts({ excludeSlugs = [] }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const filtered = products.filter((p) => !excludeSlugs.includes(p.slug));

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight">También te podría gustar</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
            aria-label="Anterior"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
            aria-label="Siguiente"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory"
      >
        {filtered.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 snap-start scroll-ml-4 w-[270px] transition-transform hover:scale-[1.015]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}