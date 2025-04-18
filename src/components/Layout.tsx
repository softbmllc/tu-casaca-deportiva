// src/components/Layout.tsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="bg-black text-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-10 h-10 object-contain rounded"
            />
            <span className="font-bold text-lg">Tu Casaca Deportiva</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/" className="hover:underline text-sm">Inicio</Link>
            <Link to="/futbol" className="hover:underline text-sm">Fútbol</Link>
            <Link to="/basquet" className="hover:underline text-sm">Básquet</Link>
            <Link to="/contacto" className="hover:underline text-sm">Contacto</Link>
            <Link to="/carrito" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </>
  );
}