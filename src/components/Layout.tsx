// src/components/Layout.tsx
import { ReactNode } from "react";
import CartIcon from "./CartIcon";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="bg-black text-white py-4 px-6 shadow-md relative z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between relative">
          <h1 className="text-2xl font-bold tracking-tight">
            Tu Casaca Deportiva
          </h1>

          <div className="flex items-center gap-6">
            <nav className="space-x-4 text-sm">
              <a href="/" className="hover:text-green-400 transition">
                Inicio
              </a>
              <a href="/futbol" className="hover:text-green-400 transition">
                Fútbol
              </a>
              <a href="#" className="hover:text-green-400 transition">
                Básquet
              </a>
              <a href="#" className="hover:text-green-400 transition">
                Contacto
              </a>
            </nav>

            {/* 🛒 Cart Icon (header variant) */}
            <div className="relative">
              <CartIcon variant="header" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-100 text-center text-sm py-4 mt-12">
        © {new Date().getFullYear()} Tu Casaca Deportiva. Todos los derechos reservados.
      </footer>
    </div>
  );
}