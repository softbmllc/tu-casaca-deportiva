// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { loadCartFromFirebase, saveCartToFirebase } from "../utils/cartFirebase";
import { CartItem } from "../data/types";
import { isSameItem, mergeCartItems } from "../utils/cartUtils";

export type ShippingData = {
  name: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  country?: string;
  password?: string;
  confirmPassword?: string;
  wantsToRegister?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  zip?: string;
};

type CartContextType = {
  items: CartItem[];
  cartItems: CartItem[]; // agregado para compatibilidad con componentes que usan cartItems
  addToCart: (item: CartItem) => void;
  updateItem: (id: string | number, size: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string | number, size: string) => void;
  clearCart: () => void;
  shippingInfo: ShippingData;
  setShippingInfo: React.Dispatch<React.SetStateAction<ShippingData>>;
  shippingData: ShippingData;
  setShippingData: (data: ShippingData) => void;
  validateShippingData: (data: ShippingData) => boolean;
  total: number;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const hasInitialized = useRef(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cartItems");
    if (!stored) return [];
    try {
      const parsed: CartItem[] = JSON.parse(stored);
      console.log("🛒 Cargando carrito desde localStorage (inicio):", parsed);
      return parsed.filter(item => item && item.id && typeof item.id === "string");
    } catch (error) {
      console.error("Error al parsear carrito localStorage:", error);
      return [];
    }
  });
  const [cartLoaded, setCartLoaded] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingData>({
    name: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    email: "",
    country: "United States",
    password: "",
    confirmPassword: "",
    wantsToRegister: false,
    coordinates: {
      lat: 0,
      lng: 0,
    },
    zip: "",
  });

  const [shippingData, setShippingData] = useState<ShippingData>(() => {
    const stored = localStorage.getItem("shippingData");
    return stored
      ? JSON.parse(stored)
      : {
          name: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          phone: "",
          email: "",
          coordinates: {
            lat: 0,
            lng: 0,
          },
        };
  });

  const validateShippingData = (data: ShippingData): boolean => {
    const requiredFields = ["name", "address", "city", "state", "postalCode", "phone", "email"];
    for (const field of requiredFields) {
      const value = (data as any)[field];
      if (!value || typeof value !== "string" || value.trim() === "") {
        console.warn(`Campo inválido o vacío: ${field}`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.warn("Email inválido");
      return false;
    }

    const phoneRegex = /^\d{8,15}$/;
    if (!phoneRegex.test(data.phone)) {
      console.warn("Teléfono inválido");
      return false;
    }

    return true;
  };

  useEffect(() => {
    localStorage.setItem("shippingData", JSON.stringify(shippingData));
  }, [shippingData]);

  useEffect(() => {
    const local = localStorage.getItem("cartItems");
    const localItems: CartItem[] = local ? JSON.parse(local) : [];

    if (user?.uid) {
      loadCartFromFirebase(user.uid).then((firebaseItems) => {
        if (firebaseItems.length > 0) {
          console.log("🛒 Cargando carrito desde Firebase:", firebaseItems);
          setItems(firebaseItems);
        } else if (localItems.length > 0) {
          console.log("🛒 Firebase vacío, usando localStorage:", localItems);
          setItems(localItems);
          saveCartToFirebase(user.uid!, localItems);
        } else {
          setItems([]);
        }
        setCartLoaded(true);
      });
    } else {
      // Usuario no logueado → solo localStorage
      if (localItems.length > 0) {
        console.log("🛒 Usuario anónimo, carrito desde localStorage:", localItems);
        setItems(localItems);
      } else {
        setItems([]);
      }
      setCartLoaded(true);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!cartLoaded) return;

    if (user?.uid) {
      saveCartToFirebase(user.uid, items);
    } else {
      localStorage.setItem("cartItems", JSON.stringify(items));
    }
  }, [items, user?.uid, cartLoaded]);

  const addToCart = (newItem: CartItem) => {
    if (!newItem || !newItem.id) {
      console.warn("Intento de agregar item inválido al carrito:", newItem);
      return;
    }

    const title =
      typeof newItem.title === "string"
        ? newItem.title
        : typeof newItem.title === "object" && newItem.title !== null
        ? (newItem.title["en"] ?? Object.values(newItem.title)[0] ?? "")
        : "";

    const itemToAdd: CartItem = {
      ...newItem,
      title: newItem.title as { en: string; es: string }, // aseguramos el tipo original
      quantity: newItem.quantity || 1,
    };

    console.log("✅ Agregando al carrito:", itemToAdd);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.id === itemToAdd.id &&
          item.size === itemToAdd.size &&
          item.variantId === itemToAdd.variantId
      );

      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + itemToAdd.quantity,
        };
        return updated;
      } else {
        return [...prevItems, itemToAdd as CartItem];
      }
    });
  };

  const updateItem = (id: string | number, size: string, updates: Partial<CartItem>) => {
    setItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id?.toString() === id.toString() && item.size === size
            ? { ...item, ...updates }
            : item
        )
        .filter((item) => item.quantity > 0) // 🔥 Esto elimina del carrito los de cantidad 0
    );
  };

  const removeItem = (id: string | number, size: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id?.toString() === id.toString() && item.size === size)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cartItems");
  };

  // Wrapper to sync shippingInfo and shippingData
  const setShippingInfoWrapper = (data: ShippingData) => {
    setShippingInfo(data);
    setShippingData(data); // Sync both states
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items,
        addToCart,
        updateItem,
        clearCart,
        removeItem,
        shippingInfo,
        setShippingInfo: setShippingInfoWrapper as React.Dispatch<React.SetStateAction<ShippingData>>,
        shippingData,
        setShippingData,
        validateShippingData,
        total: items.reduce((acc, item) => acc + item.priceUSD * item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return context;
}
