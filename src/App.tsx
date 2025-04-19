// src/App.tsx
import Layout from "./components/Layout";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import InstagramFeed from "./components/InstagramFeed";
import { Routes, Route } from "react-router-dom";
import ProductPage from "./pages/ProductPage";
import FootballPage from "./pages/FootballPage";
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
import FailurePage from "./pages/FailurePage";
import PendingPage from "./pages/PendingPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <CategorySection />
              <InstagramFeed />
            </>
          }
        />
        <Route path="/futbol" element={<FootballPage />} />
        <Route path="/producto/:id" element={<ProductPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/failure" element={<FailurePage />} />
        <Route path="/pending" element={<PendingPage />} />
      </Routes>
    </Layout>
  );
}