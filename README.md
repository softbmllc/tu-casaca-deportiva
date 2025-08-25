# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Tu Casaca Deportiva (TCD)

E‑commerce de **casacas de Fútbol y NBA** (temporada 25/26 y retro) construido con **React + Vite + TypeScript + Tailwind + Firebase** y deploy en **Vercel**. Imágenes en **ImageKit**. Pagos con **Mercado Pago** (prod pendiente de credenciales reales).

> **Filosofía**: Sin parches. Código limpio, escalable y mantenible. Branding sobrio (Nike‑like), UX rápida, y foco en performance.

---

## 🌱 Estado actual (frontend público)
- Base traída de Mutter Games y **aislada 100%**: nuevo repo, nuevo proyecto en Vercel y nuevas ENV.
- **Branding TCD** aplicado: navbars, tipografías, paleta, index.html (SEO / OG).
- **Hero** con slides (Fútbol / NBA / Niños) y **CategorySection** → `/shop?filter=...`.
- **ProductPage**:
  - Botón agregar al carrito (estilo TCD).
  - **Disclaimer legal** debajo del CTA.
  - Eliminado bloque de MercadoLibre.
- **Cart**: estilos TCD; botón “Explorar productos” y textos actualizados.

> Próximo hilo: **Admin + Firebase** (catálogo, stock, clientes, pedidos; subida de imágenes a ImageKit; checkout real con MP).

---

## 🧩 Stack
- **React 18**, **Vite**, **TypeScript**, **TailwindCSS**
- **Firebase** (Auth, Firestore, Storage)
- **ImageKit** (media CDN / uploads)
- **Vercel** (hosting)
- **Mercado Pago** (Checkout Pro – pendiente credenciales prod)

---

## 🗂️ Estructura relevante
```
src/
  components/
    cart/EmptyCart.tsx
    Header.tsx, Footer.tsx, Navbar*.tsx, CartNavbar.tsx, CheckoutNavbar.tsx, SuccessNavbar.tsx
    Hero.tsx, CategorySection.tsx, AboutPreview.tsx, Logo.tsx, Seo.tsx
  config/siteConfig.ts
  pages/
    ProductPage.tsx, CartPage.tsx, ShopPage.tsx (según proyecto)
  firebaseConfig.ts
public/
  logo.png, logo2.png, og-image.jpg
  images/categories/{futbol.jpg,nba.jpg,kids.jpg}
```

---

## 🔧 Variables de entorno
Crear `.env.local` (no commitear) y cargar lo mismo en Vercel → Project → Environment Variables.

```
# Firebase (TCD)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# ImageKit (TCD)
VITE_IMAGEKIT_PUBLIC_KEY=
VITE_IMAGEKIT_URL_ENDPOINT=

# Mercado Pago (cliente)
VITE_MERCADO_PAGO_PUBLIC_KEY=

# Server only (Vercel)
MP_ACCESS_TOKEN=
IMAGEKIT_PRIVATE_KEY=
```

> `firebaseConfig.ts` **solo** lee de `import.meta.env`. No hay claves hardcodeadas.

---

## ▶️ Scripts
```
npm i
npm run dev     # http://localhost:5173
npm run build
npm run preview
```

---

## 🚀 Deploy
1. Repo nuevo en GitHub (`tu-casaca-deportiva`).
2. Vercel → New Project → conectar repo → setear ENV.
3. Dominios: `tucasacadeportiva.com` al proyecto **TCD** (no al de Mutter).

---

## 🖼️ Branding & UI
- Paleta: `black #0F0F0F`, `white #F9FAFB`, acento sobrio (`#22D3EE` o `#22C55E` en pequeños detalles).
- Tipografías: **Oswald** (títulos), **Inter** (texto).
- Navbars: 
  - Oscuro → logo `logo.png`
  - Claro → logo `logo2.png`
- Hero: 3 slides (Fútbol / NBA / Niños). Fondos conceptuales; productos reales en fichas.

---

## ⚖️ Transparencia legal
**ProductPage** incluye aviso debajo del CTA:

> *Todos nuestros productos importados de China cumplen con las normativas legales locales. Garantizamos una compra segura y transparente, gestionando los impuestos y aranceles conforme a la ley de cada país.*

(Se puede repetir en otras secciones si es necesario.)

---

## 🗺️ Roadmap próximo (Admin + Datos)
- **Admin** (acceso privado):
  - Crear/editar/eliminar productos (título, liga/equipo, precio, variantes/talles, stock real).
  - Subida de imágenes a **ImageKit** (unsigned → guardar URL).
  - Estados de publicación (activo/inactivo) + visibilidad en tienda.
- **Stock**: control por variante/talle; descuento en cada venta.
- **Pedidos**: guardar orden; estados; impresión de etiqueta 6×4.
- **Clientes**: registro/login; dirección; historial de compras.
- **Checkout real**: MP (prod) y validaciones.

---

## 🧭 Criterios de trabajo
- Entender objetivo → plan en pasos → identificar archivos → ejecutar sin contradicciones.
- Detenerse si el enfoque está poco claro.
- Proponer mejoras visuales/estructurales con criterio de **branding** y **rendimiento**.

---

## Notas
- Este repo reemplaza referencias de Mutter (textos/rutas/colores) por TCD.
- Si se detectan restos de `mutter`/rosa `#FF2D55`, abrir PR para limpieza.
