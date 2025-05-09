// src/components/Layout.tsx
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Rocket } from "lucide-react";
import Footer from "./Footer";
import VideoShowcase from "./VideoShowcase";
import logo from "/logo.png";
import { FaInstagram } from "react-icons/fa";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { items } = useCart();
  const location = useLocation();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const isProductPage = location.pathname.startsWith("/producto/");

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-[#f7f7f7] text-white">
      {/* Solo ocultamos el HEADER si es página de producto */}
      {!isProductPage && (
        <header className="bg-neutral-950/80 backdrop-blur-md text-white fixed top-0 w-full z-50 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-4 sm:py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Tu Casaca Deportiva"
                className="w-10 h-10 object-contain"
              />
            </Link>
            <nav className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base">
            <Link to="/futbol?filter=FUTBOL" className="hover:text-gray-300 font-semibold transition-colors">
  Fútbol
</Link>
<Link to="/futbol?filter=NBA" className="hover:text-gray-300 font-semibold transition-colors">
  NBA
</Link>
            <Link
  to="/futbol?filter=FUTBOL&stock=true"
  className="flex items-center gap-1 px-3 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all text-white font-semibold"
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

      <main
        className={`flex-grow w-full ${
          location.pathname.startsWith("/producto/") ? "bg-[#f7f7f7]" : "bg-black"
        }`}
      >
        {children}
        {location.pathname === "/" && <VideoShowcase />}
      </main>

      {/* El Footer siempre se muestra */}
      <div className={location.pathname.startsWith("/producto/") ? "bg-[#f7f7f7] text-black" : "bg-black text-white"}>
        <Footer />
      </div>
    </div>
  );
}