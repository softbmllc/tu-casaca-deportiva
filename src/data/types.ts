// src/data/types.ts

export type Product = {
  id: number;
  name: string;
  title: string;
  priceUSD: number;
  priceUYU: number;
  usdPrice?: number; // Compatibilidad para productos guardados desde el admin
  uyuPrice?: number; // Compatibilidad para productos guardados desde el admin
  slug: string;
  subtitle?: string;
  image?: string;
  images: string[];
  sizes: string[];
  category: string;
  league: string;
  team: string;
  descriptionTop?: string;
  descriptionBottom?: string;
  active?: boolean;
  stock?: {
    [size: string]: number;
  };
  customName?: string;
  customNumber?: string;
};

// ✅ Tipo para items del carrito
export type CartItem = {
  id: number;
  slug: string;
  name: string;
  image: string;
  priceUSD: number;
  priceUYU: number;
  quantity: number;
  size: string;
  customName?: string;
  customNumber?: string;
};

// ✅ Tipo de usuario autenticado
export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
};