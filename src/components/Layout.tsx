// src/components/Layout.tsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";
import Footer from "./Footer"; // 👈 Importar el footer
import logo from "/logo.jpg";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black text-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Tu Casaca Deportiva"
              className="w-10 h-10 object-contain"
            />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base">
            <Link to="/" className="hover:underline">Inicio</Link>
            <Link to="/futbol" className="hover:underline">Fútbol</Link>
            <Link to="/basquet" className="hover:underline">NBA</Link>
            <Link to="/contacto" className="hover:underline">Contacto</Link>
          </nav>
          <Link to="/carrito" className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      {/* ✅ Footer global, se ve en todas las páginas */}
      <Footer />
    </div>
  );
}