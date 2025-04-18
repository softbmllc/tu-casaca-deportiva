// src/data/types.ts

export type Product = {
  id: number;
  name: string;
  priceUSD: number;
  priceUYU: number;
  slug: string;
  subtitle: string;
  image: string;
  images: string[];
  sizes: string[];
  category: string;
  league: string;
  team: string;
  customName?: string;
  customNumber?: string;
  stock?: {
    [size: string]: number;
  };
};

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
  customNumber?: string; // 👈 ahora coincide con Product
};