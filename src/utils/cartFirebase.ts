//src/utils/cartFirebase.ts

import { db } from "../firebase"; // Asegurate de tener esta exportación desde tu config
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { CartItem } from "../data/types";

export async function saveCartToFirebase(uid: string, items: CartItem[]) {
  if (!uid) return;
  try {
    console.log("🔥 Data que se intenta guardar en Firebase:", items);
    const validItems = items.filter(
      (item) =>
        item &&
        item.slug &&
        item.title &&
        typeof item.price === "number" &&
        typeof item.quantity === "number"
    );

    if (validItems.length !== items.length) {
      console.warn("⚠️ Se detectaron items inválidos que no serán guardados en Firebase.");
    }
    // 🔧 Limpieza de campos undefined antes de guardar
    const sanitizedItems = validItems.map((item) => {
      const cleanItem: any = {};
      Object.entries(item).forEach(([key, value]) => {
        if (value !== undefined) cleanItem[key] = value;
      });
      return cleanItem;
    });

    await setDoc(doc(db, "carts", uid), { cartItems: sanitizedItems });
    console.log("✅ Carrito guardado exitosamente en Firebase.");
  } catch (error) {
    console.error("Error saving cart to Firebase:", error);
  }
}

export async function loadCartFromFirebase(uid: string): Promise<CartItem[]> {
  if (!uid) return [];
  try {
    const docSnap = await getDoc(doc(db, "carts", uid));
    console.log("📄 Snapshot completo:", docSnap);
    console.log("🧪 data() sin procesar:", docSnap.data());
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("🧪 Datos crudos cargados desde Firebase:", data);

      if (!data || !Array.isArray(data.cartItems)) {
        console.warn("⚠️ Documento en Firebase no contiene 'cartItems' válidos. Se omite la carga.");
        return [];
      }

      const validItems = data.cartItems.filter(
        (item: CartItem) =>
          item &&
          item.slug &&
          item.title &&
          typeof item.price === "number" &&
          typeof item.quantity === "number"
      );

      if (validItems.length !== data.cartItems.length) {
        console.warn("⚠️ Se detectaron items inválidos al cargar desde Firebase.");
      }

      console.log("✅ Carrito cargado exitosamente desde Firebase.");
      return validItems;
    }
  } catch (error) {
    console.error("Error loading cart from Firebase:", error);
  }
  return [];
}

export function listenToCartChanges(
  uid: string,
  callback: (items: CartItem[]) => void
): (() => void) | undefined {
  if (!uid) return undefined;
  return onSnapshot(doc(db, "carts", uid), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Agregado: imprimir la data cruda recibida de Firebase antes del filter
      console.log("🧩 Data cruda recibida desde Firebase:", data.cartItems);
      const validItems = (data.cartItems || []).map((item: any) => ({
        ...item,
        price: typeof item.price === "number" ? item.price : parseFloat(item.price) || 0,
        quantity: typeof item.quantity === "number" ? item.quantity : parseInt(item.quantity) || 1,
      }));

      const filteredItems = validItems.filter(
        (item: CartItem) =>
          item &&
          item.slug &&
          item.title &&
          item.price > 0 &&
          item.quantity > 0
      );

      if (filteredItems.length !== (data.cartItems || []).length) {
        console.warn("⚠️ Se detectaron items inválidos en tiempo real al escuchar cambios.");
      }

      callback(filteredItems);
      console.log("✅ Cambios en el carrito detectados y enviados al callback.");
      console.log("🧩 Data recibida desde Firebase en tiempo real:", data.cartItems);
    }
  });
}
// 🔁 Sincroniza carrito: escucha cambios y devuelve el snapshot inicial
export async function loadCartFromFirebaseAndSync(
  uid: string,
  callback: (items: CartItem[]) => void
): Promise<CartItem[]> {
  const initialItems = await loadCartFromFirebase(uid);
  listenToCartChanges(uid, callback); // mantener escucha activa
  return initialItems;
}