import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
export default function AddToCartButton({ product }) {
    const [isAdding, setIsAdding] = useState(false);
    const handleClick = () => {
        setIsAdding(true);
        // Simular acción de agregar al carrito
        setTimeout(() => {
            alert(`Agregado: ${product.name}`);
            setIsAdding(false);
        }, 1000);
    };
    return (_jsx("button", { onClick: handleClick, disabled: isAdding, className: "mt-6 w-full bg-black text-white font-semibold py-3 rounded-full flex justify-center items-center gap-2 hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed", children: isAdding ? (_jsx("span", { className: "animate-pulse", children: "Agregando..." })) : (_jsxs(_Fragment, { children: [_jsx(FiShoppingCart, { className: "text-lg" }), "Agregar al carrito"] })) }));
}
