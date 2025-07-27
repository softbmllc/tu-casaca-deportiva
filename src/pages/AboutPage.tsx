// src/pages/AboutPage.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t, i18n } = useTranslation();

  return (
    <section className="bg-white py-24 px-6 shadow-sm" data-aos="fade-up">
      <div className="max-w-2xl mx-auto text-center text-gray-800">
        <h1 className="text-4xl font-bold mb-10 tracking-tight">Nuestra historia</h1>

        <p className="text-lg leading-relaxed mb-5">
          Somos una tienda uruguaya con más de 20 años de experiencia en el comercio. Comenzamos en ferias barriales de La Teja a fines de los 90, cuando vender era tan simple como armar un puesto y atender con ganas.
        </p>
        <p className="text-lg leading-relaxed mb-5">
          Luego abrimos uno de los primeros cibercafés del barrio, y con los años fuimos adaptándonos a las nuevas formas de vender. Hoy seguimos ese mismo espíritu, pero en el mundo digital.
        </p>
        <p className="text-lg leading-relaxed mb-10">
          Con miles de ventas concretadas a través de MercadoLibre y una comunidad que confía en nuestros productos, damos un paso más: lanzamos nuestra tienda online para brindar una experiencia más directa, rápida y profesional.
        </p>


        <a
          href="/shop"
          className="inline-block bg-[#FF2D55] text-white font-semibold px-6 py-3 rounded-md hover:bg-red-700 transition"
        >
          Ver Tienda
        </a>
      </div>
    </section>
  );
};

export default AboutPage;