//src/utils/productUtils.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export const getProductById = async (id: string) => {
  try {
    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};