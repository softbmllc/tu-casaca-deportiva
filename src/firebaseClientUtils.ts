// src/firebaseClientUtils.ts

import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // Asegúrate que este archivo inicializa correctamente Firebase (cliente)
import { Product, Category } from "./data/types";

// Función para obtener productos
export const fetchProducts = async (): Promise<Product[]> => {
  const productsSnapshot = await getDocs(collection(db, "products"));
  return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

// Función para obtener una categoría por ID
export const fetchCategoryById = async (id: string): Promise<Category | null> => {
  const docRef = doc(db, "categories", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Category) : null;
};


// Función para obtener un producto por slug
export const fetchProductById = async (slug: string): Promise<Product | null> => {
  const productsSnapshot = await getDocs(collection(db, "products"));
  const product = productsSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Product))
    .find(p => p.slug === slug);
  return product || null;
};