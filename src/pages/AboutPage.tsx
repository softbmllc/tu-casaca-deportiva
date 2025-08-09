// src/pages/AboutPage.tsx

import React from 'react';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="bg-[#0F0F0F] text-white min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-[#FF2D55] uppercase tracking-widest">MUTTER GAMES · COLECCIONABLES</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold">Nuestra historia</h1>

          <div className="mt-6 space-y-5 text-base md:text-lg text-white/85 leading-relaxed">
            <p>
              Somos una tienda uruguaya con más de 20 años de experiencia en el comercio. Comenzamos en ferias barriales de La Teja a fines de los 90, cuando vender era tan simple como armar un puesto y atender con ganas.
            </p>
            <p>
              Luego abrimos uno de los primeros cibercafés del barrio, y con los años fuimos adaptándonos a las nuevas formas de vender. Hoy seguimos ese mismo espíritu, pero en el mundo digital.
            </p>
            <p>
              Con miles de ventas concretadas a través de MercadoLibre y una comunidad que confía en nuestros productos, damos un paso más: lanzamos nuestra tienda online para brindar una experiencia más directa, rápida y profesional.
            </p>
          </div>

          <div className="mt-8 text-sm text-white/60">
            +1.000 ventas verificadas · Envíos a todo el país · Soporte por WhatsApp
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/shop"
              className="inline-block bg-[#FF2D55] text-white font-semibold px-6 py-3 rounded-md hover:bg-red-700 transition"
            >
              Ver tienda
            </a>
            <a
              href="https://www.instagram.com/muttergames/"
              className="border border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-white hover:text-[#FF2D55] transition"
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