// src/context/CartContext.tsx

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
// import { useAuth } from "./AuthContext";
import { loadCartFromFirebase as loadCartFromFirebaseUtils, saveCartToFirebase, loadCartFromFirebaseAndSync } from "../utils/cartFirebase";
import { enrichCartItems } from "../utils/cartUtils";
import { CartItem } from "../data/types";
import { isSameItem, mergeCartItems } from "../utils/cartUtils";
// import { auth } from "../firebaseUtils"; // make sure this is imported

async function ensureAuthUID(): Promise<string> {
  const authInstance = getAuth();
  if (authInstance.currentUser?.uid) {
    return authInstance.currentUser.uid;
  }
  const cred = await signInAnonymously(authInstance);
  localStorage.setItem("anonymousUID", cred.user.uid);
  return cred.user.uid;
}

// --- ShippingInfo type for createPreference and other uses ---
export interface ShippingInfo {
  nombreCompleto: string;
  direccion: string;
  departamento: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
  email: string;
  shippingCost?: number;
}

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
  // const { user } = useAuth();

  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const isAuthRoute =
    typeof window !== "undefined" &&
    (window.location.pathname === "/login" || window.location.pathname === "/admin/login");

  // Asegura sesión anónima y guarda el UID actual (anónimo o logueado)
  useEffect(() => {
    if (isAuthRoute) return; // no iniciar auth anónima en /login
    const authInstance = getAuth();
    const unsub = onAuthStateChanged(authInstance, async (fbUser) => {
      if (fbUser) {
        setCurrentUid(fbUser.uid);
      } else {
        try {
          const cred = await signInAnonymously(authInstance);
          setCurrentUid(cred.user.uid);
        } catch (e) {
          console.error("No se pudo iniciar sesión anónima:", e);
        }
      }
    });
    return () => unsub();
  }, [isAuthRoute]);

  const hasInitialized = useRef(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cartItems");
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
    console.log("🟨 useEffect: carga carrito desde Firebase según usuario/UID actual");
    if (isAuthRoute) return; // no listeners en /login
    if (!currentUid) return;

    const stopAny: unknown = loadCartFromFirebaseAndSync(currentUid, async (itemsFromRealtime) => {
      const incoming = Array.isArray(itemsFromRealtime) ? itemsFromRealtime : [];
      // 🚧 Guardar: si lo que llega de Firebase está vacío pero tengo carrito local, NO piso el local
      if (!incoming || incoming.length === 0) {
        try {
          const local = JSON.parse(localStorage.getItem("cartItems") || "[]");
          if (Array.isArray(local) && local.length > 0) {
            console.warn("⏭️ Ignorando carrito remoto vacío para no pisar el local existente");
            return; // salimos del callback sin tocar state/localStorage
          }
        } catch {}
      }
      const resolvedItems = await enrichCartItems(incoming || []);
      const safeItems = Array.isArray(resolvedItems) ? resolvedItems : [];
      console.log("🟩 Items recibidos desde Firebase:", safeItems);
      setCartItems(safeItems);
      localStorage.setItem("cartItems", JSON.stringify(safeItems));
    });

    return () => {
      if (stopAny && typeof stopAny === "function") {
        stopAny();
      }
    };
  }, [currentUid]);

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
    setCartItems((prevItems) => {
      const next = prevItems.filter(
        (item) => !(item.id?.toString() === id.toString() && item.variantLabel === variantLabel)
      );
      // Persistimos inmediatamente para evitar que reaparezca al recargar
      if (currentUid) { try { saveCartToFirebase(currentUid, next); } catch {} }
      localStorage.setItem("cartItems", JSON.stringify(next));
      return next;
    });
  };

  const clearCart = () => {
    console.warn("⚠️ setCartItems([]) ejecutado, posible limpieza del carrito");
    setCartItems([]);
    localStorage.setItem("cartItems", JSON.stringify([]));
    // también vaciamos el carrito remoto para que no reaparezca al recargar
    if (currentUid) {
      try { saveCartToFirebase(currentUid, []); } catch (e) { console.warn("No se pudo vaciar carrito remoto:", e); }
    }
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
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  /*
  // Nueva función loadCartFromFirebase con validación y retorno
  const loadCartFromFirebase = async (uid: string): Promise<CartItem[]> => {
    if (!uid) return [];
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../firebaseUtils");
      const docRef = doc(db, "carts", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const items: CartItem[] = (docSnap.data() as any).items || [];
        // no forzamos setCartItems aquí; dejamos que el caller decida
        return items;
      }
      return [];
    } catch (error) {
      console.error("Error loading cart from Firebase:", error);
      return [];
    }
  };
  */

  // Efecto para recalcular total cuando cambian cartItems o shippingInfo
  const [total, setTotal] = useState<number>(() => calculateCartTotal());
  useEffect(() => {
    setTotal(calculateCartTotal());
  }, [cartItems, shippingInfo]);

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