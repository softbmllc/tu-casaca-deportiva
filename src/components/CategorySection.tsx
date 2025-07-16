// src/components/CategorySection.tsx

import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LuGamepad2, LuMonitorPlay, LuPackageSearch } from "react-icons/lu";

export default function CategorySection() {
  const navigate = useNavigate();

  const categories = [
    { name: 'PlayStation', image: '/images/logos/playstation.png', href: '/shop?category=PlayStation' },
    { name: 'Xbox', image: '/images/logos/xbox.png', href: '/shop?category=Xbox' },
    { name: 'Nintendo', image: '/images/logos/nintendo.png', href: '/shop?category=Nintendo' },
    { name: 'Portátiles', image: '/images/logos/portatiles.png', href: '/shop?category=Portátiles' },
    { name: 'Retro / Otros', image: '/images/logos/retro.png', href: '/shop?category=Retro' },
    { name: 'Coleccionables', image: '/images/logos/coleccionables.png', href: '/shop?category=Coleccionables' },
  ];

  return (  
    <section
      id="catalogo"
      className="pt-10 pb-16 sm:pt-12 sm:pb-20 text-center scroll-mt-16 bg-[#0F0F0F]"
>
      <Helmet>
        <title>Categorías | Mutter Games</title>
        <meta name="keywords" content="juegos, consolas, coleccionables, PlayStation, Xbox, Nintendo, retro" />
        <meta name="description" content="Explorá nuestras categorías de consolas y coleccionables. PlayStation, Xbox, Nintendo, retro y más en Mutter Games." />
      </Helmet>

      <motion.p
        className="text-sm uppercase text-[#FF2D55] tracking-widest mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        explorá tu universo gamer
      </motion.p>

      <h2 className="text-4xl sm:text-6xl font-extrabold text-center mb-10 tracking-tight text-[#FF2D55] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] leading-tight transition-all duration-700">
        Explorar por categoría
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {categories.map(({ name, image, href }, idx) => (
          <motion.div
            key={name}
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onClick={() => navigate(href)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(href)}
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg ring-1 ring-white/10 transition-transform duration-500 hover:scale-105 active:scale-95 cursor-pointer h-72 bg-white group-hover:ring-2 group-hover:ring-[#FF2D55]"
          >
            <div className="absolute inset-0">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
              />
            </div>
            {idx >= 3 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-center">
                <p className="text-white text-4xl font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.75)] mb-2 leading-tight flex items-center gap-4 justify-center">
                  {idx === 3 && <LuGamepad2 className="text-4xl" />}
                  {idx === 4 && <LuMonitorPlay className="text-4xl" />}
                  {idx === 5 && <LuPackageSearch className="text-4xl" />}
                  {idx === 5 ? (
                    <>
                      Coleccionables<br />y más
                    </>
                  ) : (
                    name
                  )}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}