// src.utils/seo.ts

type Locale = 'es' | 'en';

interface SeoData {
  title: string;
  description: string;
}

export function getSeoData(pathname: string, locale: Locale): SeoData {
  const translations: Record<Locale, Record<string, SeoData>> = {
    es: {
      home: {
        title: 'Bionova – Suplementos premium para tu bienestar en EE.UU.',
        description: 'Tienda online de suplementos de alta calidad: Fuxion, Pure Encapsulations y Double Wood. Envío a todo EE.UU. Compra segura con PayPal y Stripe.',
      },
    },
    en: {
      home: {
        title: 'Bionova – Premium supplements for your wellness in the US',
        description: 'Online store for high-quality supplements: Fuxion, Pure Encapsulations and Double Wood. Fast shipping across the US. Pay securely with PayPal and Stripe.',
      },
    },
  };

  // Normalizamos el pathname (ej. "/" se convierte a "home")
  const routeKey = pathname === '/' ? 'home' : 'home'; // Placeholder por ahora

  const seo = translations[locale]?.[routeKey];

  return (
    seo || {
      title: locale === 'es' ? 'Bionova – Suplementos de calidad' : 'Bionova – Quality Supplements',
      description:
        locale === 'es'
          ? 'Suplementos premium para tu salud y bienestar.'
          : 'Premium supplements for your health and wellness.',
    }
  );
}