// src/pages/ProductPage.tsx
import { useParams, Link } from "react-router-dom";
import products from "../data/products";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import CartIcon from "../components/CartIcon";

import {
  FiMinus,
  FiPlus
} from "react-icons/fi";
import {
  Check,
  ScissorsLineDashed,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ArrowUp
} from "lucide-react";
import RelatedProducts from "../components/RelatedProducts";
import { useCart } from "../context/CartContext"; // 🛒 nuevo

export default function ProductPage() {
  const { id } = useParams();
  const product = products.find((p) => p.slug === id);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isStocked = "stock" in (product || {});
  const availableStock = isStocked
    ? selectedSize
      ? product?.stock?.[selectedSize] ?? 0
      : 0
    : 99;

  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart, items } = useCart(); // 🛒 hook para agregar al carrito
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0); // 🔢 número total

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!product) return <div className="p-10">Producto no encontrado</div>;

  const hasCustomization = selectedNumber || customName;
  const finalPriceUSD = hasCustomization ? product.priceUSD + 10 : product.priceUSD;
  const finalPriceUYU = hasCustomization ? product.priceUYU + 400 : product.priceUYU;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
    <Helmet>
    <script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images?.[0]
      ? [`https://tucasacadeportiva.com${product.images[0]}`]
      : [],
    description: `Camiseta ${product.name}, ideal para hinchas y coleccionistas. Disponible en talles S a XL.`,
    sku: product.slug,
    offers: {
      "@type": "Offer",
      url: `https://tucasacadeportiva.com/producto/${product.slug}`,
      priceCurrency: "USD",
      price: product.priceUSD,
      itemCondition: "https://schema.org/NewCondition",
      availability: isStocked
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
    },
  })}
</script>
  <title>{`${product.name} | Tu Casaca Deportiva`}</title>
  <meta
    name="description"
    content={`Conseguí la camiseta ${product.name} al mejor precio. Envíos a todo Uruguay. Personalizala con nombre y número si querés.`}
  />
  <meta
    name="keywords"
    content={`camiseta ${product.name}, ${product.name} 24/25, casaca de fútbol, camiseta personalizada, tu casaca deportiva`}
  />

  {/* Open Graph */}
  <meta property="og:title" content={`${product.name} | Tu Casaca Deportiva`} />
  <meta
    property="og:description"
    content={`Conseguí la camiseta ${product.name} personalizada. Envíos a todo Uruguay. Stock disponible en talles S a XL.`}
  />
  <meta
    property="og:image"
    content={`https://tucasacadeportiva.com${product.images?.[0] || "/images/categoria-futbol.jpg"}`}
  />
  <meta
    property="og:url"
    content={`https://tucasacadeportiva.com/producto/${product.slug}`}
  />
  <meta property="og:type" content="product" />
