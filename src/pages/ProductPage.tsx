//src/pages/ProductPage.tsx

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ProductPageNavbar from "../components/ProductPageNavbar";
import { fetchProductBySlug, fetchProducts } from "../firebaseUtils";
import { useCart } from "../context/CartContext";
import { Check, ChevronLeft, ArrowUp, CreditCard, Truck, Store, MessageSquare, Lock } from "lucide-react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { FaFutbol } from 'react-icons/fa';
import { TbShirtSport } from 'react-icons/tb';
import { MdStars } from 'react-icons/md';
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import RelatedProducts from "../components/RelatedProducts";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import { HiExclamation, HiExclamationCircle } from "react-icons/hi";
import { toast } from "react-hot-toast";

// Improved mobile toast for stock limit error

const isHTML = (s: string) => /<([a-z][\s\S]*?)>/i.test(s);

const iconForEmoji = (ch: string) => {
  switch (ch) {
    case '⚽': return <FaFutbol className="text-[#3B82F6]" />;
    case '👕': return <TbShirtSport className="text-[#3B82F6]" />;
    case '⭐': return <MdStars className="text-[#3B82F6]" />;
    case '🚚': return <Truck className="w-[1.1em] h-[1.1em] text-[#3B82F6]" />;
    default:   return null;
  }
};

