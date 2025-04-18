import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
//src/pages/FailurePage.tsx
export default function FailurePage() {
    return (_jsxs("section", { className: "min-h-screen flex flex-col items-center justify-center px-4 text-center", children: [_jsx("h1", { className: "text-3xl font-bold mb-4 text-red-600", children: "Pago rechazado" }), _jsx("p", { className: "text-gray-700 mb-6", children: "Algo sali\u00F3 mal con tu pago. Pod\u00E9s intentar nuevamente o contactarnos por WhatsApp." }), _jsxs("div", { className: "flex gap-4", children: [_jsx("a", { href: "/carrito", className: "bg-black text-white px-6 py-3 rounded-full hover:bg-black/90 transition", children: "Volver al carrito" }), _jsx("a", { href: "https://wa.me/59899123456", className: "text-sm underline text-blue-600 mt-2", target: "_blank", rel: "noopener noreferrer", children: "Contactar por WhatsApp" })] })] }));
}
