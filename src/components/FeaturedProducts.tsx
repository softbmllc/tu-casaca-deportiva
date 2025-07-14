// src/components/FeaturedProducts.tsx

import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import products from "../data/products";
import ProductCard from "./ProductCard";
import { getFinalPrice } from "../utils/priceUtils";

export default function FeaturedProducts() {
  return (
    <section id="catalogo" className="bg-white text-black py-16 px-6">
      <Helmet>
        <title>Productos destacados | Tu Casaca Deportiva</title>
        <meta
          name="description"
          content="Descubrí nuestras camisetas destacadas de fútbol y básquet. Calidad, estilo y envío rápido en Tu Casaca Deportiva."
        />
        <meta
          name="keywords"
          content="camisetas fútbol, camisetas básquet, Nacional, Peñarol, Boca, River, Lakers, Warriors, Inter Miami, camisetas 2024 2025"
        />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-gray-900">
          Productos destacados
        </h2>

        <motion.div
          className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {products.slice(0, 8).map((product) => {
            const priceUYU = getFinalPrice(product, "UYU");
            const priceUSD = getFinalPrice(product, "USD");
            return (
              <ProductCard
                key={product.id}
                product={{ ...product, priceUYU, priceUSD }}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}