const renderIconifiedDescription = (text: string) => {
  // Helper to map a plain string to inline React nodes with icons
  const mapInline = (s: string) => (
    <>
      {Array.from(s).map((ch, i) => {
        const ic = iconForEmoji(ch);
        return ic ? <span key={i} className="align-[0.1em] inline-flex">{ic}</span> : <span key={i}>{ch}</span>;
      })}
    </>
  );

  // If it looks like HTML, try to process simple <p> paragraphs, preserving tags
  if (isHTML(text)) {
    try {
      // Very lightweight paragraph-aware transform: <p> ... </p>
      const paragraphs = Array.from(text.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
      if (paragraphs.length > 0) {
        return (
          <div className="space-y-2">
            {paragraphs.map((m, idx) => {
              const inner = m[1] || "";
              // Strip any residual tags inside the paragraph before mapping inline emojis.
              // If you need to preserve inner tags later, we can enhance this parser.
              const innerPlain = inner.replace(/<[^>]+>/g, "");
              return (
                <p key={idx} className="leading-relaxed text-gray-800 flex items-start gap-2">
                  {/* If starts with an emoji, render it as leading icon */}
                  {(() => {
                    const first = Array.from(innerPlain)[0];
                    const icon = iconForEmoji(first || "");
                    const content = icon ? innerPlain.slice(first!.length).trimStart() : innerPlain;
                    return (
                      <>
                        {icon && <span className="mt-[2px]">{icon}</span>}
                        <span>{mapInline(content)}</span>
                      </>
                    );
                  })()}
                </p>
              );
            })}
          </div>
        );
      }
      // If no <p> found, fall back to plain mapping below
    } catch (e) {
      // Any parsing issue -> fall back to safe HTML render
      return <div dangerouslySetInnerHTML={{ __html: text }} />;
    }
  }

  // Plain text path
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return (
      <ul className="space-y-2">
        {lines.map((line, idx) => {
          const first = Array.from(line)[0];
          const icon = iconForEmoji(first || "");
          const content = icon ? line.slice(first.length).trimStart() : line;
          return (
            <li key={idx} className="flex items-start gap-2 text-gray-800">
              {icon && <span className="mt-[2px]">{icon}</span>}
              <span>{mapInline(content)}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return <p className="leading-relaxed text-gray-800">{mapInline(text)}</p>;
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const decodedId = decodeURIComponent(slug || "").toLowerCase();
  console.log("🧠 DEBUG PARAMS — slug:", slug);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<{ value: string; priceUSD: number; variantLabel?: string; variantId?: string; stock?: number; allowCustomization?: boolean } | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const { addToCart, items } = useCart();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [stockMessage, setStockMessage] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(true);
  // --- Personalización (por variante) y lógica de POR ENCARGUE ---
const [wantsCustomization, setWantsCustomization] = useState(false);
const [customName, setCustomName] = useState("");
const [customNumber, setCustomNumber] = useState("");

// Backorder si: (a) stock 0 ó (b) la variante permite personalizar y el usuario lo activó
const selectedIsBackorder =
  (!!selectedOption && typeof selectedOption.stock === "number" && selectedOption.stock <= 0) ||
  (!!selectedOption?.allowCustomization && wantsCustomization);

// Resetear personalización cuando la opción no lo permite
useEffect(() => {
  if (!selectedOption?.allowCustomization) {
    setWantsCustomization(false);
    setCustomName("");
    setCustomNumber("");
  }
}, [selectedOption?.allowCustomization]);

  // keen-slider logic
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(s) {
      setSelectedImage(s.track.details.rel);
    },
  });

  const { i18n, t } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "es";

  useEffect(() => {
    async function loadProduct() {
      if (!slug) {
        setProduct(null);
        setLoading(false);
        return;
      }
      try {
        const productData = await fetchProductBySlug(decodedId);
        if (!productData) {
          console.warn("❌ No se encontró el producto con slug:", decodedId);
          setProduct(null);
          setLoading(false);
          return;
        }

        console.log("✅ Producto encontrado:", productData);
        setProduct({
          ...productData,
          title: productData.title || "",
          description: productData.description || "",
        });

        // Autoselección si hay una única variante con una sola opción
        if (
          productData?.variants &&
          productData.variants.length === 1 &&
          productData.variants[0].options.length === 1
        ) {
          const single = productData.variants[0].options[0];
          setSelectedOption({
            value: single.value,
            priceUSD: single.priceUSD,
            variantLabel: productData.variants[0].label?.[lang] || "Opción",
            variantId: single.variantId || `${productData.variants[0].label?.[lang] || "Opción"}-${single.value}`,
            stock: single.stock ?? 0,
            allowCustomization: !!(single as any).allowCustomization,
          });
        }
      } catch (error) {
        console.error("[ProductPage] Error cargando producto:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  useEffect(() => {
    async function loadRelated() {
      if (!product || !product.category?.name) return;
      try {
        const all = await fetchProducts();
        const filtered = all.filter((p: any) =>
          p.category?.name === product.category.name && p.slug !== product.slug
        ).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Error cargando relacionados", err);
      }
    }
    loadRelated();
  }, [product]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBuyBlock = () => {
    const el = document.getElementById('buy-block');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleQuickBuy = () => {
    // Requiere selección si existen variantes
    if (Array.isArray(product.variants) && product.variants.length > 0 && !selectedOption) {
      setStockMessage('Debes seleccionar una opción antes de continuar.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      scrollToBuyBlock();
      return;
    }

    // Validar personalización si el usuario la activó
    if (selectedOption?.allowCustomization && wantsCustomization) {
      if (!customName || !customNumber) {
        setStockMessage('Completa nombre y número para la personalización.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
        return;
      }
    }

    const availableStock = selectedOption?.stock ?? product.stockTotal ?? 0;

    // Si NO es backorder, respetar límite de stock
    if (!selectedIsBackorder) {
      const existingItem = items.find(
        (item) =>
          item.id === String(product.id) &&
          item.variantId === (selectedOption?.variantId || '')
      );
      const currentQuantityInCart = existingItem?.quantity || 0;
      const requestedTotal = currentQuantityInCart + quantity;

      if (requestedTotal > availableStock) {
        if (availableStock === 0) {
          setStockMessage('Sin stock disponible de esta opción');
        } else {
          setStockMessage(`Solo hay ${availableStock} unidades disponibles`);
        }
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
        return;
      }
    }

    setIsAdding(true);

    const cartItem = {
      id: product.id,
      slug: product.slug,
      name: product.title,
      title: product.title,
      image: product.images?.[0] || '',
      quantity,
      priceUSD: selectedOption?.priceUSD ?? product.priceUSD,
      price: selectedOption?.priceUSD ?? product.priceUSD,
      variantLabel: selectedOption?.variantLabel,
      variantId: selectedOption?.variantId,
      stock: selectedOption?.stock,
      color: '',
      // NUEVO
      isBackorder: !!selectedIsBackorder,
      customName: selectedOption?.allowCustomization && wantsCustomization ? customName : '',
      customNumber: selectedOption?.allowCustomization && wantsCustomization ? customNumber : '',
    };

    addToCart(cartItem);
    toast.success(lang === 'en' ? 'Added to cart' : 'Agregado al carrito');
    scrollToTop();
    setTimeout(() => setIsAdding(false), 800);
  };
  useEffect(() => {
    const target = document.getElementById('buy-block');
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Hide sticky CTA when buy block is clearly visible
        setShowStickyCTA(!entry.isIntersecting || entry.intersectionRatio < 0.3);
      },
      { threshold: [0, 0.3, 1] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [product, selectedOption]);

  if (loading) return <div className="p-10">Cargando producto...</div>;
  if (!product) return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
      <Link to="/shop" className="text-[#FF2D55] underline">Volver a la tienda</Link>
    </div>
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Determine description to show
  let productDescription = typeof product.description === "object"
    ? product.description?.[lang] || ""
    : product.description || "";

  const totalStock = typeof product.stockTotal === 'number' ? product.stockTotal : 0;
  const isOutOfStock = totalStock <= 0;

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-[100dvh] flex flex-col">
      <div className="w-full overflow-x-hidden text-black relative z-10 flex-grow">
        <Helmet>
          <title>{`${product.title?.[lang] || product.title} | Mutter Games`}</title>
          <meta
            name="description"
            content={
              typeof product.description === 'object'
                ? product.description?.[lang] || 'Producto original disponible en Mutter Games.'
                : product.description || 'Producto original disponible en Mutter Games.'
            }
          />
          <meta property="og:title" content={`${product.title?.[lang] || product.title} | Mutter Games`} />
          <meta
            property="og:description"
            content={
              typeof product.description === 'object'
                ? product.description?.[lang] || 'Producto original disponible en Mutter Games.'
                : product.description || 'Producto original disponible en Mutter Games.'
            }
          />
          <meta property="og:type" content="product" />
          <meta property="og:image" content={product.images?.[0] || "/seo-image.jpg"} />
          <meta property="og:url" content={typeof window !== "undefined" ? window.location.href : ""} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${product.title?.[lang] || product.title} | Mutter Games`} />
          <meta
            name="twitter:description"
            content={
              typeof product.description === 'object'
                ? product.description?.[lang] || 'Producto original disponible en Mutter Games.'
                : product.description || 'Producto original disponible en Mutter Games.'
            }
          />
          <meta name="twitter:image" content={product.images?.[0] || "/seo-image.jpg"} />
          {/* JSON-LD: Product schema for SEO */}
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": (product.title?.[lang] || product.title) || "",
            "description": typeof product.description === 'object'
              ? (product.description?.[lang] || "Producto original disponible en Mutter Games.")
              : (product.description || "Producto original disponible en Mutter Games."),
            "image": Array.isArray(product.images) && product.images.length ? product.images : ["/seo-image.jpg"],
            "sku": String(product.id || product.slug || ""),
            "brand": { "@type": "Brand", "name": "Mutter Games" },
            "category": product.category?.name || "Coleccionables",
            "url": typeof window !== "undefined" ? window.location.href : "",
            "offers": {
              "@type": "Offer",
              "priceCurrency": "UYU",
              "price": (selectedOption?.priceUSD ?? product.variants?.[0]?.options?.[0]?.priceUSD ?? product.priceUSD) || 0,
              "availability": totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "url": typeof window !== "undefined" ? window.location.href : ""
            }
          })}</script>
        </Helmet>

        {/* Top-level floating controls */}
        <ProductPageNavbar />

        <div className="container mx-auto p-4 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-4">
            {product.images?.length ? (
              <>
                <div className="relative">
                  {product.images?.length > 1 && (
                    <>
                      <button
                        onClick={() => slider.current?.prev()}
                        className="absolute top-1/2 left-2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-md md:block hidden"
                      >
                        <ChevronLeft size={24} className="text-black hover:text-[#FF2D55] transition" />
                      </button>
                      <button
                        onClick={() => slider.current?.next()}
                        className="absolute top-1/2 right-2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-md md:block hidden"
                      >
                        <ChevronLeft size={24} className="text-black hover:text-[#FF2D55] transition rotate-180" />
                      </button>
                    </>
                  )}
                  <div
                    ref={sliderRef}
                    className="keen-slider rounded-lg overflow-hidden"
                  >
                    {product.images.map((img: string, i: number) => (
                      <div key={i} className="keen-slider__slide">
                        <img
                          src={img}
                          alt={`Imagen ${i}`}
                          className="object-contain max-h-[400px] w-full select-none"
                          draggable="false"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pt-4">
                    {product.images.map((img: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => slider.current?.moveToIdx(i)}
                        className={`w-20 h-20 rounded-md border ${selectedImage === i ? "border-gray-900" : "border-gray-300"} hover:ring-1 hover:ring-gray-900/20`}
                      >
                        <img src={img} alt={`Miniatura ${i}`} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-100 h-[450px] w-full rounded-lg flex flex-col items-center justify-center text-gray-400">
                <div className="text-4xl">📦</div>
                <p>No hay imagen</p>
              </div>
            )}
          </div>

          {/* Detalles producto */}
          <div className="flex flex-col">
            {/* Eyebrow categoría */}
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500 font-semibold mb-2">
              {product.category?.name || "Categoría"}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05] mb-4">
              {product.title?.[lang]}
            </h1>
            <div className="mt-2 sm:mt-4 mb-6">
              {(() => {
                const precio = selectedOption?.priceUSD ?? product.variants?.[0]?.options?.[0]?.priceUSD ?? product.priceUSD;
                // Formatear el precio en formato '3.700,00' (o similar)
                const entero = Math.floor(precio).toLocaleString("es-AR");
                const decimal = precio.toFixed(2).split(".")[1];
                const formattedPrice = `${entero},${decimal}`;
                return (
                  <div className="flex items-start">
                    <span className="text-4xl font-extrabold leading-none">
                      ${formattedPrice.split(',')[0]}
                    </span>
                    <sup className="text-sm font-semibold ml-0.5 align-[0.1em]">
                      {formattedPrice.split(',')[1]}
                    </sup>
                  </div>
                );
              })()}
            </div>
            {product.subtitle && <p className="text-gray-600 mb-4">{product.subtitle}</p>}

            {/* Cápsulas */}
            <div className="flex flex-col space-y-2 mt-6">
              {/* Opciones de variante multilenguaje y precio */}
              {Array.isArray(product.variants) && product.variants.length > 0 && (
                <div className="mb-6">
                  {product.variants.map((variant: any, vIndex: number) => (
                    <div key={vIndex} className="mb-4">
                      <h3 className="uppercase text-sm font-semibold text-gray-800 mb-1">
                        {variant.label?.[lang] || "Opción"}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {variant.options.map((option: any, oIndex: number) => (
                          <button
                            key={oIndex}
                            onClick={() => {
                              setSelectedOption({
                                ...option,
                                allowCustomization: option.allowCustomization, // ← NUEVO
                                variantLabel: variant.label?.[lang] || "Opción",
                                variantId: option.variantId || `${variant.label?.[lang] || "Opción"}-${option.value}`,
                              });
                            }}
                            className={`px-4 py-2 rounded-md border ${
                              selectedOption?.value === option.value
                                ? "bg-black text-white border-black"
                                : "bg-white text-black border-gray-300"
                            } hover:shadow-md transition`}
                          >
                            {option.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div className="flex flex-col space-y-2 mt-6">
              <label className="uppercase text-sm font-semibold text-gray-800">Cantidad</label>
              <div className="flex w-fit border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="px-3 bg-white hover:bg-gray-50">
                  <FiMinus />
                </button>
                <div className="px-4 py-2">{quantity}</div>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 bg-gray-100 hover:bg-gray-200">
                  <FiPlus />
                </button>
              </div>
            </div>

            {selectedOption && typeof selectedOption.stock === 'number' && (
  <div className="mt-2 text-sm">
    {selectedIsBackorder ? (
      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-medium">
        POR ENCARGUE
      </span>
    ) : (
      <span className="text-green-700 font-medium">
        🟢 En stock: {selectedOption.stock} unidad{selectedOption.stock > 1 ? 'es' : ''}
      </span>
    )}
  </div>
)}

{selectedOption?.allowCustomization && (
  <div className="mt-4 p-3 rounded-xl border border-gray-200 bg-white">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={wantsCustomization}
        onChange={(e) => setWantsCustomization(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
      Personalizar camiseta (Nombre y número)
    </label>

    {wantsCustomization && (
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Nombre (espalda)</label>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, '').slice(0, 17))}
            placeholder="Ej: MBAPPE"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Número</label>
          <input
            value={customNumber}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 2);
              setCustomNumber(onlyNums);
            }}
            placeholder="Ej: 7"
            inputMode="numeric"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <p className="mt-1 text-[11px] text-gray-500">Sólo números · 0–99</p>
        </div>
      </div>
    )}

    {selectedIsBackorder && (
      <p className="mt-3 text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
        Este pedido se prepara <b>por encargue</b>. Te confirmaremos tiempos estimados al finalizar la compra.
      </p>
    )}
  </div>
)}

<hr className="my-6 border-gray-100" />

            {/* Trust row (beneficios clave) */}
            <div className="mt-3 mb-2 text-sm text-gray-900 flex flex-wrap items-center justify-start gap-3 md:gap-6">
              <div className="inline-flex items-center gap-2">
                <CreditCard className="w-4 h-4 opacity-80" />
                <span className="font-medium">Cuotas con Mercado Pago</span>
              </div>
              <span className="hidden md:block h-4 w-px bg-gray-300/80" />
              <div className="inline-flex items-center gap-2">
                <Truck className="w-4 h-4 opacity-80" />
                <span className="font-medium">Envío 24–48 h</span>
              </div>
              <span className="hidden md:block h-4 w-px bg-gray-300/80" />
              <div className="inline-flex items-center gap-2">
                <Store className="w-4 h-4 opacity-80" />
                <span className="font-medium">Retiro hoy</span>
              </div>
              <span className="hidden md:block h-4 w-px bg-gray-300/80" />
              <div className="inline-flex items-center gap-2">
                <MessageSquare className="w-4 h-4 opacity-80" />
                <span className="font-medium">WhatsApp 1–3 min</span>
              </div>
            </div>

            {/* Info de envíos (estática) */}
            <div className="mt-2 text-sm text-gray-800 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span><strong>Entregas en Montevideo $169</strong> · Envíos al interior por DAC</span>
            </div>

            <div id="buy-block" className="grid md:grid-cols-2 gap-6 mt-6 mb-8">
              <button
    disabled={isAdding}
    onClick={() => {
      // Validar selección de variante si existen variantes
      if (Array.isArray(product.variants) && product.variants.length > 0 && !selectedOption) {
        setStockMessage('Debes seleccionar una opción antes de continuar.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
        return;
      }

      // Validar personalización si el usuario la activó
      if (selectedOption?.allowCustomization && wantsCustomization) {
        if (!customName || !customNumber) {
          setStockMessage('Completa nombre y número para la personalización.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
          return;
        }
      }

      const availableStock = selectedOption?.stock ?? product.stockTotal ?? 0;

      // Si NO es backorder, respetar límite de stock
      if (!selectedIsBackorder) {
        const existingItem = items.find(
          (item) =>
            item.id === String(product.id) &&
            item.variantId === (selectedOption?.variantId || '')
        );
        const currentQuantityInCart = existingItem?.quantity || 0;
        const requestedTotal = currentQuantityInCart + quantity;

        if (requestedTotal > availableStock) {
          if (availableStock === 0) {
            setStockMessage('Sin stock disponible de esta opción');
          } else {
            setStockMessage(`Solo hay ${availableStock} unidades disponibles`);
          }
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
          return;
        }
      }

      setIsAdding(true);

      const cartItem = {
        id: product.id,
        slug: product.slug,
        name: product.title,
        title: product.title,
        image: product.images?.[0] || '',
        quantity,
        priceUSD: selectedOption?.priceUSD ?? product.priceUSD,
        price: selectedOption?.priceUSD ?? product.priceUSD,
        variantLabel: selectedOption?.variantLabel,
        variantId: selectedOption?.variantId,
        stock: selectedOption?.stock,
        color: '',
        // NUEVO
        isBackorder: !!selectedIsBackorder,
        customName: selectedOption?.allowCustomization && wantsCustomization ? customName : '',
        customNumber: selectedOption?.allowCustomization && wantsCustomization ? customNumber : '',
      };

      addToCart(cartItem);
      toast.success(lang === 'en' ? 'Added to cart' : 'Agregado al carrito');
      scrollToTop();
      setTimeout(() => setIsAdding(false), 800);
    }}
    className={`h-12 rounded-lg shadow hover:shadow-md tracking-wide transition flex items-center justify-center gap-2 border font-semibold ${
      isAdding
        ? 'opacity-50 cursor-not-allowed bg-black text-white border-black'
        : 'bg-black text-white border-black hover:bg-white hover:text-black'
    }`}
  >
    {isAdding ? (
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    ) : (
      <>
        <Check size={18} /> {lang === 'en' ? 'Add to cart' : 'Agregar al carrito'}
      </>
    )}
  </button>
            </div>

            {/* Disclaimer legal/importación: TCD style */}
            <p className="mt-3 text-sm text-gray-500 italic leading-relaxed">
              <span className="block">Todos nuestros productos importados de China cumplen con las normativas legales locales.</span>
              <span className="block">Garantizamos una compra segura y transparente, gestionando los impuestos y aranceles conforme a la ley de cada país.</span>
            </p>


          </div>
        </div>

        {/* Descripción (full-width) con íconos vectoriales desde emojis */}
        {productDescription && (
          <section className="mt-10 mb-12">
            <h2 className="text-xl font-bold mb-4">Descripción</h2>
            <div className="prose prose-lg max-w-none">
              {renderIconifiedDescription(productDescription)}
            </div>
          </section>
        )}

        {product && (
          <RelatedProducts
            excludeSlugs={[product.slug]}
            categoryName={product.category?.name}
            title="También te podría interesar"
          />
        )}

        {/* Scroll top */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-20 right-6 p-3 bg-black text-white rounded-full shadow-lg z-50 hover:bg-[#FF2D55] transition">
            <ArrowUp size={24} />
          </button>
        )}


        {/* Toast notification for stock limit and errors */}
        {showToast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 bg-opacity-90 text-white text-sm px-4 py-2 rounded shadow-md max-w-[90%] z-50 flex items-center gap-2">
            <HiExclamationCircle className="w-4 h-4" />
            {stockMessage}
          </div>
        )}

        
        {/* Sticky CTA (mobile) */}
        {showStickyCTA && !isOutOfStock && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
              {(() => {
                const precio = selectedOption?.priceUSD ?? product.variants?.[0]?.options?.[0]?.priceUSD ?? product.priceUSD;
                const entero = Math.floor(precio).toLocaleString("es-AR");
                const decimal = precio.toFixed(2).split(".")[1];
                const formattedPrice = `${entero},${decimal}`;
                return (
                  <div className="flex flex-col leading-tight">
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-extrabold leading-none">${formattedPrice.split(',')[0]}</span>
                      <sup className="text-xs font-semibold align-[0.1em]">{formattedPrice.split(',')[1]}</sup>
                    </div>
                    <span className="text-[11px] text-gray-600 mt-0.5">Cuotas con MP</span>
                  </div>
                );
              })()}
              <button
                onClick={handleQuickBuy}
                className="flex-1 h-11 rounded-lg bg-black text-white font-semibold tracking-wide shadow hover:bg-white hover:text-black border border-black transition"
              >
                {lang === 'en' ? 'Buy now' : 'Comprar ahora'}
              </button>
            </div>
          </div>
        )}
        {/* Spacer para no tapar contenido con la Sticky CTA en mobile */}
        <div className="h-16 md:hidden" />
        </div> {/* cierra container mx-auto */}

      </div>
      <Footer variant="light" />
    </div>
  );
}