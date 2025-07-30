// src/pages/Shop.tsx

import React, { useState, useEffect, Suspense } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import ProductCard from "../components/ProductCard";
import ShopNavbar from "../components/ShopNavbar";
import { Product, Subcategory, Category as BaseCategory } from "../data/types";
import type { Category } from "../data/types";

import { FiFilter } from "react-icons/fi";
import { FaFutbol, FaBasketballBall } from "react-icons/fa";
import { IoGameControllerOutline } from "react-icons/io5";
import { Gamepad } from "lucide-react";
import { TIPOS } from '@/constants/tipos';
import { motion } from "framer-motion";
import { ArrowUp, Bolt } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { Fragment } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";
import { fetchProducts, fetchSubcategories, fetchCategories } from "../firebaseUtils";
import ProductSkeleton from "../components/ProductSkeleton";
import SidebarFilter from "../components/SidebarFilter";
import MobileFilterDrawer from "../components/MobileFilterDrawer";
import Footer from "../components/Footer";

// Define un tipo para productos locales
type LocalProduct = Product & {
  active?: boolean;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  tipo?: string;
  price?: number;
};

export default function Shop() {
  // --- i18n arriba de cualquier useMemo/useEffect que dependa de i18n.language ---
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<LocalProduct[]>([]); // Estado para almacenar productos
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  // Estado de ordenamiento
  const [sortOption, setSortOption] = useState("");
  // Estado de ordenamiento exclusivo para mobile
  const [selectedOrderMobile, setSelectedOrderMobile] = useState("");
  const [showOrderMenuMobile, setShowOrderMenuMobile] = useState(false);
  const handleOrderChangeMobile = (order: string) => {
    setSelectedOrderMobile(order);
    setShowOrderMenuMobile(false);
  };
  // Determinar si es Mobile View (simple heurística)
  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // Para el nuevo Listbox de mobile
  const sortOptions = [
    { value: "az", label: "Nombre: A-Z" },
    { value: "za", label: "Nombre: Z-A" },
    { value: "priceAsc", label: "Precio: Menor a Mayor" },
    { value: "priceDesc", label: "Precio: Mayor a Menor" },
  ];
  const selectedSort = sortOptions.find(o => o.value === sortOption) || sortOptions[0];
  const handleSortChange = (option: { value: string; label: string }) => {
    setSortOption(option.value);
  };
  const handleOpenFilters = () => setIsFilterOpen(true);
  // --- Filtro por parámetro en la URL ---
  const searchParams = new URLSearchParams(location.search);
  const filterParamRaw = searchParams.get("filter");
  const filterParam = filterParamRaw ? filterParamRaw.toUpperCase() : "";

  // Escuchar evento mobileSearch para actualizar searchTerm (sin afectar lógica desktop)
  useEffect(() => {
    const handleMobileSearch = (e: Event) => {
      const value = (e as CustomEvent).detail.toLowerCase();
      setSearchTerm(value);
    };
    window.addEventListener("mobileSearch", handleMobileSearch);
    return () => window.removeEventListener("mobileSearch", handleMobileSearch);
  }, []);
  
// Estado para almacenar las ligas dinámicas
// (removido: lógica de league)

  // Estado para almacenar subcategorías
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  // Estado para almacenar categorías (nuevo)
  const [categories, setCategories] = useState<Category[]>([]);
  // Estado para categoría y subcategoría seleccionadas (nuevo)
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  // Estado para controlar visibilidad del drawer de filtros (desktop/sidebar)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Estado para mostrar SidebarFilter en mobile (nuevo)
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  // Estado para filtrar por tipo
  // NUEVO: Estado para filtro por tipo de producto (botones custom)
  const [selectedType, setSelectedType] = useState("Todos");

  // 🔧 1. Definir availableTypes arriba del return principal (fuera de JSX), justo donde definís los filtros:
  const availableTypes = Array.from(new Set(products.map(p => p.tipo).filter(Boolean)));

  // NUEVO: Handler para filtro por tipo
  const handleFilterByType = (tipo: string) => {
    setSelectedType(tipo);
    // Lógica de filtrado por tipo
    // Si tu lógica previa usaba selectedTipo, podés mapear los valores:
    // "Todos" -> "", "Juegos" -> "Juego", "Consolas" -> "Consola", "Accesorios" -> "Accesorio", "Merchandising" -> "Merch"
    const tipoMap: Record<string, string> = {
      Todos: "",
      Juegos: "Juego",
      Consolas: "Consola",
      Accesorios: "Accesorio",
      Merchandising: "Merch",
    };
    setSelectedType(tipo); // Mantener el estado de tipo seleccionado (UI)
    // Si necesitas mapear a otro valor para filtrado, podrías guardar ese valor aparte, pero aquí solo se usa selectedType
  };

  // 🔥 Cargar productos de Firebase al montar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        // Filtrar solo productos activos y asegurar que todos tengan el campo tipo
        const footballProducts = fetchedProducts
          .filter((product: Product) => product.active !== false)
          .map((product: Product) => ({
            ...product,
            tipo: product.tipo || "",
            priceUSD: Number(product.priceUSD) || 0,
          }));

        setProducts(footballProducts);
        setLoading(false);

        console.log(`[Shop] Productos de fútbol cargados: ${footballProducts.length}`);
      } catch (error) {
        console.error("[Shop] Error al cargar productos:", error);
        setProducts([]);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // (removido: useEffect de ligas y lógica relacionada)

  // 🔥 Cargar categorías y subcategorías (nuevo useEffect)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Ensure each category has 'subcategories' property (even if empty)
        const rawCategories: any[] = await fetchCategories();
        const categoriesWithSubs = rawCategories.map((cat) => ({
          ...cat,
          subcategories: cat.subcategories || [],
        }));
        setCategories(categoriesWithSubs);
        const allSubs = categoriesWithSubs.flatMap(cat => cat.subcategories);
        setSubcategories(allSubs);
      } catch (error) {
        console.error("[Shop] Error al cargar categorías y subcategorías:", error);
        setCategories([]);
      }
    };
    loadData();
  }, []);
  // Handlers para sidebar de categorías (nuevo)
  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === '') {
      setSelectedCategory('');
      setSelectedSubcategory('');
      return;
    }
    const category = categories.find((cat) => cat.name === categoryName);
    if (category) {
      setSelectedCategory(category.id);
      setSelectedSubcategory('');
    }
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    if (subcategoryName === '') {
      setSelectedSubcategory('');
      return;
    }
    for (const category of categories) {
      const sub = category.subcategories?.find((s: any) => s.name === subcategoryName);
      if (sub) {
        setSelectedCategory(category.id);
        setSelectedSubcategory(sub.id);
        break;
      }
    }
  };

  // (removido: useEffect relacionado a selectedLeague y stock)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // (removido: useEffect que limpia selectedLeague al buscar)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // (removido: handleLeagueClick y handleTeamClick)

  // Nuevo filtrado de productos usando useMemo, con lógica de subcategoría (versión robusta) y ordenamiento
  // --- filteredProducts debe estar antes de cualquier useMemo que lo use ---
  const filteredProducts = useMemo(() => {
    // Usar directamente selectedType como valor de filtro (sin tipoMap)
    const selectedTipo = selectedType;
    // Normalizador para tildes/mayúsculas
    const normalizeTexto = (text: string) =>
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const filtered = products.filter((product) => {
      const categoryMatch = selectedCategory ? product.category?.id === selectedCategory : true;
      const subcategoryMatch = selectedSubcategory ? product.subcategory?.id === selectedSubcategory : true;
      // Cambiar la lógica de tipoMatch para que "Todos" muestre todos los productos
      const tipoMatch =
        selectedTipo === "Todos"
          ? true
          : (selectedTipo
              ? (Array.isArray(product.tipo)
                  ? product.tipo.some(t => normalizeTexto(t) === normalizeTexto(selectedTipo))
                  : normalizeTexto(product.tipo || "") === normalizeTexto(selectedTipo))
              : true);
      const searchMatch = searchTerm
        ? product.title?.[i18n.language as "en" | "es"]?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return categoryMatch && subcategoryMatch && tipoMatch && searchMatch;
    });

    // --- DEBUG: Mostrar por consola los valores del filtro y productos resultantes ---
    console.log("Selected category:", selectedCategory);
    console.log("Selected subcategory:", selectedSubcategory);
    // Debug detallado del filtro por tipo (usando el normalizador de filteredProducts)
    filtered.forEach(p => {
      const tipoMatchDebug =
        selectedTipo === "Todos" ||
        (Array.isArray(p.tipo)
          ? p.tipo.some(t => normalizeTexto(t) === normalizeTexto(selectedTipo))
          : normalizeTexto(p.tipo || "") === normalizeTexto(selectedTipo));

      console.log(
        "🧪",
        p.title?.[i18n.language as "en" | "es"],
        "| tipo:", p.tipo,
        "| selectedType:", selectedType,
        "| selectedTipo:", selectedTipo,
        "| tipoMatch:", tipoMatchDebug
      );
    });
    // -----------------------------------------

    // No ordenamiento aquí, solo filtrado; sorting se hace aparte
    return filtered;
  }, [products, selectedCategory, selectedSubcategory, selectedType, searchTerm, sortOption, i18n.language]);

  // --- Ordenamiento de productos (usando precio de variantes si priceUSD principal es 0) ---
  // --- PATCH: Agregar tipo Language y lang para ordenar por idioma ---
  type Language = 'en' | 'es';
  const lang = i18n.language as Language;
  // Auxiliar para obtener el precio consistente
  const getPrice = (p: LocalProduct) => {
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const firstVariant = p.variants[0];
      if (Array.isArray(firstVariant.options) && firstVariant.options.length > 0) {
        return firstVariant.options[0].priceUSD ?? 0;
      }
    }
    return p.price ?? 0;
  };
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      if (sortOption === "price-asc" || sortOption === "priceAsc") return getPrice(a) - getPrice(b);
      if (sortOption === "price-desc" || sortOption === "priceDesc") return getPrice(b) - getPrice(a);
      if (sortOption === "az") {
        return (a.title?.[lang] || "").localeCompare(
          b.title?.[lang] || ""
        );
      }
      if (sortOption === "za") {
        return (b.title?.[lang] || "").localeCompare(
          a.title?.[lang] || ""
        );
      }
      return 0;
    });
    console.log("🔍 Orden actual y precios:");
    sorted.forEach((p) => {
      console.log(
        `→ ${p.title?.es} | price: ${getPrice(p)}`
      );
    });
    return sorted;
  }, [filteredProducts, sortOption, i18n.language]);

  // --- Ordenamiento MOBILE por selectedOrderMobile, después de filteredProducts ---
  // --- PATCH: Usar lang en vez de i18n.language en sort ---
  // Ordenamiento MOBILE custom menu: sortedProductsMobile depende de selectedOrderMobile
  const sortedProductsMobile = useMemo(() => {
    let sorted = [...filteredProducts];
    switch (selectedOrderMobile) {
      case "az":
        sorted.sort((a, b) => a.title?.[lang]?.localeCompare(b.title?.[lang] ?? "") ?? 0);
        break;
      case "za":
        sorted.sort((a, b) => b.title?.[lang]?.localeCompare(a.title?.[lang] ?? "") ?? 0);
        break;
      case "asc":
        sorted.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "desc":
        sorted.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredProducts, selectedOrderMobile, i18n.language]);

  // (removido: isStockExpress, currentLeague, currentLeagueSubcategories y getLeagueId)
  const productsToDisplay = sortedProducts;
  console.log("[Shop] Productos a mostrar:", productsToDisplay);
  // Banner dinámico según filtro (normalizando a mayúsculas)
  const normalizedFilter = filterParam.toUpperCase();
  const bannerImage = {
    NBA: "/images/banner-nba.jpg",
    FUTBOL: "/images/futbol-banner.jpg",
    TODO: "/images/banner-general.jpg",
  }[normalizedFilter] || "/images/banner-general.jpg";
  
  if (loading) {
    return (
      <section className="bg-[#f9f9f9] text-black min-h-screen flex flex-col">
        <div className="relative w-full h-64 sm:h-96 overflow-hidden">
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
        {/* Footer intentionally removed from loading state to prevent duplication */}
      </section>
    );
  }

  return (
    <section className="bg-[#f9f9f9] text-black flex flex-col min-h-screen pt-[90px] md:pt-[110px]">
      <ShopNavbar />
      <Helmet>
        <title>Bionova – Shop supplements by category</title>
        <meta
          name="description"
          content="Browse premium supplements from Fuxion, Pure Encapsulations and Double Wood. Fast US shipping. Explore all categories."
        />
        <meta
          name="keywords"
          content="supplements, vitamins, Fuxion, Pure Encapsulations, Double Wood, shop supplements"
        />
        <link rel="canonical" href="https://getbionova.com/shop" />
        <meta property="og:title" content="Bionova – Shop supplements by category" />
        <meta property="og:description" content="Browse premium supplements from Fuxion, Pure Encapsulations and Double Wood. Fast US shipping. Explore all categories." />
        <meta property="og:image" content="/seo-image.jpg" />
        <meta property="og:url" content="https://getbionova.com/shop" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bionova – Shop supplements by category" />
        <meta name="twitter:description" content="Browse premium supplements from Fuxion, Pure Encapsulations and Double Wood. Fast US shipping. Explore all categories." />
        <meta name="twitter:image" content="/seo-image.jpg" />
      </Helmet>

  
  
      {/* NAV MOBILE SOLO VISIBLE EN MOBILE */}
      {/* Botón "Volver al inicio", botón "Filtros" (desktop) y CartIcon eliminados según requerimiento */}
      <div className="md:grid md:grid-cols-[250px_1fr] max-w-7xl mx-auto px-4 md:px-6 gap-8 overflow-x-hidden">
        {/* Sidebar */}
        <motion.aside
          className="hidden md:block space-y-6 pr-6 border-r border-gray-200"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <label className="block font-semibold text-sm mb-2" htmlFor="search">
              Buscar por nombre
            </label>
            <input
              id="search"
              type="text"
              placeholder={t("shop.searchPlaceholder", "Ej: GTA 5")}
              className="w-full border px-3 py-2 rounded-lg text-sm text-black placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>


          {/* SidebarFilter con props para filtro de categoría y subcategoría */}
          <SidebarFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            // --- PATCH: resaltar nombre de categoría principal en SidebarFilter ---
            renderCategoryName={(category: Category) => (
              <p className="font-bold">{category.name}</p>
            )}
          />

          {/* Filtro por tipo (diseño estilizado) */}
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase text-black mb-2 flex items-center gap-2">
              <Gamepad className="w-4 h-4" />
              Tipo de producto
            </h3>
            <div className="flex flex-col gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  selectedType === '' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
                onClick={() => setSelectedType('')}
              >
                Todos
              </button>
              {TIPOS.map((type) => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    selectedType === type ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

      {/* Para móviles: sidebar en modal */}
      {/* (removido: bloque de ligas móvil y lógica asociada) */}
        </motion.aside>

        {/* Contenido principal - Productos */}
        <main>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {searchTerm
                ? t("shop.resultsFor", { search: searchTerm, defaultValue: 'Resultados para "{{search}}"', searchTerm })
                : filterParam === "NBA"
                ? t("shop.nba", "NBA")
                : filterParam === "FUTBOL"
                ? t("shop.soccer", "Fútbol")
                : "Productos disponibles"}
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              {productsToDisplay.length} productos encontrados
            </p>
            {(searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedSubcategory("");
                  setSelectedType("");
                  navigate(".", { replace: true });
                }}
                className="mt-2 text-sm font-semibold text-gray-700 hover:text-black underline"
              >
                Quitar filtros
              </button>
            )}
          </div>

          {/* (removido: Stock Express Banner) */}

          {/* MOBILE: Filtros y ordenar por botones (solo visible en mobile) */}
          <div className="flex justify-between items-center px-4 py-2 sm:hidden">
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="border rounded px-2 py-1 text-sm"
            >
              Filtros
            </button>
            {isMobileView && (
              <div className="relative z-40 mt-0">
                <button
                  onClick={() => setShowOrderMenuMobile(!showOrderMenuMobile)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm"
                >
                  Ordenar por: {selectedOrderMobile === "asc" ? "Precio ↑" : selectedOrderMobile === "desc" ? "Precio ↓" : selectedOrderMobile === "az" ? "A-Z" : selectedOrderMobile === "za" ? "Z-A" : "Ninguno"}
                </button>
                {showOrderMenuMobile && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => handleOrderChangeMobile("asc")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Precio: menor a mayor
                    </button>
                    <button
                      onClick={() => handleOrderChangeMobile("desc")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Precio: mayor a menor
                    </button>
                    <button
                      onClick={() => handleOrderChangeMobile("az")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      A-Z
                    </button>
                    <button
                      onClick={() => handleOrderChangeMobile("za")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Z-A
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE: SidebarFilter collapsible panel */}
          {showMobileFilter && (
            <div className="md:hidden mt-4">
              <SidebarFilter
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                renderCategoryName={(category: Category) => (
                  <p className="font-bold">{category.name}</p>
                )}
              />
              {/* Bloque de "Tipo de Producto" para mobile, al final del SidebarFilter */}
              {/* 🔧 2. Bloque corregido: solo usa selectedType y setSelectedType */}
              {availableTypes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2">Tipo de Producto</h3>
                  <div className="space-y-1">
                    {availableTypes.map((type) => {
                      if (!type) return null;
                      return (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="product-type"
                            value={type}
                            checked={selectedType === type}
                            onChange={() => setSelectedType(type)}
                            className="form-radio"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      );
                    })}
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="product-type"
                        value="Todos"
                        checked={selectedType === "Todos"}
                        onChange={() => setSelectedType("Todos")}
                        className="form-radio"
                      />
                      <span className="text-sm">Todos</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DESKTOP: Ordenar por (solo visible en desktop) */}
          <div className="hidden md:flex justify-end items-center mt-4">
            <Listbox value={sortOption} onChange={setSortOption}>
              {({ open }) => (
                <div className="relative w-52">
                  <Listbox.Button className="w-full cursor-pointer rounded-md border border-[#0F0F0F] bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 text-sm flex justify-between items-center text-[#0F0F0F] focus:ring-[#FF2D55] focus:border-[#FF2D55]">
                    <span>
                      {{
                        "": "Ordenar por",
                        priceAsc: "Precio: Menor a Mayor",
                        priceDesc: "Precio: Mayor a Menor",
                        az: "Nombre: A-Z",
                        za: "Nombre: Z-A",
                      }[sortOption] || "Ordenar por"}
                    </span>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </Listbox.Button>
                  <Listbox.Options className="absolute right-0 mt-1 max-w-[240px] w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 text-sm overflow-hidden whitespace-nowrap">
                    {[
                      { value: "", label: "Ordenar por" },
                      { value: "priceAsc", label: "Precio: Menor a Mayor" },
                      { value: "priceDesc", label: "Precio: Mayor a Menor" },
                      { value: "az", label: "Nombre: A-Z" },
                      { value: "za", label: "Nombre: Z-A" },
                    ].map((option) => (
                      <Listbox.Option
                        key={option.value}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none relative py-2 pl-10 pr-4
                          ${selected ? 'bg-[#FF2D55] text-white font-bold' : ''}
                          ${active && !selected ? 'hover:bg-[#FF2D55]/90 hover:text-white' : ''}
                          ${!selected && !active ? 'text-[#0F0F0F]' : ''}`
                        }
                        value={option.value}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate`}>
                              {option.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                                <CheckIcon className="h-4 w-4" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              )}
            </Listbox>
          </div>
          {/* Grid de productos */}
<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
  <Suspense
    fallback={Array.from({ length: 8 }).map((_, index) => (
      <ProductSkeleton key={index} />
    ))}
  >
    {(isMobileView ? sortedProductsMobile : sortedProducts).length > 0 ? (
      (isMobileView ? sortedProductsMobile : sortedProducts).map((product: LocalProduct) => (
        <ProductCard key={product.slug ?? product.id} product={product} />
      ))
    ) : (
      <div className="col-span-full py-16 min-h-[300px] text-center space-y-4">
        <p className="text-gray-500 font-medium max-w-xl mx-auto text-center">
          No se encontraron productos con los filtros seleccionados.
          <br />
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedSubcategory('');
              setSelectedType('');
              navigate('.', { replace: true });
            }}
            className="text-red-600 hover:underline font-semibold mt-2 inline-block"
          >
            Mostrar todos los productos
          </button>
        </p>
      </div>
    )}
  </Suspense>
</div>
        </main>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition"
          aria-label={t("shop.scrollToTop", "Volver arriba")}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Drawer de filtros mobile */}
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
      />

      {/* Footer */}
      <Footer />
    </section>
  );
}

// NOTE: If you see in this file:
// {showPersonalization && (
//   <>
//     {/* name and number fields */}
//   </>
// )}
// Replace with:
// {product.customizable !== false && (
//   <>
//     {/* name and number fields */}
//   </>
// )} 