// src/pages/CartPage.tsx

import { CartFormData } from "@/data/types";

import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, Fragment, useRef, useEffect } from "react";
import { loadGoogleMapsScript } from '../utils/loadGoogleMapsScript';
import { useLoadScript } from "@react-google-maps/api";
import RelatedProducts from "../components/RelatedProducts";
import { CartItem } from "../data/types";
import { ShippingInfo } from "../data/types";
import { Trash2, Minus, Plus } from "lucide-react";
import AuthChoice from "../components/AuthChoice";
import Footer from "../components/Footer";
import { db } from "../firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import CartNavbar from "../components/CartNavbar";
import { toast } from "react-hot-toast";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateCartForm } from "../utils/formValidation";
import { registerClient, saveOrderToFirebase } from "../firebaseUtils";
import { extractStateFromAddress, extractAddressComponents } from "@/utils/locationUtils";
import { prepareInitialOrderData } from '../utils/orderUtils';

// Importá la función para buscar ciudad y estado por ZIP
import { getCityAndStateFromZip } from "../utils/getCityAndStateFromZip";
import { Autocomplete } from "@react-google-maps/api";


const createOrder = () => {
  console.log("📝 createOrder llamada (placeholder)");
};

export default function CartPage() {
  // Always call hooks at the top level, never conditionally
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  const { items, updateItem, clearCart, removeItem, setShippingData, shippingData, validateShippingData } = useCart();
  const { t, i18n } = useTranslation();
  const { language } = useLanguage() as { language: 'en' | 'es' };
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();
  const [showResetForm, setShowResetForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");

  // Estado de errores por campo y error de dirección base
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [addressError, setAddressError] = useState(false);
  // --- EJEMPLO DE handleSubmit MODIFICADO ---
  // function handleSubmit, ejemplo:
  /*
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    // Validación de ubicación eliminada
    // resto de la lógica...
  }
  */

  // Refs para inputs para scroll a errores
  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLDivElement>(null); // Listbox wrapper
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Usar shippingInfo directamente desde el contexto
  const { shippingInfo, setShippingInfo } = useCart();

  // Poblar automáticamente los campos del formulario si hay datos guardados en shippingData
  useEffect(() => {
    if (shippingData?.name)
      setShippingInfo((prev) => ({ ...prev, name: shippingData.name || "" }));
    if (shippingData?.address) setShippingInfo((prev) => ({ ...prev, address: shippingData.address }));
    if (shippingData?.city) setShippingInfo((prev) => ({ ...prev, city: shippingData.city }));
    if (shippingData?.state) setShippingInfo((prev) => ({ ...prev, state: shippingData.state }));
    if (shippingData?.postalCode)
      setShippingInfo((prev) => ({ ...prev, postalCode: shippingData.postalCode || "" }));
    if (shippingData?.phone) setShippingInfo((prev) => ({ ...prev, phone: shippingData.phone }));
    if (shippingData?.email) setShippingInfo((prev) => ({ ...prev, email: shippingData.email }));
  }, []);

  // Validación de información de envío
  // (No longer used: validateShippingInfo)

  // Nueva función modular para crear un pedido seguro (sin undefined, sin ll)
  const crearPedido = () => {
    return {
      cliente: shippingInfo.name || '',
      telefono: shippingInfo.phone || '',
      email: shippingInfo.email || '',
      ciudad: shippingInfo.city || '',
      estado: shippingInfo.state || '',
      zip: shippingInfo.postalCode || '',
      pais: "USA",
      direccion: shippingInfo.address || '',
      carrito: items.map(item => ({
        id: item.id,
        nombre: item.name,
        precio: item.priceUSD,
        cantidad: item.quantity,
        talle: item.size,
        customName: item.customName || "",
        customNumber: item.customNumber || "",
      })),
      total: items.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0),
      moneda: "USD",
      fecha: new Date().toISOString(),
    };
  };

  // Función para simular un pedido (versión corregida para evitar undefined en Firebase)
  const simularPedido = async () => {
    try {
      // Simulación de usuario autenticado: usá shippingInfo.email como "usuario"
      const user = { email: shippingInfo.email };
      if (!user || !user.email) {
        toast.error("Debés iniciar sesión para simular el pedido.");
        return;
      }

      // Usar los ítems del carrito y shippingInfo
      const cartItems = items.map(item => ({
        id: item.id,
        nombre: typeof item.name === "string"
          ? item.name
          : typeof item.name === "object" && item.name !== null && "es" in item.name
            ? (item.name as { es: string }).es
            : "Sin nombre",
        precio: item.priceUSD,
        cantidad: item.quantity,
        talle: item.size,
        customName: item.customName || "",
        customNumber: item.customNumber || "",
      }));

      // Calcular total
      const calculateTotal = (cartItems: any[]) =>
        cartItems.reduce((sum, item) => {
          const precio = Number(item.precio) || 0;
          const cantidad = Number(item.cantidad) || 0;
          return sum + (precio * cantidad);
        }, 0);

      // --- Completar ciudad y estado si faltan usando el ZIP ---
      // Creamos una copia editable de shippingInfo
      const userData = { ...shippingInfo };
      if (!userData.city || !userData.state) {
        const zipData = await getCityAndStateFromZip(userData.postalCode || "");
        if (zipData) {
          userData.city = zipData.city || userData.city;
          userData.state = zipData.state || userData.state;
        }
      }

      // orderData: todos los campos definidos (vacío si falta)
      const orderData = {
        email: user.email,
        cartItems,
        total: calculateTotal(cartItems),
        direccion: userData.address || "",
        ciudad: userData.city || "",
        estado: userData.state || "",
        codigoPostal: userData.postalCode || "",
        pais: "USA",
        nombreCompleto: userData.name || "",
        telefono: userData.phone || "",
        fecha: new Date().toISOString(),
        estadoPedido: "Simulado",
      };

      // Validación extra antes de guardar en Firestore
      console.log("🔍 orderData completo:", JSON.stringify(orderData, null, 2));
      const hasUndefined = Object.entries(orderData).find(([key, value]) => value === undefined);
      if (hasUndefined) {
        console.error("❌ Campo undefined encontrado:", hasUndefined[0], hasUndefined[1]);
        toast.error(`Campo inválido: ${hasUndefined[0]}`);
        return;
      }

      const orderRef = doc(collection(db, "orders"));
      // DEBUG: Log dbEntry before sending to Firebase
      console.log("dbEntry que se está enviando a Firebase:", orderData);
      await setDoc(orderRef, orderData);

      toast.success("Pedido simulado con éxito");
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
      toast.error("No se puede guardar el pedido, revisá la consola para más detalles.");
    }
  };

  // Versión consolidada de validación para proceder al checkout
  const handleProceedToCheckout = () => {
    const shippingInfoWithZip = {
      ...shippingInfo,
      zip: shippingInfo.postalCode || "",
    };

    // DEBUG: logs para testear coordenadas
    console.log("Shipping Info al validar:", shippingInfoWithZip);
    console.log("Coordinates presentes:", shippingInfoWithZip.coordinates);

    // Usar validateCartForm que retorna { valid, errors }
    const { valid, errors } = validateCartForm(shippingInfoWithZip);
    const hasCoordinates = Boolean(shippingInfo?.coordinates?.lat && shippingInfo?.coordinates?.lng);

    // TEMPORAL: permitimos avanzar aunque no haya coordenadas
    if (!valid) {
      setFormErrors(errors);
      toast.error("Por favor completá todos los campos obligatorios.");
      return;
    }

    navigate("/checkout");
  };

// Utilidad para validar email con regex profesional
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

  // Google Places Autocomplete
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  // Utilidad para extraer componentes de dirección
  const getAddressComponent = (components: any[], type: string): string => {
    return components.find((c: any) => c.types.includes(type))?.long_name || "";
  };
  const handlePlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;
      const components = place.address_components;
      const direccion = `${getAddressComponent(components, "street_number")} ${getAddressComponent(components, "route")}`.trim();
      const ciudad = getAddressComponent(components, "locality");
      const estado = getAddressComponent(components, "administrative_area_level_1");
      const zip = getAddressComponent(components, "postal_code");
      const pais = getAddressComponent(components, "country");
      setShippingInfo((prev) => ({
        ...prev,
        address: direccion,
        city: ciudad,
        state: estado,
        postalCode: zip,
        country: pais,
      }));
    }
  };

  console.log("🧾 items en CartPage:", items);
  const total = (() => {
    const sum = items.reduce((acc, item) => {
      const price = item.priceUSD;
      return acc + price * item.quantity;
    }, 0);
    return parseFloat(sum.toFixed(2));
  })();

  const handleQuantityChange = (item: CartItem, newQty: number) => {
    if (newQty >= 1 && newQty <= 99) {
      updateItem(Number(item.id), item.size, { quantity: newQty });
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    if (!removeItem) return;
    removeItem(item.id, item.size);
  };

  // Render loading if Google Maps script is not loaded
  if (!isLoaded) {
    return <p>Cargando mapa...</p>;
  }

  return (
    <>
      <CartNavbar />
      <div className="pt-28">
        <section className="bg-white text-black min-h-screen flex flex-col">
          <main className="flex-grow">
            <div className="max-w-5xl mx-auto px-6 py-10">
              <h1 className="text-3xl font-bold mb-6">Tu carrito</h1>

              {items.length === 0 && (
                <p className="text-sm text-center text-gray-600 mb-8">
                  ¿Ya tenés cuenta?{" "}
                  <span
                    onClick={() => setShowLoginModal(true)}
                    className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                  >
                    Iniciar sesión
                  </span>{" "}
                  o{" "}
                  <span
                    onClick={() => setShowRegisterModal(true)}
                    className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                  >
                    registrarte
                  </span>{" "}
                  para guardar tus datos y acceder a beneficios.
                </p>
              )}

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <div className="bg-white rounded-full shadow-md p-6 mb-6">
                    <img
                      src="/images/empty-cart-illustration.jpg"
                      alt="Carrito vacío"
                      className="w-24 h-24 object-contain opacity-80"
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
                  <p className="text-gray-500 mb-6">¡Pero no te vayas con las manos vacías!</p>

                  <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-black text-white rounded-full font-semibold hover:scale-[1.03] hover:bg-gray-900 transition-all"
                  >
                    Ver catálogo
                  </Link>
                </div>
              ) : (
                <>
                  {/* resto del código si hay productos */}
                  {/* Formulario de envío */}
                  <div className="space-y-4 mb-10">
                    {/* Fila 1: Nombre (50%) + Dirección (50%) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-medium">Nombre completo</label>
                        <input
                          id="name"
                          ref={nameRef}
                          type="text"
                          placeholder="Nombre completo"
                          value={shippingInfo.name}
                          onChange={(e) => {
                            setShippingInfo({ ...shippingInfo, name: e.target.value });
                            if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: "" }));
                          }}
                          required
                          className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-600' : ''}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-medium">Dirección</label>
                        <div className="relative">
                          <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceChanged}>
                            <input
                              type="text"
                              name="address"
                              placeholder="Dirección"
                              value={shippingInfo.address}
                              onChange={(e) =>
                                setShippingInfo((prev) => ({ ...prev, address: e.target.value }))
                              }
                              className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.address ? 'border-red-600' : ''}`}
                            />
                          </Autocomplete>
                        </div>
                      </div>
                    </div>

                    {/* Fila 2: NUEVA estructura */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        placeholder="Apto, unidad, edificio, piso (opcional)"
                        value={shippingInfo.address2}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                        className={`w-full border border-gray-300 px-4 py-2 rounded-md col-span-2 ${formErrors.address2 ? 'border-red-600' : ''}`}
                      />
                      {/* Email */}
<input
  id="email"
  ref={emailRef}
  type="email"
  placeholder="Correo electrónico"
  value={shippingInfo.email}
  onChange={(e) => {
    setShippingInfo({ ...shippingInfo, email: e.target.value });
    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: "" }));
  }}
  pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
  required
  className={`w-full border px-4 py-2 rounded-md border-gray-300 ${formErrors.email ? 'border-red-500' : ''}`}
