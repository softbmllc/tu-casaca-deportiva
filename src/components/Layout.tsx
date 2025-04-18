import { Link } from "react-router-dom";
import CartIcon from "./CartIcon";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="Tu Casaca Deportiva"
              className="h-10 w-auto"
            />
            <span className="text-lg font-semibold tracking-tight hidden sm:block">
              Tu Casaca Deportiva
            </span>
          </Link>

          {/* Navegación */}
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="hover:text-gray-800">Inicio</Link>
            <Link to="/futbol" className="hover:text-gray-800">Fútbol</Link>
            <Link to="/basquet" className="hover:text-gray-800">Básquet</Link>
            <Link to="/contacto" className="hover:text-gray-800">Contacto</Link>
          </nav>

          {/* Carrito */}
          <Link to="/carrito" className="relative ml-4">
            <CartIcon />
          </Link>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm py-4">
        © {new Date().getFullYear()} Tu Casaca Deportiva. Todos los derechos reservados.
      </footer>
    </div>
  );
}