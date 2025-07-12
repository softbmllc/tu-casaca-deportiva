// src/utils/seo.ts

import { SITE_CONFIG } from '../config/siteConfig';

type Locale = 'es' | 'en';

interface SeoData {
  title: string;
  description: string;
}

export function getSeoData(pathname: string, locale: Locale): SeoData {
  const translations: Record<Locale, Record<string, SeoData>> = {
    es: {
      home: {
        title: SITE_CONFIG.metaTitle,
        description: SITE_CONFIG.metaDescription,
      },
    },
    en: {
      home: {
        title: SITE_CONFIG.metaTitle,
        description: SITE_CONFIG.metaDescription,
      },
    },
  };

  const routeKey = pathname === '/' ? 'home' : 'home'; // Placeholder

  const seo = translations[locale]?.[routeKey];

  return (
    seo || {
      title: SITE_CONFIG.metaTitle,
      description: SITE_CONFIG.metaDescription,
    }
  );
}