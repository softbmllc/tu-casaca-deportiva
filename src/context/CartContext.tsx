// src/context/CartContext.tsx

// Utilidad para obtener un UID anónimo persistente en localStorage
function getAnonymousUID(): string {
  const localUID = localStorage.getItem("anonymousUID");
  if (localUID) return localUID;

  const newUID = crypto.randomUUID();
  localStorage.setItem("anonymousUID", newUID);
  return newUID;
}

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { loadCartFromFirebase as loadCartFromFirebaseUtils, saveCartToFirebase, loadCartFromFirebaseAndSync } from "../utils/cartFirebase";
import { enrichCartItems } from "../utils/cartUtils";
import { CartItem } from "../data/types";
import { isSameItem, mergeCartItems } from "../utils/cartUtils";

export type ShippingData = {
  name: string;
  address: string;
  address2?: string;
  city: string;
  departamento: string;
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
  updateItem: (id: string | number, variantLabel: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string | number, variantLabel: string) => void;
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

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [loading, setLoading] = useState(true);
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
    country: "",
    password: "",
    confirmPassword: "",
    wantsToRegister: false,
    coordinates: {
      lat: 0,
      lng: 0,
    },
    zip: "",
    departamento: "Montevideo",
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
    console.log("🟨 useEffect: guardando shippingData en localStorage");
    localStorage.setItem("shippingData", JSON.stringify(shippingData));
  }, [shippingData]);

  useEffect(() => {
    const uid = getAnonymousUID();
    const local = localStorage.getItem("cartItems");
    const localItems: CartItem[] = local ? JSON.parse(local) : [];

    (async () => {
      const firebaseItems: CartItem[] = await loadCartFromFirebase(uid);
      if (firebaseItems && firebaseItems.length > 0) {
        console.log("🛒 Cargando carrito desde Firebase:", firebaseItems);
        setCartItems(firebaseItems);
      } else if (localItems.length > 0) {
        console.log("🛒 Firebase vacío, usando localStorage:", localItems);
        setCartItems(localItems);
        saveCartToFirebase(uid, localItems);
      } else {
        console.warn("⚠️ setCartItems([]) ejecutado, posible limpieza del carrito");
        setCartItems([]);
      }
      setCartLoaded(true);
    })();
  }, []);

  useEffect(() => {
    console.log("🟨 useEffect: leyendo carrito desde localStorage al montar");
    const storedItems = localStorage.getItem("cartItems");
    if (storedItems) {
      try {
        setCartItems(JSON.parse(storedItems));
      } catch (error) {
        console.error("Error parsing cartItems from localStorage", error);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    console.log("🟨 useEffect: guardando carrito en Firebase y localStorage");
    const uid = getAnonymousUID();
    saveCartToFirebase(uid, cartItems);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems, cartLoaded]);

  // Persistencia de carrito: guardar en Firebase cuando hay usuario logueado
  useEffect(() => {
    if (user?.uid) {
      saveCartToFirebase(user.uid, cartItems);
    }
  }, [cartItems, user]);

  const addToCart = (newItem: CartItem) => {
    if (!newItem || !newItem.id) {
      console.warn("Intento de agregar item inválido al carrito:", newItem);
      return;
    }

    const title =
      typeof newItem.title === "object"
        ? newItem.title
        : {
            es: newItem.title || "",
            en: newItem.title || "",
          };

    const variant =
      newItem.variant && typeof newItem.variant.label === "object"
        ? {
            label: {
              es: newItem.variant.label.es || "Tamaño",
              en: newItem.variant.label.en || "Size"
            }
          }
        : typeof newItem.variantTitle === "object"
        ? {
            label: {
              es: newItem.variantTitle.es || "Tamaño",
              en: newItem.variantTitle.en || "Size"
            }
          }
        : typeof newItem.variantTitle === "string"
        ? {
            label: {
              es: newItem.variantTitle,
              en: newItem.variantTitle
            }
          }
        : undefined;

    const itemToAdd: CartItem = {
      ...newItem,
      title,
      variant: variant as CartItem["variant"],
      quantity: newItem.quantity || 1,
    };

    console.log("✅ Agregando al carrito:", itemToAdd);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.id === itemToAdd.id &&
          item.variantLabel === itemToAdd.variantLabel &&
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

  const updateItem = (id: string | number, variantLabel: string, updates: Partial<CartItem>) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id?.toString() === id.toString() && item.variantLabel === variantLabel
            ? { ...item, ...updates }
            : item
        )
        .filter((item) => item.quantity > 0) // 🔥 Esto elimina del carrito los de cantidad 0
    );
  };

  const removeItem = (id: string | number, variantLabel: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id?.toString() === id.toString() && item.variantLabel === variantLabel)
      )
    );
  };

  const clearCart = () => {
    console.warn("⚠️ setCartItems([]) ejecutado, posible limpieza del carrito");
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  // Wrapper to sync shippingInfo and shippingData
  const setShippingInfoWrapper = (data: ShippingData) => {
    setShippingInfo(data);
    setShippingData(data); // Sync both states
  };

  // Nueva función calculateCartTotal que suma envío si corresponde a Montevideo
  const calculateCartTotal = () => {
    let total = 0;

    cartItems.forEach((item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      total += price * quantity;
    });

    if (shippingInfo?.departamento === "Montevideo") {
      total += 169;
    }

    return total;
  };

  // Si existieran funciones con impuestos, las comentamos:
  // const totalWithTax = items.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0) * 1.075;
  // const finalTotal = items.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0) * 1.1;

  // Sincronización optimizada y escalable con localStorage para cartItems
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Nueva lógica de carga de carrito combinando localStorage y Firebase
  // Carga y enriquece los items del carrito desde localStorage
  const load = async () => {
    const rawItems = localStorage.getItem("cartItems");
    const parsedItems: CartItem[] = rawItems ? JSON.parse(rawItems) : [];
    const enrichedItems = await enrichCartItems(parsedItems);
    setCartItems(enrichedItems);
  };

  useEffect(() => {
    load();
  }, [user]);

  // Persistencia de carrito: carga desde Firebase según usuario
  useEffect(() => {
    console.log("🟨 useEffect: carga carrito desde Firebase según usuario");
    if (user?.uid) {
      loadCartFromFirebaseAndSync(user.uid, (itemsFromRealtime) => {
        setCartItems(itemsFromRealtime);
      }).then(async (items: CartItem[]) => {
        const enrichedItems = enrichCartItems(items);
        const resolvedItems = await enrichedItems;
        setCartItems(resolvedItems);
      });
      loadCartFromFirebase(user.uid).then(async (items) => {
        const enrichedItems = await enrichCartItems(items);
        setCartItems(enrichedItems);
      });
    }
  }, [user]);

  // Nueva función loadCartFromFirebase con validación y retorno
  const loadCartFromFirebase = async (uid: string): Promise<CartItem[]> => {
    if (!uid) return [];
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../firebaseUtils");
      const docRef = doc(db, 'carts', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const items: CartItem[] = docSnap.data().items || [];
        setCartItems(items);
        localStorage.setItem('cartItems', JSON.stringify(items));
        return items;
      }
      return [];
    } catch (error) {
      console.error('Error loading cart from Firebase:', error);
      return [];
    }
  };

  // Efecto para recalcular total cuando cambian cartItems o shippingInfo
  const [total, setTotal] = useState<number>(() => calculateCartTotal());
  useEffect(() => {
    setTotal(calculateCartTotal());
  }, [cartItems, shippingInfo]);

  if (loading) return null;

  return (
    <CartContext.Provider
      value={{
        items: cartItems,
        cartItems,
        addToCart,
        updateItem,
        clearCart,
        removeItem,
        shippingInfo,
        setShippingInfo: setShippingInfoWrapper as React.Dispatch<React.SetStateAction<ShippingData>>,
        shippingData,
        setShippingData,
        validateShippingData,
        total,
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