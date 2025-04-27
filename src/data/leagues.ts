//src/data/leages/ts
import { PremierLeagueProducts } from "./PremierLeague";
import { LaLigaProducts } from "./LaLiga";
import { SerieAProducts } from "./SerieA";
import { BundesligaProducts } from "./Bundesliga";
import { SeleccionesProducts } from "./Selecciones";
import { UruguayProducts } from "./Uruguay";
import { RetroProducts } from "./Retro";

// Leagues list - actualizado

export const leagues = [
  ...PremierLeagueProducts,
  ...LaLigaProducts,
  ...SerieAProducts,
  ...BundesligaProducts,
  ...SeleccionesProducts,
  ...UruguayProducts,
  ...RetroProducts,
];