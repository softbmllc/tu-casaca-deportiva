//src/hooks/useCategories.ts

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseRef = collection(db, "categories");
        let snap;
        try {
          snap = await getDocs(query(baseRef, where("enabled", "==", true), orderBy("order", "asc")));
        } catch (err) {
          console.warn("Falling back to plain getDocs for categories", err);
          snap = await getDocs(baseRef);
        }
        const data = snap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
          .filter((c) => !!c.name) as Category[];
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}

export function useSubcategories() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "subcategories"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Subcategory[];
        setSubcategories(data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, []);

  return { subcategories, loading };
}