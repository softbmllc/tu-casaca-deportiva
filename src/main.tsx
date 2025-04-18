// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import App from "./App";
import FootballPage from "./pages/FootballPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
import FailurePage from "./pages/FailurePage";
import PendingPage from "./pages/PendingPage";
import { CartProvider } from "./context/CartContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/futbol" element={<FootballPage />} />
            <Route path="/producto/:id" element={<ProductPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/failure" element={<FailurePage />} />
            <Route path="/pending" element={<PendingPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </HelmetProvider>
  </React.StrictMode>
);