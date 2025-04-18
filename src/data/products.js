// src/data/products.ts
import PremierLeague from "./PremierLeague";
import LaLiga from "./LaLiga";
import SerieA from "./SerieA";
import Bundesliga from "./Bundesliga";
import Selecciones from "./Selecciones";
import Retro from "./Retro";
import Uruguay from "./Uruguay";
import stockProducts from "./stock"; // ✅ Ahora sí lo usamos
// Todos los productos de catálogo
const allProducts = [
    ...PremierLeague,
    ...LaLiga,
    ...SerieA,
    ...Bundesliga,
    ...Selecciones,
    ...Retro,
    ...Uruguay,
];
// Productos combinados sin duplicados (el stock manda)
const mergedProducts = [
    ...stockProducts,
    ...allProducts.filter((p) => !stockProducts.some((sp) => sp.slug === p.slug)),
];
export default mergedProducts;
