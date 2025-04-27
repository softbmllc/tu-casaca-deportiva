// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast"; // ✅ importamos Toaster

import "./index.css";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster position="top-center" reverseOrder={false} /> {/* ✅ activamos Toaster */}
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </HelmetProvider>
  </React.StrictMode>
);