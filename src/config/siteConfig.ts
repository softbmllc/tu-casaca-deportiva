// src/config/siteConfig.ts
export const SITE_CONFIG = {
  brandName: "Tu Casaca Deportiva",
  shortName: "TCD",
  domain: "https://tucasacadeportiva.com",
  vercelUrl: "https://tu-casaca-deportiva.vercel.app/",

  // Assets
  logoPath: "/logo-tcd.svg", // coloca tu svg en /public/logo-tcd.svg
  ogImage: "/og-image.jpg",
  favicon: "/favicon.ico",

  // Meta
  metaTitle: "Tu Casaca Deportiva | Camisetas de fútbol y básquet 24/25",
  metaDescription:
    "Camisetas 24/25. Diseño moderno, detalles premium y opción de personalización con nombre y número.",

  // Brand
  colors: {
    black: "#0F0F0F",
    white: "#F9FAFB",
    accent: "#22D3EE", // celeste
    accent2: "#22C55E", // verde opcional
  },

  // Social
  social: {
    instagram: "https://instagram.com/tucasacadeportiva.uy",
    whatsapp: "", // agrega si quieres deep link
  },

  // i18n
  languages: ["es"],
  defaultLanguage: "es",
};