// src/components/CategorySection.tsx

import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CategorySection() {
  const navigate = useNavigate();

  const categories = [
    { name: "Fútbol", image: "/images/categories/futbol.jpg", href: "/shop?filter=futbol" },
    { name: "NBA", image: "/images/categories/nba.jpg", href: "/shop?filter=nba" },
    { name: "Niños", image: "/images/categories/kids.jpg", href: "/shop?filter=kids" },
  ];

  return (
    <section
      id="categorias"
      className="pt-12 pb-20 text-center scroll-mt-16 bg-[#0F0F0F] text-white"
    >
      <Helmet>
        <title>Categorías | Tu Casaca Deportiva</title>
        <meta
          name="description"
          content="Explorá camisetas por categoría: Fútbol, NBA y Niños. Temporada 25/26 y retro en Tu Casaca Deportiva."
        />
        <meta name="keywords" content="camisetas, futbol, nba, niños, retro, 25/26" />
      </Helmet>

      <motion.p
        className="text-sm uppercase text-[#3B82F6] tracking-widest mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        explorá la tienda
      </motion.p>

      <h2 className="text-3xl sm:text-5xl font-extrabold mb-10 leading-tight">
        Explorar por categoría
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {categories.map(({ name, image, href }) => (
          <motion.div
            key={name}
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate(href)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(href)}
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg ring-1 ring-white/10 transition-transform duration-500 hover:scale-105 active:scale-95 cursor-pointer h-72 bg-white"
          >
            <img
              src={image}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-2xl sm:text-3xl font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]">
                {name}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}