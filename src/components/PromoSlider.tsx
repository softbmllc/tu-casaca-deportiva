// src/components/PromoSlider.tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Autoplay, Navigation, Mousewheel } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './promo-slider.css';

export default function PromoSlider() {
  const { t } = useTranslation();
  const slides = [
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-56_hqtx6c.png',
      mobileMediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-59_xlqftg.png',
      title: () => t('promoSlider.slide1.title'),
      subtitle: () => t('promoSlider.slide1.subtitle'),
      link: '/shop',
    },
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-58_qr44kj.png',
      mobileMediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-60_qy2tkk.png',
      title: () => t('promoSlider.slide2.title'),
      subtitle: () => t('promoSlider.slide2.subtitle'),
      link: '/shop',
    },
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/FUXION1_yg6uvv.mp4',
      title: () => t('promoSlider.slide3.title'),
      subtitle: () => t('promoSlider.slide3.subtitle'),
      link: '/shop',
    },
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-65_ftkc26.png',
      mobileMediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-66_lyqs50.png',
      title: () => t('promoSlider.slide5.title'),
      subtitle: () => t('promoSlider.slide5.subtitle'),
      link: '/shop',
    },
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-55_qz5p07.png',
      mobileMediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-67_njrzl9.png',
      title: () => t('promoSlider.slide6.title'),
      subtitle: () => t('promoSlider.slide6.subtitle'),
      link: '/shop',
    },
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-70_za6sv3.png',
      mobileMediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-68_tuhlur.png',
      title: () => t('promoSlider.slide8.title'),
      subtitle: () => t('promoSlider.slide8.subtitle'),
      link: '/shop',
    },
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/DW2_tmu2z6.png',
      mobileMediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-64_dztsni.png',
      title: () => t('promoSlider.slide10.title'),
      subtitle: () => t('promoSlider.slide10.subtitle'),
      link: '/shop',
    },
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/DW5_flishp.mp4',
      title: () => t('promoSlider.slide11.title'),
      subtitle: () => t('promoSlider.slide11.subtitle'),
      link: '/shop',
    },
    {
      mediaUrl: 'https://ik.imagekit.io/devrodri/DW4_j7smok.png',
      mobileMediaUrl: 'https://ik.imagekit.io/devrodri/Disen%CC%83o_sin_ti%CC%81tulo-62_rykr8h.png',
      title: () => t('promoSlider.slide12.title'),
      subtitle: () => t('promoSlider.slide12.subtitle'),
      link: '/shop',
    },
  ];
  const swiperRef = useRef<any>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePrev = () => {
    if (swiperRef.current) swiperRef.current.slidePrev();
  };
  const handleNext = () => {
    if (swiperRef.current) swiperRef.current.slideNext();
  };

  return (
    <section className="relative w-full bg-black">
      <Swiper
        modules={[Pagination, Autoplay, Navigation, Mousewheel]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={false}
        loop
        touchRatio={1.5}
        resistanceRatio={0}
        speed={450}
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
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        className="h-[80vh] promo-slider"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              {slide.mediaUrl.endsWith('.mp4') ? (
                <video
                  src={slide.mediaUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={isMobile && slide.mobileMediaUrl ? slide.mobileMediaUrl : slide.mediaUrl}
                  alt={slide.title()}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <motion.div
                className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)] tracking-tight">
                  {slide.title()}
                </h2>
                <p className="text-lg sm:text-xl font-light text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] mb-6">
                  {slide.subtitle()}
                </p>
                <Link
                  to={slide.link}
                  className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:scale-105 transition-all"
                >
                  {t('promoSlider.cta')}
                </Link>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}

        {/* Flechas custom (ocultas en mobile) */}
        <button
          onClick={handlePrev}
          className="custom-nav-btn custom-prev hidden sm:flex absolute top-1/2 left-4 z-20 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all duration-300 shadow-lg"
          aria-label="Anterior"
        >
          <ChevronLeft className="text-white" size={28} />
        </button>
        <button
          onClick={handleNext}
          className="custom-nav-btn custom-next hidden sm:flex absolute top-1/2 right-4 z-20 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all duration-300 shadow-lg"
          aria-label="Siguiente"
        >
          <ChevronRight className="text-white" size={28} />
        </button>
      </Swiper>
    </section>
  );
}