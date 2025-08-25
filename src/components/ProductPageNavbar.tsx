// src/components/ProductPageNavbar.tsx

import { Link } from "react-router-dom";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useState } from "react";
import logo from "/logo2.png";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductPageNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { items } = useCart();
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md text-black border-b border-gray-200 fixed top-0 w-full z-50 shadow-md py-0.5">
        {/* Mobile */}
        <div className="flex sm:hidden items-center justify-between px-4 py-0.5">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Tu Casaca Deportiva"
              className="max-h-[2.25rem] w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/59891219083"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:opacity-70"
            >
              <FaWhatsapp className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/tucasacadeportiva.uy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:opacity-70"
              aria-label="Instagram Tu Casaca Deportiva"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
            <Link to="/carrito" className="relative text-black hover:opacity-70">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="text-black hover:opacity-70"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="sm:hidden px-4 pb-2">
            <nav className="flex flex-col gap-2 text-sm items-center text-center">
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-black hover:opacity-70 font-semibold">
                Tienda
              </Link>
            </nav>
          </div>
        )}

        {/* Desktop */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-4 py-1 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Tu Casaca Deportiva"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6 text-base">
            <Link to="/shop" className="text-black hover:opacity-70 font-semibold">Tienda</Link>
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/59891219083"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:opacity-70"
            >
              <FaWhatsapp className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/tucasacadeportiva.uy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:opacity-70"
              aria-label="Instagram Tu Casaca Deportiva"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
            <Link to="/carrito" className="relative text-black hover:opacity-70">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}