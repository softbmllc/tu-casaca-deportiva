//src/pages/ProductPage.tsx

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import CartIcon from "../components/CartIcon";
import ProductPageNavbar from "../components/ProductPageNavbar";
import { fetchProductById, fetchProducts } from "../firebaseClientUtils";
import { useCart } from "../context/CartContext";
import { Check, ChevronLeft, ArrowUp } from "lucide-react";
import { FiMinus, FiPlus } from "react-icons/fi";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import RelatedProducts from "../components/RelatedProducts";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const decodedId = decodeURIComponent(slug || "").toLowerCase();
  console.log("🧠 DEBUG PARAMS — slug:", slug);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<{ value: string; priceUSD: number; variantLabel?: string; variantId?: string; stock?: number } | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const { addToCart, items } = useCart();

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
        const productData = await fetchProductById(decodedId);
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

  if (loading) return <div className="p-10">Cargando producto...</div>;
  if (!product) return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
      <Link to="/futbol" className="text-blue-500 underline">Volver a la tienda</Link>
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
    <div className="bg-[#f7f7f7] min-h-[100dvh] flex flex-col">
      <div className="w-full overflow-x-hidden text-black relative z-10 flex-grow">
        <Helmet><title>{`${product.title?.[lang] || product.title} | Looma`}</title></Helmet>

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
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => slider.current?.next()}
                        className="absolute top-1/2 right-2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-md md:block hidden"
                      >
                        <ChevronLeft size={20} className="rotate-180" />
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
                        className={`w-20 h-20 rounded-md border ${selectedImage === i ? "border-black border-2" : "border-gray-300"} hover:shadow-md`}
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
            <span className="uppercase text-xs tracking-widest text-gray-500 mb-2">{t('productPage.featuredProduct')}</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
              {product.title?.[lang]}
            </h1>
            <div className="mt-2 sm:mt-4 mb-6">
              <div className="text-4xl font-extrabold text-black">
                US$ {(selectedOption?.priceUSD ?? product.variants?.[0]?.options?.[0]?.priceUSD ?? product.priceUSD).toFixed(2)}
              </div>
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
              <label className="uppercase text-sm font-semibold text-gray-800">{t('productPage.quantity')}</label>
              <div className="flex w-fit border rounded-md overflow-hidden">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="px-3 bg-gray-100 hover:bg-gray-200">
                  <FiMinus />
                </button>
                <div className="px-4 py-2">{quantity}</div>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 bg-gray-100 hover:bg-gray-200">
                  <FiPlus />
                </button>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <div className="grid md:grid-cols-2 gap-6 mt-6 mb-8">
              <button
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  const price = selectedOption?.priceUSD ?? product.priceUSD;

                  if (Array.isArray(product.variants) && product.variants.length > 0 && !selectedOption) {
                    alert(lang === 'en' ? 'Please select an option.' : 'Por favor selecciona una opción.');
                    return;
                  }

                  const availableStock = selectedOption?.stock ?? product.stockTotal ?? 0;

                  // Buscar si ya hay un ítem igual en el carrito
                  const existingItem = items.find(
                    (item) =>
                      item.id === String(product.id) &&
                      item.size === (selectedOption?.value || '') &&
                      item.variantId === (selectedOption?.variantId || '')
                  );

                  const currentQuantityInCart = existingItem?.quantity || 0;
                  const requestedTotal = currentQuantityInCart + quantity;

                  if (requestedTotal > availableStock) {
                    alert(`Solo hay ${availableStock} unidades disponibles`);
                    return;
                  }

                  const variantLabel = (selectedOption as any)?.variantLabel || "Opción";

                  addToCart({
                    id: String(product.id),
                    slug: product.slug,
                    name: product.title,
                    title: {
                      en: product.title?.en || '',
                      es: product.title?.es || '',
                    },
                    subtitle: product.subtitle || '',
                    description: {
                      en: product.description?.en || '',
                      es: product.description?.es || '',
                    },
                    image: product.images?.[0] || '',
                    price: selectedOption?.priceUSD ?? product.priceUSD,
                    priceUSD: product.priceUSD,
                    quantity: quantity,
                    size: selectedOption?.value || '',
                    options: selectedOption?.value || '',
                    variantId: selectedOption?.variantId || '',
                    variantTitle: product?.variants?.[0]?.label || { en: 'Option', es: 'Opción' },
                  });
                  scrollToTop();

                }}
                className={`py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 border font-semibold ${
                  isOutOfStock
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : 'bg-black text-white border-black hover:bg-white hover:text-black'
                }`}
              >
                {isOutOfStock ? (lang === 'en' ? 'OUT OF STOCK' : 'SIN STOCK') : (
                  <>
                    <Check size={18} /> {lang === 'en' ? 'Add to cart' : 'Agregar al carrito'}
                  </>
                )}
              </button>
            </div>

            {/* Descripción del producto */}
            {productDescription && (
              <div
                className="prose prose-blue prose-lg max-w-none mb-8 text-gray-800 [&>p]:mb-4 [&>h2]:mt-8 [&>ul]:mb-4 [&>ul>li]:mb-2"
                dangerouslySetInnerHTML={{ __html: productDescription }}
              />
            )}

          </div>
        </div>

        {product && (
          <RelatedProducts
            excludeSlugs={[product.slug]}
            categoryName={product.category?.name}
            title={t('productPage.relatedProducts')}
          />
        )}

        {/* Scroll top */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-20 right-6 p-3 bg-black text-white rounded-full shadow-lg z-50">
            <ArrowUp size={24} />
          </button>
        )}


        {/* No custom alert/confirm modals */}
        </div> {/* cierra container mx-auto */}

      </div>
      <Footer />
    </div>
  );
}