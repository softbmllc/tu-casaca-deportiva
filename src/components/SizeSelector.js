import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function SizeSelector({ sizes }) {
    return (_jsxs("div", { className: "mt-6", children: [_jsx("h4", { className: "font-bold text-sm mb-2", children: "Seleccion\u00E1 tu talle" }), _jsx("div", { className: "flex flex-wrap gap-2", children: sizes.map((size) => (_jsx("button", { className: "border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-black hover:text-white transition", children: size }, size))) })] }));
}
