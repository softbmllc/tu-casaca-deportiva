// src/components/Layout.tsx
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Rocket } from "lucide-react";
import Footer from "./Footer";
import logo from "/logo.jpg";
import { FaInstagram } from "react-icons/fa";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { items } = useCart();
  const location = useLocation();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const isProductPage = location.pathname.startsWith("/producto/");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Solo ocultamos el HEADER si es página de producto */}
      {!isProductPage && (
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
              <Link to="/futbol" className="hover:text-gray-300 font-semibold transition-colors">Fútbol</Link>
              <Link to="/nba" className="hover:text-gray-300 font-semibold transition-colors">NBA</Link>
              <Link
                to="/futbol#stock-express"
                className="flex items-center gap-1 bg-black px-3 py-1 rounded-full text-white hover:bg-white hover:text-black transition-all font-semibold"
              >
                <Rocket className="w-4 h-4 text-red-500" />
                <span>Stock</span>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  Express
                </span>
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/tucasacadeportiva.uy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <Link to="/carrito" className="relative hover:text-gray-300 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow">{children}</main>

      {/* El Footer siempre se muestra */}
      <Footer />
    </div>
  );
}