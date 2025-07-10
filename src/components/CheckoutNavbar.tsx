// src/components/CheckoutNavbar.tsx
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { FaGlobe } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import i18n from "..";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import logo from "/logo.png";

export default function ShopNavbar() {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white/50 backdrop-blur-md text-black fixed top-0 w-full z-[60] shadow-sm py-0.5">
      {/* Mobile */}
      <div className="flex sm:hidden items-center justify-between px-4 py-0.5 relative">
        <div className="flex items-center gap-2">
          <Link to="/shop" className="flex items-center">
            <img
              src={logo}
              alt="Bionova"
              className="max-h-[2.25rem] w-auto object-contain"
            />
          </Link>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center" ref={infoRef}>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-sm text-[#004AAD] font-semibold"
          >
            {t("checkoutNavbar.securePayment")}<span className="ml-1 text-xs">{showInfo ? "▲" : "▼"}</span>
          </button>
          {showInfo && (
            <div className="absolute top-full mt-1 w-64 sm:w-96 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded p-3 text-sm text-gray-700 shadow-lg z-50">
              {t("checkoutNavbar.tooltip")}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FaGlobe className="text-[#004AAD] w-4 h-4" />
            <button onClick={() => i18n.changeLanguage('es')} className={`text-xs px-1 py-0.5 ${i18n.language === 'es' ? 'font-semibold text-[#004AAD]' : 'text-[#004AAD]'}`}>ES</button>
            <button onClick={() => i18n.changeLanguage('en')} className={`text-xs px-1 py-0.5 ${i18n.language === 'en' ? 'font-semibold text-[#004AAD]' : 'text-[#004AAD]'}`}>EN</button>
          </div>
          <Link to="/carrito" className="relative text-[#004AAD]">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex max-w-7xl mx-auto px-4 py-1 items-center justify-between relative">
        <Link to="/shop" className="flex items-center">
          <img
            src={logo}
            alt="Bionova"
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center" ref={infoRef}>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-base text-[#004AAD] font-semibold"
          >
            {t("checkoutNavbar.securePayment")}<span className="ml-1 text-xs">{showInfo ? "▲" : "▼"}</span>
          </button>
          {showInfo && (
            <div className="absolute top-full mt-1 w-64 sm:w-96 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded p-3 text-sm text-gray-700 shadow-lg z-50">
              {t("checkoutNavbar.tooltip")}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FaGlobe className="text-[#004AAD] w-4 h-4" />
            <button onClick={() => i18n.changeLanguage('es')} className={`text-sm px-2 py-0.5 ${i18n.language === 'es' ? 'font-semibold text-[#004AAD]' : 'text-[#004AAD]'}`}>ES</button>
            <button onClick={() => i18n.changeLanguage('en')} className={`text-sm px-2 py-0.5 ${i18n.language === 'en' ? 'font-semibold text-[#004AAD]' : 'text-[#004AAD]'}`}>EN</button>
          </div>
          <Link to="/carrito" className="relative text-[#004AAD]">
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