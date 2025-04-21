//src/pages/FootballPage.tsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import products from "../data/products";
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
      "Manchester Utd", "Newcastle United", "Tottenham Hotspurs", "West Ham United",
      "Wolves FC"
    ],
  },
  {
    name: "La Liga",
    teams: [
      "Alaves", "Athletic Bilbao", "Atletico Madrid", "Barcelona", "Cadiz", "Celta",
      "Espanyol", "Getafe", "Girona", "Leganes", "Mallorca", "Osasuna", "Rayo Vallecas",
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

export default function FootballPage() {
  const [selectedLeague, setSelectedLeague] = useState("Premier League");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

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
        const nameMatch = product.name?.toLowerCase().includes(normalizedSearch);
        const teamMatch = product.team?.toLowerCase().includes(normalizedSearch);
        return nameMatch || teamMatch;
      });
    }

    if (selectedLeague === "STOCK_EXPRESS") {
      return [...stock].sort((a, b) => a.name.localeCompare(b.name));
    }

    return products.filter((product) => {
      const leagueMatches = selectedLeague ? product.league === selectedLeague : true;
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
      <>
        <motion.div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsFilterOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
        <motion.aside
  key="mobile-sidebar"
  initial={{ x: -300 }}
  animate={{ x: 0 }}
  exit={{ x: -300 }}
  transition={{ duration: 0.3 }}
  className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 p-6 overflow-y-auto shadow-lg"
>
  <button
    className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
    onClick={() => setIsFilterOpen(false)}
    aria-label="Cerrar filtro"
  >
    ×
  </button>

  <h3 className="font-bold mb-4">Filtrar por liga y equipo</h3>

  {/* ✅ Stock Express al tope del sidebar móvil */}
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

  <div className="space-y-4">
    {leagues.map((league) => (
      <div key={league.name}>
        <button
          onClick={() => {
            handleLeagueClick(league.name);
            setIsFilterOpen(false);
          }}
          className={`w-full text-left font-semibold px-3 py-2 rounded-lg transition ring-1 ring-transparent ${
            selectedLeague === league.name
              ? "bg-black text-white ring-black"
              : "hover:bg-gray-100"
          }`}
        >
          {league.name}
        </button>

        {selectedLeague === league.name && league.teams.length > 0 && (
          <ul className="mt-2 ml-2 space-y-1">
            {league.teams.map((team) => (
              <li key={team}>
                <button
                  onClick={() => {
                    handleTeamClick(team);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left text-sm px-3 py-1 rounded-md transition ring-1 ring-transparent ${
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
      </div>
    ))}
  </div>
</motion.aside>
      </>
    )}
  </AnimatePresence>

  {/* Contenido principal */}
  <div id="product-section">
    <Link
      to="/"
      className="inline-flex items-center text-sm text-gray-600 hover:text-black transition mb-0"
    >
      ← Volver al inicio
    </Link>

    <div id="stock-express" className="mb-0">
      {selectedLeague === "STOCK_EXPRESS" ? (
        <>
          <h2 className="text-3xl font-extrabold -mt-1 flex items-center gap-2">
            <Rocket size={24} className="text-red-600" />
            Stock Express
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Camisetas disponibles para entrega inmediata.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-extrabold -mt-1">{selectedLeague}</h2>
          <p className="text-sm text-gray-600 mb-6">
            {selectedTeam
              ? `Mostrando camisetas de ${selectedTeam}`
              : `Mostrando camisetas disponibles por liga o equipo`}
          </p>
        </>
      )}
    </div>

    <motion.div
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {productsToDisplay.map((product) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.4 }}
          className="hover:scale-105 transition-transform duration-300 ease-in-out rounded-xl shadow-md overflow-hidden"
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  </div>
</div>

{showScrollTop && (
  <button
    onClick={scrollToTop}
    className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg hover:bg-black/80 transition z-50"
  >
    <ArrowUp className="w-5 h-5" />
  </button>
)}

<Footer />
    </section>
  );
}