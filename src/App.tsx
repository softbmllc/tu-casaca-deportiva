// src/App.tsx

import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import LayoutRoutes from "./components/LayoutRoutes";
import Hero from "./components/Hero";
import { Helmet } from "react-helmet-async";
import CategorySection from "./components/CategorySection";
import Footer from "./components/Footer";
import AboutPreview from "./components/AboutPreview";
import ProductPage from "./pages/ProductPage";
// import FootballPage from "./pages/FootballPage";
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
// import FailurePage from "./pages/FailurePage";
// import PendingPage from "./pages/PendingPage";
import AdminPanel from "./pages/AdminPanel";
import AboutPage from "./pages/AboutPage";
import LoginForm from "./components/LoginForm";
import RequireAuth from "./components/RequireAuth";
import AdminCategoryManager from "./components/admin/AdminCategoryManager"; // ✅ NUEVO componente oficial
import OrderAdmin from "./components/admin/OrderAdmin";
import ClientDetail from "./components/admin/ClientDetail";
import Shop from "./pages/Shop";


function ClientDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  const clientId = id || "";

  return <ClientDetail clientId={clientId} onBack={() => navigate("/admin")} />;
}

function Home() {
  return (
    <>
      <Helmet>
        <title>Tu Casaca Deportiva — Camisetas de Fútbol y NBA</title>
        <meta name="description" content="Tienda online de camisetas de Fútbol y NBA (25/26 y retro). Diseño moderno, detalles premium y opción de personalización." />
        <meta property="og:title" content="Tu Casaca Deportiva — Camisetas de Fútbol y NBA" />
        <meta property="og:description" content="Explorá camisetas actuales y retro de tus equipos y selecciones favoritas. Stock, talles y personalización." />
        <meta property="og:image" content="/seo-image.jpg" />
        <meta property="og:url" content="https://tucasacadeportiva.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Tu Casaca Deportiva" />
        <link rel="canonical" href="https://tucasacadeportiva.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tu Casaca Deportiva — Camisetas de Fútbol y NBA" />
        <meta name="twitter:description" content="Tienda online de camisetas de Fútbol y NBA (25/26 y retro). Personalización disponible." />
        <meta name="twitter:image" content="/seo-image.jpg" />
      </Helmet>
      <Hero />
      <CategorySection />
      <AboutPreview />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="bg-[#0F0F0F] min-h-screen flex flex-col">
          <Helmet>
            <title>Tu Casaca Deportiva — Camisetas de Fútbol y NBA</title>
            <meta name="description" content="Tu Casaca Deportiva es tu tienda online de camisetas de Fútbol y NBA (temporada 25/26 y retro). Diseño Nike‑like, opciones de personalización y envíos." />
            <meta property="og:site_name" content="Tu Casaca Deportiva" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="Tu Casaca Deportiva — Camisetas de Fútbol y NBA" />
            <meta property="og:description" content="Explorá camisetas actuales y retro, stock por talle y personalización con nombre y número." />
            <meta property="og:image" content="/seo-image.jpg" />
            <meta property="og:url" content="https://tucasacadeportiva.com/" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Tu Casaca Deportiva — Camisetas de Fútbol y NBA" />
            <meta name="twitter:description" content="Tienda de camisetas de Fútbol y NBA (25/26 y retro). Personalización disponible." />
            <meta name="twitter:image" content="/seo-image.jpg" />
            <link rel="canonical" href="https://tucasacadeportiva.com/" />
          </Helmet>
          <Routes>
            {/* ✅ Login público */}
            <Route path="/login" element={<LoginForm />} />

            {/* ✅ Ruta protegida directa al administrador de categorías */}
            <Route
              path="/admin/categorias"
              element={
                <RequireAuth>
                  <AdminCategoryManager />
                </RequireAuth>
              }
            />

            {/* ✅ Detalle de cliente en administración */}
            <Route
              path="/admin/clientes/:id"
              element={
                <RequireAuth>
                  <ClientDetailWrapper />
                </RequireAuth>
              }
            />

            {/* ✅ Panel completo de administración */}
            <Route path="/admin/*" element={<RequireAuth><AdminPanel /></RequireAuth>} />

            {/* ✅ Ruta pública sin layout */}
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* ✅ Ruta pública sin layout */}
            <Route path="/producto/:slug" element={<ProductPage />} />

            {/* ✅ Layout general para todas las rutas públicas */}
            <Route element={<LayoutRoutes />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<CategorySection />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/shop" element={<Shop />} />
            </Route>

            {/* ✅ Fallback 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}