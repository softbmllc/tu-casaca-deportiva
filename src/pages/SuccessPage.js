import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/SuccessPage.tsx
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
export default function SuccessPage() {
    const location = useLocation();
    const [paymentId, setPaymentId] = useState(null);
    const [status, setStatus] = useState(null);
    useEffect(() => {
        console.log("✅ SuccessPage montado");
        console.log("📍 URL completa:", location.search);
        try {
            const searchParams = new URLSearchParams(location.search);
            const pid = searchParams.get("payment_id");
            const stat = searchParams.get("status");
            console.log("🔎 payment_id:", pid);
            console.log("🔎 status:", stat);
            setPaymentId(pid);
            setStatus(stat);
        }
        catch (error) {
            console.error("❌ Error leyendo los parámetros:", error);
        }
    }, [location.search]);
    return (_jsxs("section", { className: "min-h-screen flex flex-col items-center justify-center px-4 text-center", children: [_jsx("h1", { className: "text-3xl font-bold mb-4 text-green-600", children: "\u00A1Pago exitoso!" }), _jsx("p", { className: "text-gray-700 mb-2", children: "Gracias por tu compra. Te enviaremos un WhatsApp para coordinar el env\u00EDo." }), paymentId && (_jsxs("div", { className: "bg-gray-100 text-gray-800 px-4 py-2 rounded-lg mt-4 text-sm", children: [_jsxs("p", { children: [_jsx("strong", { children: "ID de pago:" }), " ", paymentId] }), _jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", status] })] })), _jsx("a", { href: "/", className: "mt-6 bg-black text-white px-6 py-3 rounded-full hover:bg-black/90 transition", children: "Volver al inicio" })] }));
}
