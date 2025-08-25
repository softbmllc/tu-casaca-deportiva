//src/components/CartNavbar.tsx

import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import logo from "/logo2.png";

export default function CartNavbar() {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white text-black fixed top-0 w-full z-50 shadow-md border-b border-gray-200 py-0.5 backdrop-blur">
      {/* Mobile */}
      <div className="flex sm:hidden items-center justify-between px-4 py-0.5">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Tu Casaca Deportiva"
              className="max-h-[2.25rem] w-auto object-contain"
            />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/59891219083"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-80"
          >
            <FaWhatsapp className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com/tucasacadeportiva.uy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-80"
            aria-label="Instagram Tu Casaca Deportiva"
          >
            <FaInstagram className="w-5 h-5" />
          </a>
          <button
            className="text-black hover:opacity-80"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-black hover:opacity-80 font-semibold">
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
          <Link to="/shop" className="text-black hover:opacity-80 font-semibold">Tienda</Link>
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/59891219083"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-80"
          >
            <FaWhatsapp className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com/tucasacadeportiva.uy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-80"
            aria-label="Instagram Tu Casaca Deportiva"
          >
            <FaInstagram className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}