// src/pages/AboutPage.tsx

import React from 'react';
import Footer from '../components/Footer';
import { FaGlobe, FaTshirt, FaWhatsapp, FaFutbol, FaBasketballBall } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="bg-[#0F0F0F] text-white min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="flex items-center justify-center gap-2 text-[#3B82F6] uppercase tracking-widest">
            <FaFutbol className="text-[#3B82F6]" /> TU CASACA DEPORTIVA <FaBasketballBall className="text-[#3B82F6]" />
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold">Nuestra historia</h1>

          <div className="mt-6 space-y-5 text-base md:text-lg text-white/85 leading-relaxed">
            <p>
              Tu Casaca Deportiva nació con una misión clara: llevar la pasión del fútbol y la NBA a cada rincón de Uruguay. 
              Somos una tienda online especializada en casacas de calidad premium, retro y actuales, con diseños de temporada y modelos históricos que marcaron época.
            </p>
            <p>
              Cada camiseta refleja la esencia del deporte: identidad, orgullo y pertenencia. Apostamos por la calidad, la confianza y un servicio rápido y cercano. 
              Desde nuestras redes y con el apoyo de una comunidad creciente, buscamos que cada cliente viva la experiencia de estrenar su casaca favorita como si estuviera entrando a la cancha.
            </p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-white/60">
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

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/shop"
              className="inline-block bg-[#3B82F6] text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Ver tienda
            </a>
            <a
              href="https://www.instagram.com/tucasacadeportiva.uy/"
              className="border border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-white hover:text-[#3B82F6] transition"
            >
              Instagram
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;