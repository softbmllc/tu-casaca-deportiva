//src/pages/FootballPage.tsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import defaultProducts from "../data/products"; // Renombrarlo para evitar conflictos
import stock from "../data/stock";
import ProductCard from "../components/ProductCard";
import { Product } from "../data/types";
import { FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";
import CartIcon from "../components/CartIcon";
import { ArrowUp, Bolt } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { Rocket } from "lucide-react";
import StockExpressButton from "../components/StockExpressButton";

const leagues = [
  {
    name: "Premier League",
    teams: [
      "Arsenal", "Aston Villa", "Brighton", "Chelsea", "Crystal Palace",
      "Everton", "Leeds United", "Leicester City", "Liverpool", "Manchester City",
      "Manchester United", "Newcastle United", "Tottenham Hotspurs", "West Ham United",
      "Wolves FC"
    ],
  },
  {
    name: "La Liga",
    teams: [
      "Alaves", "Athletic Bilbao", "Atletico Madrid", "Barcelona", "Cadiz", "Celta",
      "Espanyol", "Getafe", "Girona", "Leganes", "Mallorca", "Osasuna", "Rayo Vallecano",
      "Real Betis", "Real Madrid", "Real Sociedad", "Sevilla", "Valencia", "Valladolid",
      "Villarreal"
    ],
  },
  {
    name: "Serie A",
    teams: [
      "AC Milan", "Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina",
      "Genoa", "Inter Milan", "Juventus", "Lazio", "Lecce", "Monza", "Napoli", "Parma",
      "Roma", "Sampdoria", "Torino", "Udinese", "Venezia FC", "Verona"
    ],
  },
  {
    name: "Bundesliga",
    teams: [
      "Bayern Munich", "Berlin Union", "Borussia Dortmund", "Frankfurt", "LeverKusen",
      "Monchengladbach", "RB Leipzig", "Schalke 04", "Werder Bremen", "Wolfsburg"
    ],
  },
  {
    name: "Selecciones",
    teams: [
      "Alemania", "Argentina", "Belgica", "Brasil", "Chile", "Croacia", "Dinamarca",
      "EEUU", "Escocia", "España", "Francia", "Gales", "Inglaterra", "Irlanda", "Italia",
      "Japón", "Mexico", "Países Bajos", "Portugal", "Suiza", "Suecia"
    ],
  },
  {
    name: "Uruguay",
    teams: ["Nacional", "Peñarol"],
  },
  {
    name: "Retro",
    teams: [
      "AC Milan", "Alemania", "Argentina", "Arsenal", "Barcelona", "Bayern Munich",
      "Borussia Dortmund", "Brasil", "Celtic", "Chelsea", "España", "Francia",
      "Inglaterra", "Inter Milan", "Italia", "Japón", "Juventus", "Liverpool",
      "Manchester United", "Nigeria", "Países Bajos", "Portugal", "PSG", "Rangers",
      "Real Madrid"
    ],
  },
];

type LocalProduct = Product & {
  active?: boolean;
};

export default function FootballPage() {
  const [products, setProducts] = useState<LocalProduct[]>([]); // Estado para almacenar productos
  const [selectedLeague, setSelectedLeague] = useState("Premier League");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  // PUNTO CRÍTICO 1: Cargar productos combinando localStorage y predefinidos
  useEffect(() => {
    const loadProducts = () => {
      try {
        // IMPORTANTE: Primero normalizar los productos predefinidos para asegurar compatibilidad
        const normalizedDefaultProducts = defaultProducts.map((prod) => ({
          ...prod,
          active: true,
          // Asegurar que existan slug y name
          slug: prod.slug || `default-${prod.id}`,
          name: prod.name || '',
          // Normalizar campos de precios (tenemos dos convenciones de nombres)
          priceUSD: prod.priceUSD || 0,
          usdPrice: prod.priceUSD || 0,
          priceUYU: prod.priceUYU || 0,
          uyuPrice: prod.priceUYU || 0,
          // Asegurar que exista categoria/liga
          league: prod.league || "FÚTBOL",
          category: prod.category || prod.league || "FÚTBOL",
          // Asegurar que exista estuctura de imágenes
          images: prod.images || (prod.image ? [prod.image] : []),
          image: prod.image || (prod.images && prod.images.length > 0 ? prod.images[0] : ""),
        }));
        
        // Cargar productos desde localStorage
        const savedProducts = localStorage.getItem("productos");
        
        let allProducts: any[] = [];
        
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
          allProducts = [...parsedProducts, ...uniqueDefaultProducts];
          
          // 4. Guardar versión combinada en localStorage
          localStorage.setItem("productos", JSON.stringify(allProducts));
          console.log("Productos combinados guardados en localStorage");
        } else {
          // Si no hay productos en localStorage, usar los normalizados predefinidos
          allProducts = normalizedDefaultProducts;
          localStorage.setItem("productos", JSON.stringify(allProducts));
          console.log("Productos predefinidos guardados en localStorage");
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
          league: prod.league || prod.category || 'FÚTBOL',
          category: prod.category || prod.league || 'FÚTBOL',
          priceUSD: prod.priceUSD || prod.usdPrice || 0,
          usdPrice: prod.priceUSD || prod.usdPrice || 0,
          priceUYU: prod.priceUYU || prod.uyuPrice || 0,
          uyuPrice: prod.priceUYU || prod.uyuPrice || 0,
          sizes: prod.sizes || ["S", "M", "L", "XL"],
          team: prod.team || '',
          subtitle: prod.subtitle || ''
        }));
        
        console.log(`Cargados ${mappedProducts.length} productos`);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        // En caso de error extremo, usar productos por defecto
        setProducts(defaultProducts);
      }
    };

    loadProducts();
    
    // Listener para cambios en localStorage
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
    if (location.hash === "#stock-express") {
      setSelectedLeague("STOCK_EXPRESS");
      setSelectedTeam("");
      setSearchTerm("");
  
      setTimeout(() => {
        const section = document.getElementById("stock-express");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 300); // da tiempo a renderizar
    }
  }, [location.hash]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setSelectedLeague("");
      setSelectedTeam("");
    }
  }, [searchTerm]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLeagueClick = (league: string) => {
    setSelectedLeague(league);
    setSelectedTeam("");
    setSearchTerm("");
    setIsFilterOpen(false);
  };

  const handleTeamClick = (team: string) => {
    const teamLeague = leagues.find((league) =>
      league.teams.includes(team)
    )?.name;

    if (teamLeague) {
      setSelectedLeague(teamLeague);
    }

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
  
    if (selectedLeague === "STOCK_EXPRESS") {
      // Combinamos los productos de stock.ts con productos de localStorage que tienen stock
      const productsWithStock = products.filter((product) => {
        // Verificar si el producto tiene la propiedad stock y al menos un talle con cantidad > 0
        if (product.stock) {
          return Object.values(product.stock).some(quantity => (quantity as number) > 0);
        }
        return false;
      });
      
      // Combinar con los productos predefinidos de stock.ts
      const combinedStockProducts = [...stock, ...productsWithStock];
      
      // Eliminar duplicados basados en ID
      const uniqueProducts: Product[] = [];
      const seenIds = new Set();
      
      combinedStockProducts.forEach((product: Partial<Product>) => {
        if (
          typeof product.id === "number" &&
          typeof product.name === "string" &&
          typeof product.title === "string"
        ) {
          if (!seenIds.has(product.id)) {
            seenIds.add(product.id);
            uniqueProducts.push(product as Product); // 🔐 type assertion segura
          }
        }
      });
      
      return uniqueProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
  
    return products.filter((product) => {
      const leagueMatches = selectedLeague 
        ? (product.league === selectedLeague || product.category === selectedLeague) 
        : true;
      const teamMatches = selectedTeam ? product.team === selectedTeam : true;
      return leagueMatches && teamMatches;
    });
  };

  const isStockExpress = selectedLeague === "STOCK_EXPRESS";
  const productsToDisplay = getFilteredProducts();
  const currentLeague = leagues.find((l) => l.name === selectedLeague);
  
  return (
    <section className="bg-[#f9f9f9] text-black min-h-screen">
      <Helmet>
        <title>Camisetas de Fútbol | Tu Casaca Deportiva</title>
        <meta name="description" content="Descubrí camisetas de fútbol de todas las ligas: Premier League, La Liga, Serie A, Bundesliga, Retro y más. Personalizalas con nombre y número. Envíos desde Miami a todo Uruguay." />
        <meta name="keywords" content="camisetas de fútbol, Premier League, La Liga, camiseta retro, camisetas originales, camisetas Uruguay, Tu Casaca Deportiva" />
        <link rel="canonical" href="https://tucasacadeportiva.com/futbol" />
        <meta property="og:title" content="Camisetas de Fútbol | Tu Casaca Deportiva" />
        <meta property="og:description" content="Descubrí camisetas de todas las ligas: Premier League, La Liga, Serie A, y más. Stock real y personalización disponible." />
        <meta property="og:image" content="https://tucasacadeportiva.com/images/futbol-banner.jpg" />
        <meta property="og:url" content="https://tucasacadeportiva.com/futbol" />
        <meta property="og:type" content="website" />
      </Helmet>
  
      <div className="relative w-full h-64 sm:h-96 overflow-hidden">
        <img
          src="/images/futbol-banner.jpg"
          alt="Banner general de fútbol"
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
              setSelectedLeague("");
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
              placeholder="Ej: Manchester United"
              className="w-full border px-3 py-2 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedLeague("");
                setSelectedTeam("");
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition ring-1 ring-transparent text-[15px] font-semibold ${
                selectedLeague === "" && selectedTeam === ""
                  ? "bg-black text-white ring-black"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              Ver todo
            </button>
          </div>

          {/* ✅ Botón Stock Express en menú móvil */}
          <div className="mb-4">
            <StockExpressButton
              isSelected={selectedLeague === "STOCK_EXPRESS"}
              onClick={() => {
                setSelectedLeague("STOCK_EXPRESS");
                setSelectedTeam("");
                setSearchTerm("");
                setIsFilterOpen(false); // Cerramos el panel luego de seleccionar
              }}
            />
          </div>

          <div>
            <h3 className="font-bold mb-2">Categorías</h3>
            <ul className="space-y-1 text-sm">
              {leagues.map((league) => (
                <li key={league.name}>
                  <button
                    onClick={() => handleLeagueClick(league.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ring-1 ring-transparent ${
                      selectedLeague === league.name
                        ? "bg-black text-white font-semibold ring-black"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-semibold text-[15px]">{league.name}</span>
                  </button>
                  {selectedLeague === league.name && league.teams.length > 0 && (
                    <ul className="ml-4 mt-2 space-y-1">
                      {league.teams.map((team) => (
                        <li key={team}>
                          <button
                            onClick={() => {
                              setSelectedTeam(team);
                              setSelectedLeague(league.name);
                            }}
                            className={`text-sm px-2 py-1 rounded-md w-full text-left transition ring-1 ring-transparent ${
                              selectedTeam === team
                                ? "bg-gray-900 text-white ring-gray-900"
                                : "hover:bg-gray-200"
                            }`}
                          >
                            {team}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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
                    isSelected={selectedLeague === "STOCK_EXPRESS"}
                    onClick={() => {
                      setSelectedLeague("STOCK_EXPRESS");
                      setSelectedTeam("");
                      setSearchTerm("");
                      setIsFilterOpen(false); // Cerramos el panel luego de seleccionar
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold mb-2">Categorías</h3>
                  {leagues.map((league) => (
                    <div key={league.name} className="mb-2">
                      <button
                        onClick={() => handleLeagueClick(league.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ring-1 ring-transparent ${
                          selectedLeague === league.name
                            ? "bg-black text-white font-semibold ring-black"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="font-semibold text-[15px]">
                          {league.name}
                        </span>
                      </button>
                      {selectedLeague === league.name && (
                        <div className="grid grid-cols-2 gap-1 mt-2 ml-4">
                          {league.teams.map((team) => (
                            <button
                              key={team}
                              onClick={() => {
                                setSelectedTeam(team);
                                setSelectedLeague(league.name);
                                setIsFilterOpen(false);
                              }}
                              className={`text-sm px-2 py-1 rounded-md w-full text-left transition ring-1 ring-transparent ${
                                selectedTeam === team
                                  ? "bg-gray-900 text-white ring-gray-900"
                                  : "hover:bg-gray-200"
                              }`}
                            >
                              {team}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <div className="space-y-8">

          {/* Encabezado */}
<div className="flex flex-wrap justify-between items-center gap-3 mb-4">
  <div>
    <h1 className="text-xl sm:text-2xl font-bold">
      {isStockExpress
        ? "Camisetas en Stock Express"
        : selectedLeague
        ? `Camisetas ${selectedLeague}`
        : selectedTeam
        ? `Camisetas ${selectedTeam}`
        : searchTerm
        ? `Resultados para "${searchTerm}"`
        : "Todas las camisetas"}
    </h1>
    <p className="text-gray-600 text-sm">
      {productsToDisplay.length} resultado(s)
    </p>
  </div>
</div>

          {/* Sección sin resultados */}
          {productsToDisplay.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-bold mt-4 mb-2">No encontramos resultados</h2>
              <p className="text-gray-500 mb-6">
                No hay camisetas disponibles para los filtros seleccionados.
              </p>
              <button
                onClick={() => {
                  setSelectedLeague("");
                  setSelectedTeam("");
                  setSearchTerm("");
                }}
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition"
              >
                Ver todas las camisetas
              </button>
            </div>
          )}

          {/* Grid de productos */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {productsToDisplay.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Botón para volver arriba */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-black text-white p-2.5 rounded-full shadow-lg shadow-black/20 hover:bg-black/90 hover:scale-105 transition"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}

      <Footer />
    </section>
  );
}