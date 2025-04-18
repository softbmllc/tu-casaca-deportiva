import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
const products = [
    {
        id: 1,
        name: "Nacional 24/25 Local",
        priceUSD: "$39",
        priceUYU: "$1.500",
        image: "/images/uruguay/nacional-home-24-25.jpg",
        category: "Fútbol",
    },
    {
        id: 2,
        name: "Peñarol 24/25 Local",
        priceUSD: "$39",
        priceUYU: "$1.500",
        image: "/images/uruguay/penarol-home-24-25.jpg",
        category: "Fútbol",
    },
    {
        id: 3,
        name: "Boca Juniors 24/25",
        priceUSD: "$39",
        priceUYU: "$1.500",
        image: "/images/argentina/boca-home-24-25.jpg",
        category: "Fútbol",
    },
    {
        id: 4,
        name: "River Plate 24/25",
        priceUSD: "$39",
        priceUYU: "$1.500",
        image: "/images/argentina/river-home-24-25.jpg",
        category: "Fútbol",
    },
    {
        id: 5,
        name: "Real Madrid 24/25",
        priceUSD: "$39",
        priceUYU: "$1.500",
        image: "/images/laliga/rma-local-24-25.jpg",
        category: "Fútbol",
    },
    {
        id: 6,
        name: "Inter Miami Especial 24/25",
        priceUSD: "$39",
        priceUYU: "$1.500",
        image: "/images/intermiami-third-24-25.jpg",
        category: "Fútbol",
    },
    {
        id: 7,
        name: "LA Lakers City Edition 22/23",
        priceUSD: "$39",
        priceUYU: "$1.500",
        image: "/images/lakers-jersey-cityedition.jpg",
        category: "NBA",
    },
    {
        id: 8,
        name: "Golden State Warriors 24/25",
        priceUSD: "$39",
        priceUYU: "$1.500",
        image: "/images/warriors-jersey-24-25.jpg",
        category: "NBA",
    },
];
export default function FeaturedProducts() {
    return (_jsxs("section", { id: "catalogo", className: "bg-white text-black py-16 px-6", children: [_jsxs(Helmet, { children: [_jsx("title", { children: "Productos destacados | Tu Casaca Deportiva" }), _jsx("meta", { name: "description", content: "Descubr\u00ED nuestras camisetas destacadas de f\u00FAtbol y b\u00E1squet. Calidad, estilo y env\u00EDo r\u00E1pido en Tu Casaca Deportiva." }), _jsx("meta", { name: "keywords", content: "camisetas f\u00FAtbol, camisetas b\u00E1squet, Nacional, Pe\u00F1arol, Boca, River, Lakers, Warriors, Inter Miami, camisetas 2024 2025" })] }), _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsx("h2", { className: "text-4xl sm:text-5xl font-extrabold text-center mb-12 text-gray-900", children: "Productos destacados" }), _jsx("div", { className: "grid gap-10 sm:grid-cols-2 lg:grid-cols-4", children: products.map((product) => (_jsxs(motion.div, { className: "bg-black text-white rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105 hover:shadow-xl hover:shadow-white/10", initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: product.id * 0.1 }, children: [_jsx("img", { src: product.image, alt: product.name, className: "w-full aspect-square object-cover transition-transform duration-300 hover:scale-105" }), _jsxs("div", { className: "p-4", children: [_jsx("span", { className: "text-xs text-gray-400 uppercase block mb-2", children: product.category }), _jsx("h3", { className: "text-base font-semibold mb-2", children: product.name }), _jsxs("p", { className: "text-green-500 font-semibold text-sm", children: [product.priceUSD, _jsx("span", { className: "text-white/70 text-xs ml-1", children: "USD" }), _jsx("span", { className: "text-white/40 mx-1", children: "/" }), product.priceUYU, _jsx("span", { className: "text-white/70 text-xs ml-1", children: "UYU" })] }), _jsx("button", { className: "mt-5 w-full bg-white text-black py-2 rounded-full font-semibold hover:bg-gray-200 transition", children: "Agregar al carrito" })] })] }, product.id))) })] })] }));
}
