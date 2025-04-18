import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
//src/pages/FootballPage.tsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import { FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";
import CartIcon from "../components/CartIcon";
import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
    const handleLeagueClick = (league) => {
        setSelectedLeague(league);
        setSelectedTeam("");
        setSearchTerm("");
        setIsFilterOpen(false);
    };
    const handleTeamClick = (team) => {
        const teamLeague = leagues.find((league) => league.teams.includes(team))?.name;
        if (teamLeague) {
            setSelectedLeague(teamLeague);
        }
        setSelectedTeam(team);
        setSearchTerm("");
        setIsFilterOpen(false);
    };
    const getFilteredProducts = () => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (normalizedSearch !== "") {
            return products.filter((product) => {
                const nameMatch = product.name?.toLowerCase().includes(normalizedSearch);
                const teamMatch = product.team?.toLowerCase().includes(normalizedSearch);
                return nameMatch || teamMatch;
            });
        }
        return products.filter((product) => {
            const leagueMatches = selectedLeague ? product.league === selectedLeague : true;
            const teamMatches = selectedTeam ? product.team === selectedTeam : true;
            return leagueMatches && teamMatches;
        });
    };
    const productsToDisplay = getFilteredProducts();
    const currentLeague = leagues.find((l) => l.name === selectedLeague);
    return (_jsxs("section", { className: "bg-[#f9f9f9] text-black min-h-screen", children: [_jsxs(Helmet, { children: [_jsx("title", { children: "Camisetas de F\u00FAtbol | Tu Casaca Deportiva" }), _jsx("meta", { name: "description", content: "Descubr\u00ED camisetas de f\u00FAtbol de todas las ligas: Premier League, La Liga, Serie A, Bundesliga, Retro y m\u00E1s. Personalizalas con nombre y n\u00FAmero. Env\u00EDos desde Miami a todo Uruguay." }), _jsx("meta", { name: "keywords", content: "camisetas de f\u00FAtbol, Premier League, La Liga, camiseta retro, camisetas originales, camisetas Uruguay, Tu Casaca Deportiva" }), _jsx("link", { rel: "canonical", href: "https://tucasacadeportiva.com/futbol" }), _jsx("meta", { property: "og:title", content: "Camisetas de F\u00FAtbol | Tu Casaca Deportiva" }), _jsx("meta", { property: "og:description", content: "Descubr\u00ED camisetas de todas las ligas: Premier League, La Liga, Serie A, y m\u00E1s. Stock real y personalizaci\u00F3n disponible." }), _jsx("meta", { property: "og:image", content: "https://tucasacadeportiva.com/images/futbol-banner.jpg" }), _jsx("meta", { property: "og:url", content: "https://tucasacadeportiva.com/futbol" }), _jsx("meta", { property: "og:type", content: "website" })] }), _jsxs("div", { className: "relative w-full h-64 sm:h-96 overflow-hidden", children: [_jsx("img", { src: "/images/futbol-banner.jpg", alt: "Banner general de f\u00FAtbol", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/20" })] }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 relative", children: [_jsx("div", { className: "absolute right-2 top-0 translate-y-20 sm:translate-y-9 sm:right-0 z-50", children: _jsx(CartIcon, { variant: "hero" }) }), _jsxs("div", { className: "flex justify-between sm:hidden mt-4 mb-2 gap-2", children: [_jsxs("button", { onClick: () => setIsFilterOpen(!isFilterOpen), className: "flex-1 flex items-center justify-center gap-2 text-sm text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition", children: [_jsx(FiFilter, { className: "text-lg" }), "Filtros"] }), _jsx("button", { onClick: () => {
                                    setSelectedLeague("");
                                    setSelectedTeam("");
                                    setSearchTerm("");
                                    setIsFilterOpen(false);
                                }, className: "flex-1 text-sm text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition", children: "Ver TODO" })] })] }), _jsxs("div", { className: "md:grid md:grid-cols-[250px_1fr] max-w-7xl mx-auto p-6 gap-8", children: [_jsxs(motion.aside, { className: "hidden md:block space-y-6 pr-6 border-r border-gray-200", initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.5 }, children: [_jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-sm mb-2", htmlFor: "search", children: "Buscar por nombre" }), _jsx("input", { id: "search", type: "text", placeholder: "Ej: Manchester United", className: "w-full border px-3 py-2 rounded-lg text-sm", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsx("div", { children: _jsx("button", { onClick: () => {
                                        setSearchTerm("");
                                        setSelectedLeague("");
                                        setSelectedTeam("");
                                    }, className: `w-full text-left px-3 py-2 rounded-lg transition ring-1 ring-transparent text-sm font-semibold ${selectedLeague === "" && selectedTeam === ""
                                        ? "bg-black text-white ring-black"
                                        : "hover:bg-gray-100 text-gray-800"}`, children: "Ver todo" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-2", children: "Categor\u00EDas" }), _jsx("ul", { className: "space-y-1 text-sm", children: leagues.map((league) => (_jsxs("li", { children: [_jsx("button", { onClick: () => handleLeagueClick(league.name), className: `w-full text-left px-3 py-2 rounded-lg transition ring-1 ring-transparent ${selectedLeague === league.name
                                                        ? "bg-black text-white font-semibold ring-black"
                                                        : "hover:bg-gray-100"}`, children: league.name }), selectedLeague === league.name && league.teams.length > 0 && (_jsx("ul", { className: "ml-4 mt-2 space-y-1", children: league.teams.map((team) => (_jsx("li", { children: _jsx("button", { onClick: () => {
                                                                setSelectedTeam(team);
                                                                setSelectedLeague(league.name);
                                                            }, className: `text-sm px-2 py-1 rounded-md w-full text-left transition ring-1 ring-transparent ${selectedTeam === team
                                                                ? "bg-gray-900 text-white ring-gray-900"
                                                                : "hover:bg-gray-200"}`, children: team }) }, team))) }))] }, league.name))) })] })] }), _jsx(AnimatePresence, { children: isFilterOpen && (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "fixed inset-0 bg-black/40 z-40", onClick: () => setIsFilterOpen(false), initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }), _jsxs(motion.aside, { initial: { x: -300 }, animate: { x: 0 }, exit: { x: -300 }, transition: { duration: 0.3 }, className: "fixed top-0 left-0 bottom-0 w-64 bg-white z-50 p-6 overflow-y-auto shadow-lg", children: [_jsx("button", { className: "absolute top-4 right-4 text-gray-500 hover:text-black text-xl", onClick: () => setIsFilterOpen(false), "aria-label": "Cerrar filtro", children: "\u00D7" }), _jsx("h3", { className: "font-bold mb-4", children: "Filtrar por liga y equipo" }), _jsx("div", { className: "space-y-4", children: leagues.map((league) => (_jsxs("div", { children: [_jsx("button", { onClick: () => {
                                                            handleLeagueClick(league.name);
                                                            setIsFilterOpen(false);
                                                        }, className: `w-full text-left font-semibold px-3 py-2 rounded-lg transition ring-1 ring-transparent ${selectedLeague === league.name
                                                            ? "bg-black text-white ring-black"
                                                            : "hover:bg-gray-100"}`, children: league.name }), selectedLeague === league.name && league.teams.length > 0 && (_jsx("ul", { className: "mt-2 ml-2 space-y-1", children: league.teams.map((team) => (_jsx("li", { children: _jsx("button", { onClick: () => {
                                                                    handleTeamClick(team);
                                                                    setIsFilterOpen(false);
                                                                }, className: `w-full text-left text-sm px-3 py-1 rounded-md transition ring-1 ring-transparent ${selectedTeam === team
                                                                    ? "bg-gray-900 text-white ring-gray-900"
                                                                    : "hover:bg-gray-200"}`, children: team }) }, team))) }))] }, league.name))) })] }, "mobile-sidebar")] })) }), _jsxs("div", { id: "product-section", children: [_jsx(Link, { to: "/", className: "inline-flex items-center text-sm text-gray-600 hover:text-black transition mb-0", children: "\u2190 Volver al inicio" }), _jsx("h2", { className: "text-3xl font-extrabold -mt-1", children: selectedLeague }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: selectedTeam
                                    ? `Mostrando camisetas de ${selectedTeam}`
                                    : `Mostrando camisetas disponibles por liga o equipo` }), _jsx(motion.div, { className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-3", initial: "hidden", animate: "visible", variants: {
                                    hidden: {},
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.1,
                                        },
                                    },
                                }, children: productsToDisplay.map((product) => (_jsx(motion.div, { variants: {
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }, transition: { duration: 0.4 }, className: "hover:scale-105 transition-transform duration-300 ease-in-out rounded-xl shadow-md overflow-hidden", children: _jsx(ProductCard, { product: product }) }, product.id))) })] })] }), showScrollTop && (_jsx("button", { onClick: scrollToTop, className: "fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg hover:bg-black/80 transition z-50", children: _jsx(ArrowUp, { className: "w-5 h-5" }) }))] }));
}
