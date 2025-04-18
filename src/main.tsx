import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import App from "./App";
import FootballPage from "./pages/FootballPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
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
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </HelmetProvider>
  </React.StrictMode>
);