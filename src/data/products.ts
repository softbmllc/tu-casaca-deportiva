// src/data/products.ts
import PremierLeague from "./PremierLeague";
import LaLiga from "./LaLiga";
import SerieA from "./SerieA";
import Bundesliga from "./Bundesliga";
import Selecciones from "./Selecciones";
import Retro from "./Retro";
import Uruguay from "./Uruguay";
import stockProducts from "./stock";
import { Product } from "./types";

// Productos del catálogo sin tipar aún
const rawCatalog = [
  ...PremierLeague,
  ...LaLiga,
  ...SerieA,
  ...Bundesliga,
  ...Selecciones,
  ...Retro,
  ...Uruguay,
];

// Función que garantiza el retorno exacto de un Product
function createProduct(p: any, index: number): Product {
  return {
    id: typeof p.id === "number" ? p.id : 10000 + index,
    name: p.name || "",
    title: p.title || "",
    priceUSD: p.priceUSD ?? 0,
    priceUYU: p.priceUYU ?? 0,
    usdPrice: p.usdPrice ?? p.priceUSD ?? 0,
    uyuPrice: p.uyuPrice ?? p.priceUYU ?? 0,
    slug: p.slug || `producto-${10000 + index}`,
    subtitle: p.subtitle || "",
    image: p.image || "",
    images: p.images || [],
    sizes: p.sizes || ["S", "M", "L", "XL"],
    category: p.category || "FÚTBOL",
    league: p.league || "FÚTBOL",
    team: p.team || "",
    descriptionTop: p.descriptionTop || "",
    descriptionBottom: p.descriptionBottom || "",
    active: p.active ?? true,
    stock: p.stock || { S: 0, M: 0, L: 0, XL: 0 },
    customName: p.customName,
    customNumber: p.customNumber,
  };
}

const mergedProducts = [
  ...stockProducts,
  ...rawCatalog.map(createProduct),
] as Product[];

export default mergedProducts;