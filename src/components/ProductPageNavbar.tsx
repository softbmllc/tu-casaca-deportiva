// src/components/ProductPageNavbar.tsx

import { Link } from "react-router-dom";
import { FaSearch, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useState } from "react";
import logo from "/logo2.png";

export default function ProductPageNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const event = new CustomEvent("mobileSearch", { detail: e.target.value });
    window.dispatchEvent(event);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md text-black border-b border-gray-200 fixed top-0 w-full z-50 shadow-md py-0.5">
        {/* Mobile */}
        <div className="flex sm:hidden items-center justify-between px-4 py-0.5">
          <button
            className="text-[#FF2D55]"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle Search"
          >
            <FaSearch className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Mutter Games"
              className="max-h-[2.25rem] w-auto object-contain"
            />
          </Link>
          <button
            className="text-[#FF2D55]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Search Input */}
        {showSearch && (
          <div className="sm:hidden px-4 pb-2">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-[#FF2D55]"
              onChange={handleSearchChange}
              autoFocus
            />
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="sm:hidden px-4 pb-2">
            <nav className="flex flex-col gap-2 text-sm items-center text-center">
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-[#FF2D55] font-semibold">
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
              alt="Mutter Games"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6 text-base">
            <Link to="/shop" className="text-[#FF2D55] hover:text-[#cc2444] font-semibold">Tienda</Link>
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/59899389140"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF2D55]"
            >
              <FaWhatsapp className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/muttergames/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF2D55]"
              aria-label="Instagram Mutter Games"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>
    </>
  );
}