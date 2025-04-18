import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/ProductPage.tsx
import { useParams, Link } from "react-router-dom";
import products from "../data/products";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import CartIcon from "../components/CartIcon";
import { FiMinus, FiPlus } from "react-icons/fi";
import { Check, ScissorsLineDashed, Inbox, ChevronLeft, ArrowUp } from "lucide-react";
import RelatedProducts from "../components/RelatedProducts";
import { useCart } from "../context/CartContext"; // 🛒 nuevo
export default function ProductPage() {
    const { id } = useParams();
    const product = products.find((p) => p.slug === id);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedNumber, setSelectedNumber] = useState("");
    const [customName, setCustomName] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const isStocked = "stock" in (product || {});
    const availableStock = isStocked
        ? selectedSize
            ? product?.stock?.[selectedSize] ?? 0
            : 0
        : 99;
    const scrollRef = useRef(null);
    const { addToCart, items } = useCart(); // 🛒 hook para agregar al carrito
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0); // 🔢 número total
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [id]);
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    if (!product)
        return _jsx("div", { className: "p-10", children: "Producto no encontrado" });
    const hasCustomization = selectedNumber || customName;
    const finalPriceUSD = hasCustomization ? product.priceUSD + 10 : product.priceUSD;
    const finalPriceUYU = hasCustomization ? product.priceUYU + 400 : product.priceUYU;
    const scroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -300 : 300,
                behavior: "smooth",
            });
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Helmet, { children: [_jsx("script", { type: "application/ld+json", children: JSON.stringify({
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            name: product.name,
                            image: product.images?.[0]
                                ? [`https://tucasacadeportiva.com${product.images[0]}`]
                                : [],
                            description: `Camiseta ${product.name}, ideal para hinchas y coleccionistas. Disponible en talles S a XL.`,
                            sku: product.slug,
                            offers: {
                                "@type": "Offer",
                                url: `https://tucasacadeportiva.com/producto/${product.slug}`,
                                priceCurrency: "USD",
                                price: product.priceUSD,
                                itemCondition: "https://schema.org/NewCondition",
                                availability: isStocked
                                    ? "https://schema.org/InStock"
                                    : "https://schema.org/PreOrder",
                            },
                        }) }), _jsx("title", { children: `${product.name} | Tu Casaca Deportiva` }), _jsx("meta", { name: "description", content: `Conseguí la camiseta ${product.name} al mejor precio. Envíos a todo Uruguay. Personalizala con nombre y número si querés.` }), _jsx("meta", { name: "keywords", content: `camiseta ${product.name}, ${product.name} 24/25, casaca de fútbol, camiseta personalizada, tu casaca deportiva` }), _jsx("meta", { property: "og:title", content: `${product.name} | Tu Casaca Deportiva` }), _jsx("meta", { property: "og:description", content: `Conseguí la camiseta ${product.name} personalizada. Envíos a todo Uruguay. Stock disponible en talles S a XL.` }), _jsx("meta", { property: "og:image", content: `https://tucasacadeportiva.com${product.images?.[0] || "/images/categoria-futbol.jpg"}` }), _jsx("meta", { property: "og:url", content: `https://tucasacadeportiva.com/producto/${product.slug}` }), _jsx("meta", { property: "og:type", content: "product" })] }), _jsxs("section", { className: "max-w-6xl mx-auto px-6 py-10", children: [_jsxs(Link, { to: "/futbol", className: "inline-flex items-center gap-2 text-sm font-semibold text-black hover:underline transition w-fit mb-4", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), " Volver al cat\u00E1logo"] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-10", children: [_jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex flex-col gap-3", children: product.images.map((img, idx) => (_jsx("img", { src: img, alt: `${product.name} thumbnail ${idx}`, onMouseEnter: () => setSelectedImage(idx), onClick: () => setSelectedImage(idx), className: `w-16 h-16 object-cover rounded-md cursor-pointer border transition-all duration-200 ${selectedImage === idx ? "border-black shadow-md" : "border-transparent"}` }, idx))) }), _jsx("div", { className: "flex-1 bg-white rounded-xl overflow-hidden flex items-center justify-center h-[520px]", children: _jsx("img", { src: product.images[selectedImage], alt: product.name, className: "object-contain max-h-full max-w-full transition-opacity duration-500 ease-in-out animate-fadeIn" }, selectedImage) })] }), _jsxs("div", { className: "flex flex-col gap-6", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight leading-tight", children: product.name }), _jsxs("p", { className: "text-2xl md:text-3xl font-bold text-black mb-2", children: ["$", finalPriceUSD, " USD / $", finalPriceUYU, " UYU"] }), _jsxs("div", { children: [_jsx("label", { className: "font-semibold block mb-2", children: "Talle:" }), _jsx("div", { className: "flex gap-2 flex-wrap", children: product.sizes.map((size) => {
                                                    const inStock = isStocked ? product.stock?.[size] : true;
                                                    const isOut = isStocked && product.stock?.[size] === 0;
                                                    return (_jsxs("button", { onClick: () => setSelectedSize(size), disabled: isStocked && product.stock?.[size] === 0, className: `px-4 py-2 rounded-md border transition text-sm font-medium ${selectedSize === size
                                                            ? "bg-black text-white border-black scale-105"
                                                            : "bg-white border-gray-300"} ${isOut ? "opacity-50 cursor-not-allowed" : ""}`, children: [size, " ", isOut && "(Por encargue)"] }, size));
                                                }) })] }), !isStocked && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "font-semibold block mb-2", children: "N\u00FAmero (opcional):" }), _jsx("input", { type: "text", inputMode: "numeric", pattern: "[0-9]*", placeholder: "Ej: 10", value: selectedNumber, onChange: (e) => {
                                                            const value = e.target.value;
                                                            if (/^\d{0,2}$/.test(value))
                                                                setSelectedNumber(value);
                                                        }, className: "w-full text-center border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "font-semibold block mb-2", children: "Nombre (opcional):" }), _jsx("input", { type: "text", placeholder: "Ej: RODRIGO", value: customName, onChange: (e) => setCustomName(e.target.value), className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50" })] })] })), _jsxs("div", { children: [_jsx("label", { className: "font-semibold block mb-2", children: "Cantidad:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => {
                                                            if (quantity > 1)
                                                                setQuantity(quantity - 1);
                                                        }, className: "w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 disabled:opacity-50", disabled: quantity <= 1 || !selectedSize, children: _jsx(FiMinus, {}) }), _jsx("span", { className: "w-8 text-center", children: quantity }), _jsx("button", { onClick: () => {
                                                            if (quantity < availableStock)
                                                                setQuantity(quantity + 1);
                                                        }, className: "w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 disabled:opacity-50", disabled: quantity >= availableStock || !selectedSize, children: _jsx(FiPlus, {}) })] }), isStocked && selectedSize && (_jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["M\u00E1ximo disponible: ", availableStock] })), isStocked && !selectedSize && (_jsx("p", { className: "text-sm text-gray-500 mt-1 italic", children: "Eleg\u00ED un talle para ver disponibilidad" }))] }), _jsxs("div", { className: "mt-4 border-t pt-4 text-sm text-gray-700 leading-relaxed space-y-2", children: [_jsx("p", { children: "Camiseta de alta calidad, confeccionada en tela liviana, suave y transpirable. Terminaciones premium que aseguran gran confort y durabilidad." }), _jsx("p", { children: "Ideal para el d\u00EDa a d\u00EDa, entrenar o sumar a tu colecci\u00F3n futbolera." }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-green-600" }), "Disponible en talles S, M, L y XL."] }), !isStocked && (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(ScissorsLineDashed, { className: "w-4 h-4 text-red-500" }), "Opci\u00F3n de personalizaci\u00F3n con nombre y n\u00FAmero."] })), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Inbox, { className: "w-4 h-4 text-blue-500" }), "Consultar disponibilidad inmediata."] })] }), _jsx("p", { className: "text-base font-semibold text-black mt-2", children: "\u00A1Viv\u00ED el f\u00FAtbol con estilo!" })] }), _jsxs("div", { className: "border-t pt-4", children: [errorMessage && (_jsx("div", { className: "mb-4 bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-md border border-red-300", children: errorMessage })), _jsx("button", { onClick: () => {
                                                    if (!selectedSize) {
                                                        setErrorMessage("Seleccioná un talle para continuar.");
                                                        return;
                                                    }
                                                    setErrorMessage(""); // Limpiar si está todo ok
                                                    addToCart({
                                                        id: product.id,
                                                        slug: product.slug,
                                                        name: product.name,
                                                        image: product.image,
                                                        priceUSD: product.priceUSD,
                                                        priceUYU: product.priceUYU,
                                                        quantity,
                                                        size: selectedSize,
                                                        customName: customName || "",
                                                        customNumber: selectedNumber || "",
                                                    });
                                                }, className: "bg-black text-white w-full py-3 rounded-2xl font-semibold hover:scale-[1.03] hover:bg-black/90 hover:shadow-lg transition-all duration-200 shadow-md", children: "Agregar al carrito" })] })] })] })] }), _jsx("div", { className: "max-w-6xl mx-auto px-4 mt-12", children: _jsx(RelatedProducts, { excludeSlugs: [product.slug] }) }), _jsx("div", { className: "absolute top-6 right-6 z-50", children: _jsx(CartIcon, { variant: "hero" }) }), showScrollTop && (_jsx("button", { onClick: scrollToTop, className: "fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg hover:bg-black/80 transition", children: _jsx(ArrowUp, { className: "w-4 h-4" }) }))] }));
}
