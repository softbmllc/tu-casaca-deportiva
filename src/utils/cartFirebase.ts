//src/utils/cartFirebase.ts
import { db } from "../firebase"; // Asegurate de tener esta exportación desde tu config
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { CartItem } from "../data/types";

export async function saveCartToFirebase(uid: string, items: CartItem[]) {
  if (!uid) return;
  try {
    await setDoc(doc(db, "carts", uid), { cartItems: items });
  } catch (error) {
    console.error("Error saving cart to Firebase:", error);
  }
}

export async function loadCartFromFirebase(uid: string): Promise<CartItem[]> {
  if (!uid) return [];
  try {
    const docSnap = await getDoc(doc(db, "carts", uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.cartItems || [];
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
      callback(data.cartItems || []);
    }
  });
}