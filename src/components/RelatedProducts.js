import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/RelatedProducts.tsx
import products from "../data/products";
import ProductCard from "./ProductCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
export default function RelatedProducts({ excludeSlugs = [] }) {
    const scrollRef = useRef(null);
    const filtered = products.filter((p) => !excludeSlugs.includes(p.slug));
    const scroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -340 : 340,
                behavior: "smooth",
            });
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Tambi\u00E9n te podr\u00EDa gustar" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => scroll("left"), className: "p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition", "aria-label": "Anterior", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => scroll("right"), className: "p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition", "aria-label": "Siguiente", children: _jsx(ArrowRight, { className: "w-4 h-4" }) })] })] }), _jsx("div", { ref: scrollRef, className: "flex gap-5 overflow-x-auto pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory", children: filtered.map((product) => (_jsx("div", { className: "flex-shrink-0 snap-start scroll-ml-4 w-[270px] transition-transform hover:scale-[1.015]", children: _jsx(ProductCard, { product: product }) }, product.id))) })] }));
}
