// src/components/Hero.tsx

import { motion } from "framer-motion";
import { ChevronDown, CreditCard, Truck, Store, MessageSquare, Lock } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { useRef, useState, useEffect } from 'react';

export default function HeroSection() {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  // --- TCD Slides (Fútbol / NBA / Niños) ---
  const slides = [
    {
      key: "futbol",
      image: "/hero-futbol.jpg",
      mobileImage: "/hero-futbol-mobile.jpg",
      tagline: "Temporada 25/26",
      headline1: "FÚTBOL",
      headline2: "Clubes y Selecciones",
      description: "Camisetas y kits 25/26, además de ediciones retro de todas las épocas. Personalización con nombre y número.",
      button: "Ver Fútbol",
      ctaHref: "/futbol",
    },
    {
      key: "nba",
      image: "/hero-nba.jpg",
      mobileImage: "/hero-nba-mobile.jpg",
      tagline: "Nueva temporada",
      headline1: "NBA",
      headline2: "Equipaciones y Lifestyle",
      description: "Equipaciones NBA para fan y juego. Materiales premium.",
      button: "Ver NBA",
      ctaHref: "/nba",
    },
    {
      key: "ninos",
      image: "/hero-kids.jpg",
      mobileImage: "/hero-kids-mobile.jpg",
      tagline: "Kids Collection",
      headline1: "NIÑOS",
      headline2: "Conjuntos y Camperas",
      description: "Conjuntos, camperas y kits de equipos y selecciones.",
      button: "Ver Niños",
      ctaHref: "/ninos",
    },
  ];

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden m-0 p-0">
      {/* SLIDER */}
      <Swiper
        modules={[Pagination, Autoplay, Navigation, Mousewheel]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        loop
        touchRatio={1.5}
        resistanceRatio={0}
        speed={500}
        threshold={5}
        followFinger={true}
        grabCursor={true}
        shortSwipes={true}
        longSwipesRatio={0.2}
        mousewheel={{ forceToAxis: true, sensitivity: 1.5, releaseOnEdges: true }}
        className="relative z-10 w-screen text-center"
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => { setTimeout(() => { setActiveIndex(swiper.realIndex); }, 50); }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.key} className="h-screen mb-0">
            {/* Desktop */}
            <div
              className="relative w-screen h-screen bg-cover bg-center hidden md:block"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 bg-black/50 h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <span className="uppercase text-base sm:text-lg tracking-widest font-semibold text-white mb-4">
                  {slide.tagline}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-[2.5rem] lg:text-6xl font-extrabold text-white mb-2 leading-tight">
                  <span>{slide.headline1}</span><br />
                  <span>{slide.headline2}</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-6 max-w-2xl">
                  {slide.description}
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => (window.location.href = slide.ctaHref)}
                    className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:opacity-90 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none cursor-pointer"
                  >
                    {slide.button}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Mobile */}
            <div
              className="relative w-screen h-screen bg-cover bg-center block md:hidden"
              style={{ backgroundImage: `url(${slide.mobileImage || slide.image})` }}
            >
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 bg-black/50 h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <span className="uppercase text-base sm:text-lg tracking-widest font-semibold text-white mb-4">
                  {slide.tagline}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-[2.5rem] lg:text-6xl font-extrabold text-white mb-2 leading-tight">
                  <span>{slide.headline1}</span><br />
                  <span>{slide.headline2}</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-6 max-w-2xl">
                  {slide.description}
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => (window.location.href = slide.ctaHref)}
                    className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:opacity-90 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none cursor-pointer"
                  >
                    {slide.button}
                  </button>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Trust Row debajo del hero */}
      <div className="w-full bg-white/95 backdrop-blur border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-5 flex flex-wrap items-center justify-center gap-3 md:gap-6 text-sm text-gray-900">
          <div className="inline-flex items-center gap-2">
            <CreditCard className="w-4 h-4 opacity-80" />
            <span className="font-medium">Cuotas con Mercado Pago</span>
          </div>
          <span className="hidden md:block h-4 w-px bg-gray-300/80" />
          <div className="inline-flex items-center gap-2">
            <Truck className="w-4 h-4 opacity-80" />
            <span className="font-medium">Envío 24–48 h</span>
          </div>
          <span className="hidden md:block h-4 w-px bg-gray-300/80" />
          <div className="inline-flex items-center gap-2">
            <Store className="w-4 h-4 opacity-80" />
            <span className="font-medium">Retiro hoy</span>
          </div>
          <span className="hidden md:block h-4 w-px bg-gray-300/80" />
          <div className="inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4 opacity-80" />
            <span className="font-medium">WhatsApp 1–3 min</span>
          </div>
        </div>
      </div>

      {/* Sello / Confianza */}
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-5 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 text-[11px] font-extrabold rounded bg-white text-black border border-black">TCD</span>
              <div className="text-white">
                <p className="text-sm md:text-base font-semibold leading-snug">
                  Compra protegida con Mercado Pago
                </p>
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <p className="text-xs md:text-sm text-gray-200/80 leading-snug">
                    Soporte por WhatsApp en minutos
                  </p>
                  <p className="text-xs md:text-sm text-gray-200/80 leading-snug flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Pagos seguros
                  </p>
                </div>
              </div>
            </div>
            <a
              href="https://www.instagram.com/tucasacadeportiva.uy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold underline underline-offset-2 hover:opacity-80 text-white"
            >
              Seguinos en Instagram ↗
            </a>
          </div>
        </div>
      </div>

      <style>
        {`
          .swiper-pagination-bullet {
            background: #ffffff;
            opacity: 0.5;
          }
          .swiper-pagination-bullet-active {
            background: #ffffff;
            opacity: 1;
          }
          .swiper-pagination {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            z-index: 20;
            display: flex;
            justify-content: center;
            gap: 12px;
            pointer-events: auto;
          }
        `}
      </style>
    </section>
  );
}
