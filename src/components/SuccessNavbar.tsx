// src/components/SUccessNavbar.tsx

import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import i18n from "..";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import logo from "/logo.png";

export default function ShopNavbar() {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <header className="bg-white/50 backdrop-blur-md text-black fixed top-0 w-full z-50 shadow-sm py-0.5">
      {/* Mobile */}
      <div className="flex sm:hidden items-center justify-between px-4 py-0.5">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)}>
            <FaSearch className="text-black w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Tu Casaca Deportiva"
              className="max-h-[2.25rem] w-auto object-contain"
            />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FaGlobe className="text-black w-4 h-4" />
            <button onClick={() => i18n.changeLanguage('es')} className={`text-xs px-1 py-0.5 ${i18n.language === 'es' ? 'font-semibold text-black' : 'text-black'}`}>ES</button>
            <button onClick={() => i18n.changeLanguage('en')} className={`text-xs px-1 py-0.5 ${i18n.language === 'en' ? 'font-semibold text-black' : 'text-black'}`}>EN</button>
          </div>
          <Link to="/carrito" className="relative text-black">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Input in Mobile */}
      {showSearch && (
        <div className="sm:hidden px-4 pb-1">
          <input
            type="text"
            placeholder={t("search.placeholder", "Buscar productos...")}
            className="w-full border border-black/60 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            autoFocus
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              window.dispatchEvent(new CustomEvent("mobileSearch", { detail: value }));
            }}
          />
        </div>
      )}

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="sm:hidden px-4 pb-2">
          <nav className="flex flex-col gap-2 text-sm items-center text-center">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-black font-semibold hover:opacity-70">
              {t("nav.home", "Inicio")}
            </Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-black font-semibold hover:opacity-70">
              {t("nav.shop", "Tienda")}
            </Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-black font-semibold hover:opacity-70">
              {t("nav.about", "Nosotros")}
            </Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-black font-semibold hover:opacity-70">
              {t("nav.contact", "Contacto")}
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
          <Link to="/" className="text-black hover:opacity-70 font-semibold">{t("nav.home", "Inicio")}</Link>
          <Link to="/shop" className="text-black hover:opacity-70 font-semibold">{t("nav.shop", "Tienda")}</Link>
          <Link to="/about" className="text-black hover:opacity-70 font-semibold">{t("nav.about", "Nosotros")}</Link>
          <Link to="/contact" className="text-black hover:opacity-70 font-semibold">{t("nav.contact", "Contacto")}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FaGlobe className="text-black w-4 h-4" />
            <button onClick={() => i18n.changeLanguage('es')} className={`text-sm px-2 py-0.5 ${i18n.language === 'es' ? 'font-semibold text-black' : 'text-black'}`}>ES</button>
            <button onClick={() => i18n.changeLanguage('en')} className={`text-sm px-2 py-0.5 ${i18n.language === 'en' ? 'font-semibold text-black' : 'text-black'}`}>EN</button>
          </div>
          <Link to="/carrito" className="relative text-black">
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
  );
}