// src/components/Hero.tsx
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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

  const slides = [
    {
      key: "consolas",
      image: "/images/Slide1.jpg",
      tagline: "Consolas, Juegos y Accesorios",
      headline1: "Todo para tu consola",
      headline2: "Desde PS1 hasta Nintendo Switch",
      description: "Explorá nuestra colección de juegos, consolas y accesorios: PS5, Xbox, Nintendo, portátiles y más.",
      button: "Ver tienda",
    },
    {
      key: "coleccionables",
      image: "/images/Slide2.jpg",
      tagline: "Películas, música y nostalgia",
      headline1: "Coleccionables originales",
      headline2: "DVDs, vinilos, muñecos y más",
      description: "DVDs, Blu-ray, cassettes, vinilos, muñecos de acción, libros y más. Solo lo auténtico.",
      button: "Explorar colección",
    },
    {
      key: "envios",
      image: "/images/Slide3.jpg",
      mobileImage: "/images/Slide3-mobile.jpg",
      tagline: "Comprá desde donde estés",
      headline1: "Envíos rápidos y seguros",
      headline2: "A todo el país",
      description: (
        <>
          Más de 20 años de experiencia en el mundo gamer. <br />
          Ahora, tu tienda gamer confiable está online.
        </>
      ),
      button: "Comprar ahora",
    },
  ];

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden pt-[32px] sm:pt-0 md:pt-0 xl:pt-0">

      {/* Removed backgroundImage div as no video or background is used */}
      <div className="absolute inset-0 z-0 bg-neutral-50"></div>

      {/* CONTENIDO */}
      <Swiper
        modules={[Pagination, Autoplay, Navigation, Mousewheel]}
        pagination={{
          clickable: true,
        }}
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
        mousewheel={{
          forceToAxis: true,
          sensitivity: 1.5,
          releaseOnEdges: true,
        }}
        className="relative z-10 w-full max-w-[1920px] mx-auto px-0 text-center"
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => {
          setTimeout(() => {
            setActiveIndex(swiper.realIndex);
          }, 50);
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.key}>
            <div
              className={
                slide.key === "envios"
                  ? "relative w-full h-[100vh] bg-cover bg-right-top"
                  : "relative w-full h-[100vh] bg-cover bg-center"
              }
              style={{ backgroundImage: `url(${
                windowWidth && windowWidth < 768 && slide.mobileImage ? slide.mobileImage : slide.image
              })` }}
            >
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 bg-black/40"
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
                  <div
                    onClick={() => window.location.href = "/shop"}
                    className="bg-[#FF2D55] hover:bg-[#cc2444] text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none appearance-none cursor-pointer"
                  >
                    {slide.button}
                  </div>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>
        {`
          .swiper-pagination-bullet {
            background: #0C2E63;
            opacity: 0.4;
          }
          .swiper-pagination-bullet-active {
            background: #0C2E63;
            opacity: 1;
          }
          .swiper-pagination {
            position: relative;
            z-index: 999 !important;
            pointer-events: auto;
          }
        `}
      </style>
      <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 z-[999]" />
    </section>
  );
}
