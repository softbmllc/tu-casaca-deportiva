// src/pages/NBAPage.tsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Filter } from "lucide-react";
import { Product } from "../data/types";
import { fetchProducts, fetchLeagues, fetchTeams } from "../firebaseUtils";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import StockExpressButton from "../components/StockExpressButton";
import CartIcon from "../components/CartIcon";

// Define un tipo para productos locales
type LocalProduct = Product & {
  active?: boolean;
};

// Interfaz para las ligas
type LeagueData = {
  name: string;
  teams: string[];
};

export default function NBAPage() {
  const [products, setProducts] = useState<LocalProduct[]>([]); // Estado para almacenar productos
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  
  // Estado para almacenar las ligas dinámicas
  const [dynamicLeagues, setDynamicLeagues] = useState<LeagueData[]>([]);
  const [noLeaguesAvailable, setNoLeaguesAvailable] = useState(false);

  // 🔥 Nuevo sistema para cargar productos, ligas y equipos de NBA
useEffect(() => {
  async function loadNBAData() {
    try {
      const [productsFetched, leaguesFetched, teamsFetched] = await Promise.all([
        fetchProducts(),
        fetchLeagues(),
        fetchTeams()
      ]);

      // Filtrar productos de NBA
const nbaProducts = productsFetched.filter(
  (p) => (p.league === "NBA" || p.category === "NBA") && p.active !== false
);
setProducts(nbaProducts);

// Extraer ligas y equipos de NBA
const nbaTeams = teamsFetched.filter((team) => team.league === "NBA");

const nbaLeagues: LeagueData[] = [];
const leagueMap = new Map<string, Set<string>>();

nbaTeams.forEach((team) => {
  if (!leagueMap.has(team.league)) {
    leagueMap.set(team.league, new Set<string>());
  }
  leagueMap.get(team.league)?.add(team.name);
});

leagueMap.forEach((teams, leagueName) => {
  nbaLeagues.push({
    name: leagueName,
    teams: Array.from(teams).sort((a, b) => a.localeCompare(b))
  });
});

      setDynamicLeagues(nbaLeagues);

      if (nbaLeagues.length > 0 && !selectedLeague) {
        setSelectedLeague(nbaLeagues[0].name);
      }

      setNoLeaguesAvailable(nbaLeagues.length === 0);
    } catch (error) {
      console.error("[NBAPage] Error al cargar NBA:", error);
      setProducts([]);
      setNoLeaguesAvailable(true);
    }
  }

  loadNBAData();
}, [selectedLeague]);

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
    // Buscar en las ligas dinámicas
    const teamLeague = dynamicLeagues.find((league) =>
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
      // Filtrar productos que tienen stock
      const productsWithStock = products.filter((product) => {
        // Verificar si el producto tiene la propiedad stock y al menos un talle con cantidad > 0
        if (product.stock) {
          return Object.values(product.stock).some(quantity => (quantity as number) > 0);
        }
        return false;
      });
      
      return productsWithStock.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
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
  
  // Adaptamos esto para usar dynamicLeagues en lugar de leagues
  const currentLeague = dynamicLeagues.find((l) => l.name === selectedLeague);
  
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
            <Filter className="text-lg" />
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

          {/* Botón Stock Express en menú móvil */}
<div className="mb-4">
  <StockExpressButton
    isSelected={selectedLeague === "STOCK_EXPRESS"}
    onClick={() => {
      handleLeagueClick("STOCK_EXPRESS");
      setIsFilterOpen(false);
    }}
  />
</div>

          {/* Equipos de la liga NBA */}
          {currentLeague && currentLeague.teams.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">Equipos de NBA</h3>
              <ul className="space-y-1 text-sm">
                {currentLeague.teams.map((team) => (
                  <li key={team}>
                    <button
                      onClick={() => handleTeamClick(team)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ring-1 ring-transparent ${
                        selectedTeam === team
                          ? "bg-black text-white ring-black"
                          : "hover:bg-gray-100 text-gray-800"
                      }`}
                    >
                      {team}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.aside>
  
        {/* Contenido principal */}
        <div>
          {/* Menú de filtros móvil */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="fixed inset-0 z-40 bg-white p-4 md:hidden"
                style={{ maxWidth: "280px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Filtros</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2"
                  >
                    ✕
                  </button>
                </div>
  
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-sm mb-2">
                      Buscar
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre o equipo..."
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
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-center px-3 py-2 rounded-lg bg-black text-white text-sm font-medium"
                    >
                      Ver todos los productos
                    </button>
                  </div>
  
                  {/* Stock Express Button */}
                  <div>
                  <StockExpressButton
  isSelected={selectedLeague === "STOCK_EXPRESS"}
  onClick={() => {
    handleLeagueClick("STOCK_EXPRESS");
    setIsFilterOpen(false);
  }}
/>
                  </div>
  
                  {/* Equipos de NBA */}
                  {currentLeague && currentLeague.teams.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Equipos de NBA
                      </h4>
                      <ul className="space-y-1">
                        {currentLeague.teams.map((team) => (
                          <li key={team}>
                            <button
                              onClick={() => {
                                handleTeamClick(team);
                                setIsFilterOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                                selectedTeam === team
                                  ? "bg-gray-200 font-medium"
                                  : ""
                              }`}
                            >
                              {team}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
  
          {/* Productos */}
          <div className="py-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {isStockExpress
                  ? "Camisetas NBA con Stock Express"
                  : selectedTeam
                  ? `Camisetas de ${selectedTeam}`
                  : selectedLeague && selectedLeague !== "STOCK_EXPRESS"
                  ? `Camisetas de ${selectedLeague}`
                  : searchTerm
                  ? `Resultados para "${searchTerm}"`
                  : "Camisetas de NBA"}
              </h2>
            </div>
  
            {productsToDisplay.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                {productsToDisplay.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : selectedTeam
                    ? `No hay camisetas disponibles de ${selectedTeam}`
                    : selectedLeague === "STOCK_EXPRESS"
                    ? "No hay camisetas NBA disponibles en stock actualmente"
                    : "No hay camisetas NBA disponibles en este momento"}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLeague("");
                    setSelectedTeam("");
                  }}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  
      <Footer />
  
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 md:right-8 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all z-30"
          aria-label="Volver arriba"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
  
    </section>
  );
}