</Helmet>
      <section className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/futbol" className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:underline transition w-fit mb-4">
          <ChevronLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} thumbnail ${idx}`}
                  onMouseEnter={() => setSelectedImage(idx)}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 object-cover rounded-md cursor-pointer border transition-all duration-200 ${
                    selectedImage === idx ? "border-black shadow-md" : "border-transparent"
                  }`}
                />
              ))}
            </div>

            <div className="flex-1 bg-white rounded-xl overflow-hidden flex items-center justify-center h-[520px]">
              <img
                key={selectedImage}
                src={product.images[selectedImage]}
                alt={product.name}
                className="object-contain max-h-full max-w-full transition-opacity duration-500 ease-in-out animate-fadeIn"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight leading-tight">{product.name}</h1>
            <p className="text-2xl md:text-3xl font-bold text-black mb-2">
              ${finalPriceUSD} USD / ${finalPriceUYU} UYU
            </p>

            <div>
              <label className="font-semibold block mb-2">Talle:</label>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => {
                  const inStock = isStocked ? product.stock?.[size] : true;
                  const isOut = isStocked && product.stock?.[size] === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isStocked && product.stock?.[size] === 0}
                      className={`px-4 py-2 rounded-md border transition text-sm font-medium ${
                        selectedSize === size
                          ? "bg-black text-white border-black scale-105"
                          : "bg-white border-gray-300"
                      } ${isOut ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {size} {isOut && "(Por encargue)"}
                    </button>
                  );
                })}
              </div>
            </div>

            {!isStocked && (
              <>
                <div>
                  <label className="font-semibold block mb-2">Número (opcional):</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ej: 10"
                    value={selectedNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,2}$/.test(value)) setSelectedNumber(value);
                    }}
                    className="w-full text-center border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-2">Nombre (opcional):</label>
                  <input
                    type="text"
                    placeholder="Ej: RODRIGO"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50"
                  />
                </div>
              </>
            )}

            <div>
              <label className="font-semibold block mb-2">Cantidad:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (quantity > 1) setQuantity(quantity - 1);
                  }}
                  className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 disabled:opacity-50"
                  disabled={quantity <= 1 || !selectedSize}
                >
                  <FiMinus />
                </button>

                <span className="w-8 text-center">{quantity}</span>

                <button
                  onClick={() => {
                    if (quantity < availableStock) setQuantity(quantity + 1);
                  }}
                  className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 disabled:opacity-50"
                  disabled={quantity >= availableStock || !selectedSize}
                >
                  <FiPlus />
                </button>
              </div>
              {isStocked && selectedSize && (
                <p className="text-sm text-gray-500 mt-1">Máximo disponible: {availableStock}</p>
              )}
              {isStocked && !selectedSize && (
                <p className="text-sm text-gray-500 mt-1 italic">Elegí un talle para ver disponibilidad</p>
              )}
            </div>

            <div className="mt-4 border-t pt-4 text-sm text-gray-700 leading-relaxed space-y-2">
              <p>
                Camiseta de alta calidad, confeccionada en tela liviana, suave y transpirable.
                Terminaciones premium que aseguran gran confort y durabilidad.
              </p>
              <p>
                Ideal para el día a día, entrenar o sumar a tu colección futbolera.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Disponible en talles S, M, L y XL.
                </li>
                {!isStocked && (
                  <li className="flex items-center gap-2">
                    <ScissorsLineDashed className="w-4 h-4 text-red-500" />
                    Opción de personalización con nombre y número.
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-blue-500" />
                  Consultar disponibilidad inmediata.
                </li>
              </ul>
              <p className="text-base font-semibold text-black mt-2">¡Viví el fútbol con estilo!</p>
            </div>

            <div className="border-t pt-4">
  {errorMessage && (
    <div className="mb-4 bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-md border border-red-300">
      {errorMessage}
    </div>
  )}

  <button
    onClick={() => {
      if (!selectedSize) {
        setErrorMessage("Seleccioná un talle para continuar.");
        return;
      }

      setErrorMessage(""); // Limpiar si está todo ok

      addToCart({
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        priceUSD: product.priceUSD,
        priceUYU: product.priceUYU,
        quantity,
        size: selectedSize,
        customName: customName || "",
        customNumber: selectedNumber || "",
      });
    }}
    className="bg-black text-white w-full py-3 rounded-2xl font-semibold hover:scale-[1.03] hover:bg-black/90 hover:shadow-lg transition-all duration-200 shadow-md"
  >
    Agregar al carrito
  </button>
</div>
</div>
</div>

</section>

<div className="max-w-6xl mx-auto px-4 mt-12">
  <RelatedProducts excludeSlugs={[product.slug]} />
</div>

{/* Carrito flotante como en el resto del sitio */}
<div className="absolute top-6 right-6 z-50">
  <CartIcon variant="hero" />
</div>

{showScrollTop && (
  <button
    onClick={scrollToTop}
    className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg hover:bg-black/80 transition"
  >
    <ArrowUp className="w-4 h-4" />
  </button>
)}
</>
);
}

