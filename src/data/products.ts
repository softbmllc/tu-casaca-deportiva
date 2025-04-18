// src/data/products.ts
import PremierLeague from "./PremierLeague";
import LaLiga from "./LaLiga";
import SerieA from "./SerieA";
import Bundesliga from "./Bundesliga";
import Selecciones from "./Selecciones";
import Retro from "./Retro";
import Uruguay from "./Uruguay";
import stockProducts from "./stock"; // ✅ Ahora sí lo usamos

import { Product } from "./types";

// Todos los productos de catálogo
const allProducts: Product[] = [
  ...PremierLeague,
  ...LaLiga,
  ...SerieA,
  ...Bundesliga,
  ...Selecciones,
  ...Retro,
  ...Uruguay,
];

// Productos combinados sin duplicados (el stock manda)
const mergedProducts: Product[] = [
  ...stockProducts,
  ...allProducts.filter(
    (p) => !stockProducts.some((sp: Product) => sp.slug === p.slug)
  ),
];

export default mergedProducts;