//components/CategorySection.tsx
import { Helmet } from "react-helmet-async";

export default function CategorySection() {
  return (
    <section
      className="py-20 bg-gray-100 text-center scroll-mt-16"
      id="categorias"
    >
      <Helmet>
        <title>Categorías | Tu Casaca Deportiva</title>
        <meta
          name="description"
          content="Explorá camisetas de fútbol y NBA. Elegí tu categoría favorita y encontrá los diseños más recientes."
        />
        <meta
          name="keywords"
          content="camisetas de fútbol, camisetas NBA, ropa deportiva, fútbol 2024 2025, Lakers, Peñarol, Nacional, NBA jerseys 2024, Tu Casaca Deportiva Uruguay Miami"
        />
      </Helmet>

      <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-gray-900">
        Explorá por categoría
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-16 max-w-5xl lg:max-w-6xl mx-auto px-6">
        {/* Fútbol */}
        <a
          href="/futbol"
          aria-label="Ver camisetas de fútbol"
          className="group relative rounded-2xl overflow-hidden shadow-xl transition-transform duration-500 hover:scale-105"
        >
          <img
            src="/images/categoria-futbol.jpg"
            alt="Fútbol"
            className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-75"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white text-2xl font-semibold tracking-wide drop-shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-105">
              FÚTBOL
            </span>
          </div>
        </a>

        {/* NBA */}
        <a
          href="#catalogo"
          aria-label="Ver camisetas NBA"
          className="group relative rounded-2xl overflow-hidden shadow-xl transition-transform duration-500 hover:scale-105"
        >
          <img
            src="/images/categoria-nba.jpg"
            alt="NBA"
            className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-75"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white text-2xl font-semibold tracking-wide drop-shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-105">
              NBA
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}