import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/CartPage.tsx
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import RelatedProducts from "../components/RelatedProducts";
import { Trash2, Minus, Plus } from "lucide-react";
export default function CartPage() {
    const { items, updateItem } = useCart();
    const [currency, setCurrency] = useState("USD");
    const [loading, setLoading] = useState(false);
    const total = items.reduce((sum, item) => {
        const price = currency === "USD" ? item.priceUSD : item.priceUYU;
        return sum + price * item.quantity;
    }, 0);
    const handleQuantityChange = (item, newQty) => {
        if (newQty >= 1 && newQty <= 99) {
            updateItem(item.id, item.size, { quantity: newQty });
        }
    };
    const handleRemoveItem = (item) => {
        updateItem(item.id, item.size, { quantity: 0 });
    };
    const handleCheckout = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/create_preference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        title: item.name,
                        quantity: item.quantity,
                        unit_price: currency === "USD" ? item.priceUSD : item.priceUYU,
                        currency_id: currency,
                    })),
                    payer: {},
                }),
            });
            const data = await res.json();
            console.log("🧾 MP Response:", data);
            if (data.init_point) {
                window.location.href = data.init_point;
            }
            else {
                console.error("No se recibió init_point");
            }
        }
        catch (err) {
            console.error("Error en el checkout:", err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("section", { className: "max-w-5xl mx-auto px-6 py-10", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Tu carrito" }), items.length === 0 ? (_jsxs("p", { className: "text-gray-600", children: ["Tu carrito est\u00E1 vac\u00EDo. Volv\u00E9 al", " ", _jsx(Link, { to: "/futbol", className: "text-black underline", children: "cat\u00E1logo" }), " ", "para seguir comprando."] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Resumen de tu compra" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setCurrency("USD"), className: `px-4 py-2 rounded-md border text-sm ${currency === "USD" ? "bg-black text-white" : "bg-white text-black"}`, children: "Pagar en USD" }), _jsx("button", { onClick: () => setCurrency("UYU"), className: `px-4 py-2 rounded-md border text-sm ${currency === "UYU" ? "bg-black text-white" : "bg-white text-black"}`, children: "Pagar en UYU" })] })] }), _jsx("ul", { className: "divide-y divide-gray-200 mb-6", children: items.map((item, index) => {
                            const price = currency === "USD" ? item.priceUSD : item.priceUYU;
                            const totalItem = price * item.quantity;
                            return (_jsxs("li", { className: "py-4 flex gap-4 items-center", children: [_jsx(Link, { to: `/producto/${item.slug}`, children: _jsx("img", { src: item.image, alt: item.name, className: "w-20 h-20 object-cover rounded-md border" }) }), _jsxs("div", { className: "flex-1", children: [_jsx(Link, { to: `/producto/${item.slug}`, children: _jsx("p", { className: "font-semibold text-sm mb-1 hover:underline", children: item.name }) }), _jsxs("div", { className: "text-sm text-gray-500 flex flex-wrap items-center gap-3", children: [_jsxs("span", { children: ["Talle:", " ", _jsx("span", { className: "inline-block border border-gray-300 px-2 py-0.5 rounded-md bg-gray-50 text-gray-800", children: item.size })] }), _jsxs("span", { className: "flex items-center gap-1", children: ["Cantidad:", _jsx("button", { onClick: () => handleQuantityChange(item, item.quantity - 1), className: "w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50", disabled: item.quantity <= 1, children: _jsx(Minus, { className: "w-3 h-3" }) }), _jsx("span", { className: "w-6 text-center", children: item.quantity }), _jsx("button", { onClick: () => handleQuantityChange(item, item.quantity + 1), className: "w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100", disabled: item.quantity >= 99, children: _jsx(Plus, { className: "w-3 h-3" }) })] }), _jsx("button", { onClick: () => handleRemoveItem(item), className: "ml-2 text-red-500 hover:text-red-700 transition", title: "Eliminar", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), item.customName && item.customNumber && (_jsxs("p", { className: "text-sm text-gray-500", children: ["Personalizado: ", item.customName, " #", item.customNumber] }))] }), _jsxs("div", { className: "text-right text-sm whitespace-nowrap font-semibold", children: ["$", totalItem, " ", currency] })] }, index));
                        }) }), _jsxs("div", { className: "bg-gray-100 p-6 rounded-2xl shadow-inner mt-10", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("span", { className: "text-lg font-medium text-gray-700", children: "Total" }), _jsxs("span", { className: "text-2xl font-bold text-gray-900", children: ["$", total, " ", currency] })] }), _jsx("button", { onClick: handleCheckout, disabled: loading, className: "w-full bg-black text-white text-sm sm:text-base py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-md hover:shadow-lg disabled:opacity-60", children: loading ? "Cargando..." : "Finalizar compra" })] }), _jsx("div", { className: "mt-10", children: _jsx(RelatedProducts, { excludeSlugs: items.map((i) => i.slug) }) })] }))] }));
}
