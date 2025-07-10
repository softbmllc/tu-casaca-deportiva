import { db } from "../firebase"; // Asegurate de que este import exista en el archivo final
import { collection, doc, setDoc } from "firebase/firestore"; // También al comienzo si aún no están
//src/utils/cartUtils.ts
import { CartItem } from "../data/types";

export function calculateTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + item.priceUSD * item.quantity, 0);
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function isSameItem(a: CartItem, b: CartItem): boolean {
  return (
    a.id === b.id &&
    a.variantId === b.variantId &&
    a.size === b.size &&
    a.customName === b.customName &&
    a.customNumber === b.customNumber &&
    a.options === b.options
  );
}

export function mergeCartItems(localItems: CartItem[], remoteItems: CartItem[]): CartItem[] {
  const merged: CartItem[] = [...remoteItems];

  localItems.forEach((localItem) => {
    const matchIndex = merged.findIndex((remoteItem) => isSameItem(localItem, remoteItem));

    if (matchIndex !== -1) {
      merged[matchIndex].quantity += localItem.quantity;
    } else {
      merged.push(localItem);
    }
  });

  return merged;
}

export function cleanCartItems(cartItems: CartItem[]): CartItem[] {
  return cartItems.filter((item) => item.quantity > 0);
}

// Updated validateForm to return { isValid, errors } with errors as Record<string, boolean>
export function validateForm(
  shippingInfo: any
): { isValid: boolean; errors: Record<string, boolean> } {
  const errors: Record<string, boolean> = {};
  let isValid = true;

  if (!shippingInfo.name) {
    errors.name = true;
    isValid = false;
  }
  if (!shippingInfo.address) {
    errors.address = true;
    isValid = false;
  }
  if (!shippingInfo.city) {
    errors.city = true;
    isValid = false;
  }
  // Accept either department or state, depending on field naming in shippingInfo
  if (!shippingInfo.department && !shippingInfo.state) {
    errors.state = true;
    isValid = false;
  }
  // Accept either postalCode or zipCode
  if (!shippingInfo.postalCode) {
    errors.postalCode = true;
    isValid = false;
  }
  if (!shippingInfo.phone) {
    errors.phone = true;
    isValid = false;
  }
  if (!shippingInfo.email) {
    errors.email = true;
    isValid = false;
  }

  return { isValid, errors };
}

export async function saveCartToFirebase(email: string, cartItems: CartItem[]): Promise<void> {
  if (!email || !Array.isArray(cartItems)) {
    console.error("❌ No se pudo guardar el carrito: email o cartItems inválidos.");
    return;
  }

  try {
    const cartRef = doc(collection(db, "carts"), email);
    await setDoc(cartRef, { cartItems, updatedAt: new Date().toISOString() });
    console.log("✅ Carrito guardado en Firestore para:", email);
  } catch (error) {
    console.error("❌ Error al guardar el carrito en Firestore:", error);
  }
}