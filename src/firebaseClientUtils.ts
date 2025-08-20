// src/firebaseClientUtils.ts

import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase"; // Asegúrate que este archivo inicializa correctamente Firebase (cliente)
import { Product, Category, Order, Client } from "./data/types";

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

// ===== Admin helpers =====
// Obtener clientes registrados (colección "usuarios").
// Si se pasa `search`, filtra por prefijo en el campo `name`.
export const fetchClients = async (search?: string): Promise<Client[]> => {
  const colRef = collection(db, "usuarios");
  let q = colRef as any;

  if (search && search.trim()) {
    const s = search.trim();
    q = query(colRef, where("name", ">=", s), where("name", "<=", s + "\uf8ff"));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Client, "id">) }));
};

// Obtener órdenes con filtros opcionales (status, uid) y ordenadas por `createdAt` desc.
export const fetchOrders = async (
  opts: { status?: string; uid?: string; limitN?: number } = {}
): Promise<Order[]> => {
  const colRef = collection(db, "orders");
  let q: any = query(colRef, orderBy("createdAt", "desc"));

  if (opts.status) {
    q = query(q, where("status", "==", opts.status));
  }
  if (opts.uid) {
    q = query(q, where("uid", "==", opts.uid));
  }
  if (opts.limitN) {
    q = query(q, limit(opts.limitN));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }));
};