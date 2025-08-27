// src/components/AboutPreview.tsx

import { FaGlobe, FaTshirt, FaWhatsapp } from 'react-icons/fa';

export default function AboutPreview() {
  return (
    <section className="bg-[#0F0F0F] py-20 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs md:text-sm text-[#3B82F6] uppercase tracking-widest mb-5">
          TU CASACA DEPORTIVA
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Casacas de Fútbol y NBA
        </h2>
        <p className="text-base md:text-lg text-white leading-relaxed">
          En Tu Casaca Deportiva ofrecemos casacas de calidad premium — temporada 25/26 y también camisetas retro de todas las épocas. Envíos a todo Uruguay y atención personalizada por WhatsApp.
        </p>
        <div className="mt-5 flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <FaGlobe className="text-[#3B82F6]" /> <span>Envíos a todo el país</span>
          </div>
          <div className="flex items-center gap-2">
            <FaTshirt className="text-[#3B82F6]" /> <span>Personalización disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-[#3B82F6]" /> <span>Atención por WhatsApp e Instagram</span>
          </div>
        </div>
        <div className="mt-8">
          <a
            href="/about"
            className="inline-block px-6 py-3 bg-[#3B82F6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-md transition"
          >
            Conocé más sobre nosotros
          </a>
        </div>
      </div>
    </section>
  );
}