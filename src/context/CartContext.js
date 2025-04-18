import { jsx as _jsx } from "react/jsx-runtime";
// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        const stored = localStorage.getItem("cartItems");
        return stored ? JSON.parse(stored) : [];
    });
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(items));
    }, [items]);
    const addToCart = (newItem) => {
        setItems((prevItems) => {
            const existing = prevItems.find((item) => item.id === newItem.id &&
                item.size === newItem.size &&
                item.customName === newItem.customName &&
                item.customNumber === newItem.customNumber);
            if (existing) {
                return prevItems.map((item) => item === existing
                    ? { ...item, quantity: item.quantity + newItem.quantity }
                    : item);
            }
            else {
                return [...prevItems, newItem];
            }
        });
    };
    const updateItem = (id, size, updates) => {
        setItems((prevItems) => prevItems
            .map((item) => item.id === id && item.size === size
            ? { ...item, ...updates }
            : item)
            .filter((item) => item.quantity > 0) // 🔥 Esto elimina del carrito los de cantidad 0
        );
    };
    const clearCart = () => {
        setItems([]);
        localStorage.removeItem("cartItems");
    };
    return (_jsx(CartContext.Provider, { value: { items, addToCart, updateItem, clearCart }, children: children }));
}
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart debe usarse dentro de <CartProvider>");
    }
    return context;
}
