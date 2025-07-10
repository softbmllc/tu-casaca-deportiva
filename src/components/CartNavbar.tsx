//src/components/CartNavbar.tsx

import { Link } from "react-router-dom";
import { FaGlobe } from "react-icons/fa";
import i18n from "..";
import { useTranslation } from "react-i18next";
import logo from "/logo.png";
import { useState } from "react";

export default function CartNavbar() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/50 backdrop-blur-md text-black fixed top-0 w-full z-50 shadow-sm py-0.5">
      {/* Mobile */}
      <div className="flex sm:hidden items-center justify-between px-4 py-0.5">
        <Link to="/shop" className="flex items-center">
          <img
            src={logo}
            alt="Bionova"
            className="max-h-[2.25rem] w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FaGlobe className="text-[#004AAD] w-4 h-4" />
            <button onClick={() => i18n.changeLanguage('es')} className={`text-xs px-1 py-0.5 ${i18n.language === 'es' ? 'font-semibold text-[#004AAD]' : 'text-[#004AAD]'}`}>ES</button>
            <button onClick={() => i18n.changeLanguage('en')} className={`text-xs px-1 py-0.5 ${i18n.language === 'en' ? 'font-semibold text-[#004AAD]' : 'text-[#004AAD]'}`}>EN</button>
          </div>
          <button
            className="text-[#004AAD]"
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
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-[#004AAD] font-semibold">
              {t("nav.shop", "Tienda")}
            </Link>
          </nav>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden sm:flex max-w-7xl mx-auto px-4 py-1 items-center justify-between">
        <Link to="/shop" className="flex items-center">
          <img
            src={logo}
            alt="Bionova"
            className="h-12 w-auto object-contain"
          />
        </Link>
        <nav className="flex items-center gap-6 text-base">
          <Link to="/shop" className="text-[#004AAD] hover:text-[#003B85] font-semibold">{t("nav.shop", "Tienda")}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FaGlobe className="text-[#004AAD] w-4 h-4" />
            <button onClick={() => i18n.changeLanguage('es')} className={`text-sm px-2 py-0.5 ${i18n.language === 'es' ? 'font-semibold text-[#004AAD]' : 'text-[#004AAD]'}`}>ES</button>
            <button onClick={() => i18n.changeLanguage('en')} className={`text-sm px-2 py-0.5 ${i18n.language === 'en' ? 'font-semibold text-[#004AAD]' : 'text-[#004AAD]'}`}>EN</button>
          </div>
        </div>
      </div>
    </header>
  );
}