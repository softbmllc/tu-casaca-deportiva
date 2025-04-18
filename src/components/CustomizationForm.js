import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function CustomizationForm() {
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    // Generamos los números de 0 a 99 como opciones del select
    const numbers = Array.from({ length: 100 }, (_, i) => i === 0 ? "00" : i.toString());
    return (_jsxs("div", { className: "mt-6 space-y-4", children: [_jsx("h4", { className: "font-bold text-sm", children: "Personaliz\u00E1 tu camiseta" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", htmlFor: "playerName", children: "Nombre (opcional)" }), _jsx("input", { type: "text", id: "playerName", maxLength: 20, placeholder: "Ej: Su\u00E1rez", value: name, onChange: (e) => setName(e.target.value), className: "w-full border border-gray-300 px-4 py-2 rounded-lg text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", htmlFor: "playerNumber", children: "N\u00FAmero (opcional)" }), _jsxs("select", { id: "playerNumber", value: number, onChange: (e) => setNumber(e.target.value), className: "w-full border border-gray-300 px-4 py-2 rounded-lg text-sm", children: [_jsx("option", { value: "", children: "Sin n\u00FAmero" }), numbers.map((num) => (_jsx("option", { value: num, children: num }, num)))] })] })] }));
}
