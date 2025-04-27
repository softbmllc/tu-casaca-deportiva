// src/pages/NBAPage.tsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import ProductCard from "../components/ProductCard";
import { Product } from "../data/types";
import { FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";
import CartIcon from "../components/CartIcon";
import { ArrowUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import StockExpressButton from "../components/StockExpressButton";
import products from "../data/products"; // Importar productos base

// Equipos de la NBA
const nbaTeams = [
  "ALL STAR", "Indiana Pacers", "Dream Team", "Chicago Bulls", "Los Angeles Lakers",
  "Houston Rockets", "Atlanta Hawks", "New York Knicks", "Cleveland Cavaliers",
  "Portland Trail Blazers", "Toronto Raptors", "San Antonio Spurs", "Dallas Mavericks",
  "Utah Jazz", "Charlotte Hornets", "Memphis Grizzlies", "Golden State Warriors",
  "Boston Celtics", "Miami Heat", "Denver Nuggets", "Brooklyn Nets", "Philadelphia 76ers",
  "Milwaukee Bucks", "Los Angeles Clippers", "Phoenix Suns", "Detroit Pistons",
  "Oklahoma City Thunder", "Niños"
];

// Define un tipo para productos locales
type LocalProduct = Product & {
  active?: boolean;
};

export default function NBAPage() {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(""); // Para reemplazar selectedLeague

  // PUNTO CRÍTICO 1: Cargar productos combinando localStorage y predefinidos
  useEffect(() => {
    const loadProducts = () => {
      try {
        // Importamos los productos base desde el archivo de productos
        const defaultProducts = products.filter(p => 
          p.category === "NBA" || p.league === "NBA"
        );
        
        // IMPORTANTE: Primero normalizar los productos predefinidos
        const normalizedDefaultProducts = defaultProducts.map((prod) => ({
          ...prod,
          active: true,
          slug: prod.slug || `default-${prod.id}`,
          name: prod.name || "",
          priceUSD: prod.priceUSD || 0,
          usdPrice: prod.priceUSD || 0,
          priceUYU: prod.priceUYU || 0,
          uyuPrice: prod.priceUYU || 0,
          league: prod.league || "NBA",
          category: prod.category || "NBA",
          images: prod.images || (prod.image ? [prod.image] : []),
          image: prod.image || (prod.images && prod.images.length > 0 ? prod.images[0] : ""),
        }));
        
        // Cargar productos desde localStorage
        const savedProducts = localStorage.getItem("productos");
        
        let allProducts: LocalProduct[] = [];
        
        if (savedProducts) {
          // Si hay productos en localStorage, combinar con los predefinidos
          const parsedProducts = JSON.parse(savedProducts);
          
          // 1. Obtener IDs o slugs de productos en localStorage para verificar duplicados
          const savedIds = new Set(parsedProducts.map((p: any) => p.id?.toString()));
          const savedSlugs = new Set(parsedProducts.map((p: any) => p.slug));
          
          // 2. Filtrar productos predefinidos que no estén en localStorage
          const uniqueDefaultProducts = normalizedDefaultProducts.filter(
            (p) => !savedIds.has(p.id?.toString()) && !savedSlugs.has(p.slug)
          );
          
          // 3. Combinar ambos arrays, priorizando localStorage
          // Filtramos para incluir solo productos de NBA
          const nbaProducts = parsedProducts.filter((p: any) => 
            p.category === "NBA" || p.league === "NBA"
          );
          
          allProducts = [...nbaProducts, ...uniqueDefaultProducts];
        } else {
          // Si no hay productos en localStorage, usar los normalizados predefinidos
          allProducts = normalizedDefaultProducts;
        }
        
        // Ahora filtrar y normalizar para mostrar
        const activeProducts = allProducts.filter((prod) => prod.active !== false);
        
        // Mapeo final para asegurar compatibilidad perfecta con ProductCard
        const mappedProducts = activeProducts.map((prod) => ({
          ...prod,
          id: prod.id || 0,
          slug: prod.slug || `default-${prod.id || Date.now()}`,
          name: prod.name || prod.title || '',
          title: prod.title || prod.name || '',
          image: (prod.images && prod.images.length > 0) ? prod.images[0] : (prod.image || ''),
          images: prod.images || (prod.image ? [prod.image] : []),
          league: prod.league || prod.category || 'NBA',
          category: prod.category || prod.league || 'NBA',
          priceUSD: prod.priceUSD || prod.usdPrice || 0,
          usdPrice: prod.priceUSD || prod.usdPrice || 0,
          priceUYU: prod.priceUYU || prod.uyuPrice || 0,
          uyuPrice: prod.priceUYU || prod.uyuPrice || 0,
          sizes: prod.sizes || ["S", "M", "L", "XL"],
          team: prod.team || '',
          subtitle: prod.subtitle || ''
        }));
        
        console.log(`Cargados ${mappedProducts.length} productos NBA`);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        // En caso de error, inicializar con array vacío
        setProducts([]);
      }
    };

    loadProducts();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "productos") {
        loadProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setSelectedCategory("");
      setSelectedTeam("");
    }
  }, [searchTerm]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTeamClick = (team: string) => {
    setSelectedTeam(team);
    setSearchTerm("");
    setIsFilterOpen(false);
  };

  const getFilteredProducts = (): Product[] => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
  
    if (normalizedSearch !== "") {
      return products.filter((product) => {
        const nameMatch = (product.name || product.title || "").toLowerCase().includes(normalizedSearch);
        const teamMatch = (product.team || "").toLowerCase().includes(normalizedSearch);
        return nameMatch || teamMatch;
      });
    }
    
    if (selectedCategory === "STOCK_EXPRESS") {
      // Filtrar productos con stock
      const productsWithStock = products.filter((product) => {
        if (product.stock) {
          return Object.values(product.stock).some(quantity => (quantity as number) > 0);
        }
        return false;
      });
      
      // Eliminar duplicados basados en ID
      const uniqueProducts: Product[] = [];
      const seenIds = new Set();
      
      productsWithStock.forEach(product => {
        if (!seenIds.has(product.id)) {
          seenIds.add(product.id);
          uniqueProducts.push(product);
        }
      });
      
      return uniqueProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
  
    return products.filter((product) => {
      const teamMatches = selectedTeam ? product.team === selectedTeam : true;
      return teamMatches;
    });
  };

  const productsToDisplay = getFilteredProducts();
  
  return (
    <section className="bg-[#f9f9f9] text-black min-h-screen">
      <Helmet>
        <title>Camisetas de NBA | Tu Casaca Deportiva</title>
        <meta name="description" content="Descubrí camisetas de los mejores equipos de la NBA: Los Angeles Lakers, Chicago Bulls, Miami Heat, y más. Personalizalas con nombre y número. Envíos desde Miami a todo Uruguay." />
        <meta name="keywords" content="camisetas de NBA, Los Angeles Lakers, Chicago Bulls, camisetas personalizadas, camisetas originales, camisetas NBA, Tu Casaca Deportiva" />
        <link rel="canonical" href="https://tucasacadeportiva.com/nba" />
        <meta property="og:title" content="Camisetas de NBA | Tu Casaca Deportiva" />
        <meta property="og:description" content="Descubrí camisetas de todos los equipos NBA: Los Angeles Lakers, Chicago Bulls, Miami Heat, y más. Stock real y personalización disponible." />
        <meta property="og:image" content="https://tucasacadeportiva.com/images/nba-banner.jpg" />
        <meta property="og:url" content="https://tucasacadeportiva.com/nba" />
        <meta property="og:type" content="website" />
      </Helmet>
  
      <div className="relative w-full h-64 sm:h-96 overflow-hidden">
        <img
          src="/images/nba-banner.jpg"
          alt="Banner general de NBA"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
  
      <div className="max-w-7xl mx-auto px-6 relative">
      <div className="mt-4">
  <Link
    to="/"
    className="text-black font-semibold hover:underline text-sm inline-flex items-center gap-1 transition"
  >
    ← Volver al inicio
  </Link>
</div>
        <div className="absolute right-2 top-0 translate-y-20 sm:translate-y-9 sm:right-0 z-50">
          <CartIcon variant="hero" />
        </div>
  
        <div className="flex justify-between sm:hidden mt-4 mb-2 gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex-1 flex items-center justify-center gap-2 text-sm text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <FiFilter className="text-lg" />
            Filtros
          </button>

          <button
            onClick={() => {
              setSelectedCategory("");
              setSelectedTeam("");
              setSearchTerm("");
              setIsFilterOpen(false);
            }}
            className="flex-1 text-sm text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            Ver TODO
          </button>
        </div>
      </div>
  
      <div className="md:grid md:grid-cols-[250px_1fr] max-w-7xl mx-auto p-6 gap-8">
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
              placeholder="Ej: Los Angeles Lakers"
              className="w-full border px-3 py-2 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedTeam("");
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition ring-1 ring-transparent text-[15px] font-semibold ${
                selectedCategory === "" && selectedTeam === ""
                  ? "bg-black text-white ring-black"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              Ver todo
            </button>
          </div>

          {/* Botón Stock Express en menú móvil */}
          <div className="mb-4">
            <StockExpressButton
              isSelected={selectedCategory === "STOCK_EXPRESS"}
              onClick={() => {
                setSelectedCategory("STOCK_EXPRESS");
                setSelectedTeam("");
                setSearchTerm("");
                setIsFilterOpen(false);
              }}
            />
          </div>

          <div>
            <h3 className="font-bold mb-2">Equipos</h3>
            <ul className="space-y-1 text-sm">
              {nbaTeams.map((team) => (
                <li key={team}>
                  <button
                    onClick={() => handleTeamClick(team)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ring-1 ring-transparent ${
                      selectedTeam === team
                        ? "bg-black text-white font-semibold ring-black"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-semibold text-[15px]">{team}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>

        {/* Filtro móvil */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 sm:hidden overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
            >
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Filtros</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full border px-3 py-2 rounded-lg text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <StockExpressButton
                    isSelected={selectedCategory === "STOCK_EXPRESS"}
                    onClick={() => {
                      setSelectedCategory("STOCK_EXPRESS");
                      setSelectedTeam("");
                      setSearchTerm("");
                      setIsFilterOpen(false);
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold mb-2">Equipos</h3>
                  {nbaTeams.map((team) => (
                    <div key={team} className="mb-2">
                      <button
                        onClick={() => {
                          handleTeamClick(team);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedTeam === team
                            ? "bg-black text-white font-semibold"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {team}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <main>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold">Camisetas NBA</h1>
              <p className="text-gray-500 text-sm md:text-base">
                Todas {selectedTeam ? `- ${selectedTeam}` : ""} {selectedCategory === "STOCK_EXPRESS" ? "- Stock Express" : ""}
              </p>
            </div>
          </div>

          {/* Sección Stock Express */}
          {selectedCategory === "STOCK_EXPRESS" && (
            <div 
              id="stock-express"
              className="bg-white p-4 md:p-6 rounded-xl border shadow-sm mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <ArrowUp className="h-5 w-5 rotate-45 text-green-600" />
                <h2 className="text-xl font-bold">Stock Express</h2>
              </div>
              <p className="text-gray-700 mb-1">
                Productos en stock, disponibles inmediatamente para entrega o retiro.
              </p>
              <p className="text-gray-500 text-sm">* Las cantidades mostradas son el stock real disponible</p>
            </div>
          )}

          {/* Grid de productos */}
          {productsToDisplay.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedTeam("");
                }}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {productsToDisplay.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg hover:bg-black/80 transition"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <Footer />
    </section>
  );
}