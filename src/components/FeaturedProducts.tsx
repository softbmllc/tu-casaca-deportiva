import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

interface Product {
  id: number;
  name: string;
  priceUSD: string;
  priceUYU: string;
  image: string;
  category: "Fútbol" | "NBA";
}

const products: Product[] = [
  {
    id: 1,
    name: "Nacional 24/25 Local",
    priceUSD: "$39",
    priceUYU: "$1.500",
    image: "/images/uruguay/nacional-home-24-25.jpg",
    category: "Fútbol",
  },
  {
    id: 2,
    name: "Peñarol 24/25 Local",
    priceUSD: "$39",
    priceUYU: "$1.500",
    image: "/images/uruguay/penarol-home-24-25.jpg",
    category: "Fútbol",
  },
  {
    id: 3,
    name: "Boca Juniors 24/25",
    priceUSD: "$39",
    priceUYU: "$1.500",
    image: "/images/argentina/boca-home-24-25.jpg",
    category: "Fútbol",
  },
  {
    id: 4,
    name: "River Plate 24/25",
    priceUSD: "$39",
    priceUYU: "$1.500",
    image: "/images/argentina/river-home-24-25.jpg",
    category: "Fútbol",
  },
  {
    id: 5,
    name: "Real Madrid 24/25",
    priceUSD: "$39",
    priceUYU: "$1.500",
    image: "/images/laliga/rma-local-24-25.jpg",
    category: "Fútbol",
  },
  {
    id: 6,
    name: "Inter Miami Especial 24/25",
    priceUSD: "$39",
    priceUYU: "$1.500",
    image: "/images/intermiami-third-24-25.jpg",
    category: "Fútbol",
  },
  {
    id: 7,
    name: "LA Lakers City Edition 22/23",
    priceUSD: "$39",
    priceUYU: "$1.500",
    image: "/images/lakers-jersey-cityedition.jpg",
    category: "NBA",
  },
  {
    id: 8,
    name: "Golden State Warriors 24/25",
    priceUSD: "$39",
    priceUYU: "$1.500",
    image: "/images/warriors-jersey-24-25.jpg",
    category: "NBA",
  },
];

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
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-black text-white rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105 hover:shadow-xl hover:shadow-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: product.id * 0.1 }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="p-4">
                <span className="text-xs text-gray-400 uppercase block mb-2">
                  {product.category}
                </span>
                <h3 className="text-base font-semibold mb-2">
                  {product.name}
                </h3>
                <p className="text-green-500 font-semibold text-sm">
                  {product.priceUSD}
                  <span className="text-white/70 text-xs ml-1">USD</span>
                  <span className="text-white/40 mx-1">/</span>
                  {product.priceUYU}
                  <span className="text-white/70 text-xs ml-1">UYU</span>
                </p>
                <button className="mt-5 w-full bg-white text-black py-2 rounded-full font-semibold hover:bg-gray-200 transition">
                  Agregar al carrito
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}