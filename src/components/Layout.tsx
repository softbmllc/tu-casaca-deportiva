import { Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { items } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 text-white shadow-md backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-lg tracking-tight">
              Tu Casaca Deportiva
            </span>
          </Link>
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li><Link to="/" className="hover:text-gray-300">Inicio</Link></li>
            <li><Link to="/futbol" className="hover:text-gray-300">Fútbol</Link></li>
            <li><Link to="/basquet" className="hover:text-gray-300">Básquet</Link></li>
            <li><Link to="/contacto" className="hover:text-gray-300">Contacto</Link></li>
            <li className="relative">
              <Link to="/carrito" className="hover:text-gray-300 flex items-center">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="pt-20">{children}</main>
    </>
  );
}