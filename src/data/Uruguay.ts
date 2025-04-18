// src/data/Uruguay.ts
import { Product } from "./types";

const Uruguay: Product[] = [
  {
    id: 7001,
    name: "Nacional local 24/25",
    priceUSD: 52,
    priceUYU: 2290,
    image: "/images/uruguay/nacional-home-24-25.jpg",
    images: ["/images/uruguay/nacional-home-24-25.jpg"],
    subtitle: "Camiseta oficial temporada 24/25",
    slug: "nacional-local-24-25",
    sizes: ["S", "M", "L", "XL"],
    category: "Fútbol",
    league: "Uruguay",
    team: "Nacional",
  },
  {
    id: 7002,
    name: "Peñarol 24/25",
    priceUSD: 52,
    priceUYU: 2290,
    image: "/images/uruguay/penarol-home-24-25.jpg",
    images: ["/images/uruguay/penarol-home-24-25.jpg"],
    subtitle: "Camiseta oficial temporada 24/25",
    slug: "penarol-24-25",
    sizes: ["S", "M", "L", "XL"],
    category: "Fútbol",
    league: "Uruguay",
    team: "Peñarol",
  },
];

export default Uruguay;