/>

{/* Teléfono */}
<input
  id="phone"
  ref={phoneRef}
  type="tel"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Teléfono"
  value={shippingInfo.phone}
  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // solo números
    setShippingInfo({ ...shippingInfo, phone: value });
    if (formErrors.phone) {
      setFormErrors((prev) => ({ ...prev, phone: "" }));
    }
  }}
  required
  className={`w-full border px-4 py-2 rounded-md border-gray-300 ${formErrors.phone ? 'border-red-500' : ''}`}
/>
                    </div>

                    {/* Fila 3: NUEVA fila de ciudad, estado, zip, país */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        id="city"
                        ref={cityRef}
                        type="text"
                        placeholder="Ciudad"
                        value={shippingInfo.city}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, city: e.target.value });
                          if (formErrors.city) setFormErrors((prev) => ({ ...prev, city: "" }));
                        }}
                        className={`w-full border px-4 py-2 rounded-md border-gray-300 ${formErrors.city ? 'border-red-500' : ''}`}
                      />
                      <input
                        type="text"
                        value={shippingInfo.state}
                        placeholder="Estado"
                        disabled
                        className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-100 text-gray-500"
                      />
                      <input
                        id="postalCode"
                        ref={postalCodeRef}
                        type="text"
                        placeholder="ZIP Code"
                        value={shippingInfo.postalCode}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, postalCode: e.target.value });
                          if (formErrors.postalCode) setFormErrors((prev) => ({ ...prev, postalCode: "" }));
                        }}
                        maxLength={5}
                        className={`w-full border px-4 py-2 rounded-md border-gray-300 ${formErrors.postalCode ? 'border-red-500' : ''}`}
                      />
                      {shippingInfo.postalCode.length > 0 && shippingInfo.postalCode.length < 5 && (
                        <p className="text-red-600 text-sm mt-1">El código ZIP debe tener 5 dígitos.</p>
                      )}
                      <select
                        value="USA"
                        disabled
                        className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-100 text-gray-500"
                      >
                        <option value="USA">USA</option>
                      </select>
                    </div>

                    {/* Checkbox Registrarme */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="wantsToRegister"
                        checked={shippingInfo.wantsToRegister}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, wantsToRegister: e.target.checked })
                        }
                      />
                      <label htmlFor="wantsToRegister" className="text-sm text-gray-700">
                        Registrarme
                      </label>
                    </div>

                    {/* Campos condicionales de contraseña */}
                    {shippingInfo.wantsToRegister && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="password"
                          placeholder="Contraseña"
                          value={shippingInfo.password}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, password: e.target.value })
                          }
                          className="w-full border border-gray-300 px-4 py-2 rounded-md"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Confirmar contraseña"
                          value={shippingInfo.confirmPassword}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, confirmPassword: e.target.value })
                          }
                          className="w-full border border-gray-300 px-4 py-2 rounded-md"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Resumen de tu compra</h2>
                  </div>

                  <ul className="divide-y divide-gray-200 mb-6">
                    {items.map((item, index) => {
                      const price = item.priceUSD;
                      const totalItem = price * item.quantity;
                      return (
                        <li key={`${item.id}-${item.size}`} className="py-4 flex gap-4 items-center">
                          <Link to={`/producto/${item.slug}`}>
                              <img
                                src={item.image}
                                alt={
                                  typeof item.name === "object" && item.name !== null
                                    ? (item.name as Record<'en' | 'es', string>)?.[language]
                                    : item.name || "Sin nombre"
                                }
                                className="w-20 h-20 object-cover rounded-md border"
                              />
                          </Link>
                          <div className="flex-1">
                            <Link to={`/producto/${item.slug}`}>
                              <p className="font-semibold text-sm mb-1 hover:underline">
                                {typeof item.name === "object" && item.name !== null
                                  ? (item.name as Record<'en' | 'es', string>)?.[language]
                                  : item.name || "Sin nombre"}
                              </p>
                            </Link>
                            <p className="text-sm text-gray-500 mb-1">
                              {`US$${item.priceUSD.toFixed(2)} c/u`}
                            </p>
                            <div className="text-sm text-gray-500 flex flex-wrap items-center gap-3">
                              <span>
                                Talle: <span className="inline-block border border-gray-300 px-2 py-0.5 rounded-md bg-gray-50 text-gray-800">{item.size}</span>
                              </span>
                              <span>
                                Cantidad:{" "}
                                <span className="inline-block border border-gray-300 px-2 py-0.5 rounded-md bg-gray-50 text-gray-800">
                                  {item.quantity}
                                </span>
                              </span>
                              <button
                                onClick={() => handleRemoveItem(item)}
                                className="ml-2 text-red-500 hover:text-red-700 transition"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {item.customName && item.customNumber && (
                              <p className="text-sm text-gray-500">
                                Personalizado: {typeof item.customName === "object"
                                  ? ((item.customName as Record<'en' | 'es', string>)?.[language] || "Sin nombre")
                                  : item.customName} #{item.customNumber}
                              </p>
                            )}
                            {/* {item.description && (
                              <p className="text-xs text-gray-400 mt-1">
                                {typeof item.description === "object"
                                  ? (item.description as Record<'en' | 'es', string>)?.[language]
                                  : item.description}
                              </p>
                            )} */}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap font-semibold">
                            <span>{`US$${totalItem.toFixed(2)}`}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="bg-gray-100 p-6 rounded-2xl shadow-inner mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium text-gray-700">Total</span>
                      <span className="text-2xl font-bold text-gray-900">
                        <span>{`US$${total.toFixed(2)}`}</span>
                      </span>
                    </div>

                    {/* Botón de Simular Pedido */}
                    <button
                      className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition disabled:opacity-50"
                      onClick={handleProceedToCheckout}
                      disabled={loading}
                    >
                      {loading ? "Procesando..." : "Proceder al Pago"}
                    </button>
                  </div>

                  {items.length > 0 && (
                    <div className="mt-10 bg-white">
                      <div className="pb-20">
                        <RelatedProducts
                          title="También te podría gustar"
                          excludeSlugs={items.map((i) => i.slug)}
                          categoryName="Fútbol"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {showLoginModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <button
        onClick={() => setShowLoginModal(false)}
        className="absolute top-2 right-3 text-gray-400 hover:text-black text-xl"
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>

      {!showResetForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const user = usuarios.find((u: any) => u.email === loginEmail && u.password === loginPassword);

            if (user) {
              toast.success("Inicio de sesión exitoso ✅");
              setShowLoginModal(false);
            } else {
              toast.error("Correo o contraseña incorrectos ❌");
            }
          }}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="password"
            placeholder="Contraseña"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-900"
          >
            Iniciar sesión
          </button>

          <p className="text-sm text-center mt-2">
            <button
              onClick={() => {
                setShowResetForm(true);
                setLoginEmail("");
              }}
              className="text-blue-600 hover:underline"
              type="button"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const index = usuarios.findIndex((u: any) => u.email === loginEmail);

            if (index === -1) {
              toast.error("Correo no registrado ❌");
              return;
            }

            if (resetPassword !== resetConfirm) {
              toast.error("Las contraseñas no coinciden ❌");
              return;
            }

            usuarios[index].password = resetPassword;
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            toast.success("Contraseña actualizada ✅");
            setShowResetForm(false);
            setShowLoginModal(false);
          }}
          className="space-y-4"
        >
          <h3 className="font-semibold text-center">Recuperar contraseña</h3>
          <input
            type="email"
            placeholder="Correo electrónico"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            required
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            required
            value={resetConfirm}
            onChange={(e) => setResetConfirm(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-900"
          >
            Actualizar contraseña
          </button>
          <button
            type="button"
            onClick={() => setShowResetForm(false)}
            className="text-sm text-gray-500 hover:underline w-full text-center mt-2"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  </div>
)}
{showRegisterModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
      <button
        onClick={() => setShowRegisterModal(false)}
        className="absolute top-2 right-3 text-gray-400 hover:text-black text-xl"
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4">Crear cuenta</h2>
      {/* REGISTRO: Formulario controlado para evitar warning de React */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Registro completo simulado ✅");
          setShowRegisterModal(false);
        }}
        className="space-y-4"
      >
        {/* Fila 1: Nombre + Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Nombre completo"
            required
            value={loginEmail /* temporal: usá tu propio estado/formData.fullName ?? "" */}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="text"
            name="address"
            placeholder="Dirección de entrega"
            required
            value={"" /* reemplazá por formData.address ?? "" */}
            onChange={() => {} /* reemplazá por tu setFormData */}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
        </div>

        {/* Fila 2: Teléfono + Ciudad + Estado + Código Postal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="tel"
            name="phone"
            placeholder="Teléfono"
            required
            value={"" /* formData.phone ?? "" */}
            onChange={() => {}}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="text"
            name="city"
            placeholder="Ciudad"
            value={"" /* formData.city ?? "" */}
            onChange={() => {}}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="text"
            name="state"
            placeholder="Estado"
            disabled
            value={"" /* formData.state ?? "" */}
            className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-100 text-gray-500"
          />
          <input
            type="text"
            name="zipCode"
            placeholder="Código Postal"
            value={"" /* formData.zipCode ?? "" */}
            onChange={() => {}}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
        </div>

        {/* Fila 3: Email + Contraseña + Confirmar contraseña */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            required
            value={"" /* formData.email ?? "" */}
            onChange={() => {}}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            value={"" /* formData.password ?? "" */}
            onChange={() => {}}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            required
            value={"" /* formData.confirmPassword ?? "" */}
            onChange={() => {}}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-900"
        >
          Registrarme
        </button>
      </form>
    </div>
  </div>
)}
          </div>
        </main>
        <Footer />
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      </section>
      </div>
    </>
  );
}
// Alternativamente, podés inyectar el script de Google Maps desde React con este efecto:
/*
useEffect(() => {
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}, []);
*/
import { Order } from '@/data/types';