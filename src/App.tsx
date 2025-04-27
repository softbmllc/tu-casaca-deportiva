// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LayoutRoutes from "./components/LayoutRoutes";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import PromoSlider from "./components/PromoSlider";
import InstagramFeed from "./components/InstagramFeed";
import ProductPage from "./pages/ProductPage";
import FootballPage from "./pages/FootballPage";
import NBAPage from "./pages/NBAPage"; // ✅ Import agregado
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
import FailurePage from "./pages/FailurePage";
import PendingPage from "./pages/PendingPage";
import AdminPanel from "./pages/AdminPanel";
import LoginForm from "./components/LoginForm";
import RequireAuth from "./components/RequireAuth";
import EditProduct from "./pages/EditProduct";

function Home() {
  return (
    <>
      <Hero />
      <CategorySection />
      <PromoSlider />
      <InstagramFeed />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ✅ Login público */}
      <Route path="/login" element={<LoginForm />} />

      {/* ✅ Rutas protegidas */}
      <Route path="/admin/*" element={<RequireAuth><AdminPanel /></RequireAuth>} />
      <Route path="/admin/editar/:id" element={<RequireAuth><EditProduct /></RequireAuth>} />

      {/* ✅ Rutas independientes (no pasan por Layout) */}
      <Route path="/futbol" element={<FootballPage />} />
      <Route path="/nba" element={<NBAPage />} /> {/* ✅ Ruta NBA agregada */}
      <Route path="/carrito" element={<CartPage />} />

      {/* ✅ Rutas con Layout */}
      <Route path="/" element={<LayoutRoutes />}>
        <Route index element={<Home />} />
        <Route path="producto/:id" element={<ProductPage />} />
        <Route path="success" element={<SuccessPage />} />
        <Route path="failure" element={<FailurePage />} />
        <Route path="pending" element={<PendingPage />} />
      </Route>

      {/* ✅ Ruta fallback (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}