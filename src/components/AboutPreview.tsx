// src/components/AboutPreview.tsx

export default function AboutPreview() {
  return (
    <section className="bg-[#0F0F0F] py-20 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs md:text-sm text-[#22D3EE] uppercase tracking-widest mb-5">
          TU CASACA DEPORTIVA
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Casacas de Fútbol y NBA
        </h2>
        <p className="text-base md:text-lg text-white leading-relaxed">
          En Tu Casaca Deportiva ofrecemos casacas importadas de calidad premium. Temporada 25/26 y también camisetas retro de todas las épocas. Calidad garantizada, envíos a todo Uruguay y atención personalizada por WhatsApp.
        </p>
        <div className="mt-8">
          <a
            href="/about"
            className="inline-block px-6 py-3 bg-[#22D3EE] hover:bg-[#0ea5b7] text-white text-sm font-semibold rounded-md transition"
          >
            Conocé más sobre nosotros
          </a>
        </div>
      </div>
    </section>
  );
}