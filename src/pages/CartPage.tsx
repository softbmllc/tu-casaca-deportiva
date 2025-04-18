// src/pages/CartPage.tsx
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import RelatedProducts from "../components/RelatedProducts";
import { CartItem } from "../data/types";
import { Trash2, Minus, Plus } from "lucide-react";
import AuthChoice from "../components/AuthChoice";

export default function CartPage() {
  const { items, updateItem } = useCart();
  const [currency, setCurrency] = useState<"USD" | "UYU">("USD");
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
    department: "",
    postalCode: "",
    wantsToRegister: false,
    email: "",
  });

  const total = items.reduce((sum, item) => {
    const price = currency === "USD" ? item.priceUSD : item.priceUYU;
    return sum + price * item.quantity;
  }, 0);

  const handleQuantityChange = (item: CartItem, newQty: number) => {
    if (newQty >= 1 && newQty <= 99) {
      updateItem(item.id, item.size, { quantity: newQty });
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    updateItem(item.id, item.size, { quantity: 0 });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://61c3-2601-582-c302-8510-49fc-e263-4e02-1189.ngrok-free.app/api/create_preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            title: item.name,
            quantity: item.quantity,
            unit_price: currency === "USD" ? item.priceUSD : item.priceUYU,
            currency_id: currency,
          })),
          payer: {
            name: shippingInfo.name,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            email: shippingInfo.wantsToRegister ? shippingInfo.email : undefined,
          },
          metadata: {
            department: shippingInfo.department,
            postalCode: shippingInfo.postalCode,
            wantsToRegister: shippingInfo.wantsToRegister,
          },
        }),
      });

      const data = await res.json();
      console.log("🧾 MP Response:", data);
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        console.error("❌ No se recibió init_point");
      }
    } catch (err) {
      console.error("❌ Error en el checkout:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Tu carrito</h1>

      <p className="text-sm text-center text-gray-600 mb-8">
        ¿Ya tenés cuenta? {" "}
        <span
          onClick={() => alert("Abrir login modal")}
          className="text-blue-600 underline cursor-pointer hover:text-blue-800"
        >
          Iniciar sesión
        </span>{" "}
        o {" "}
        <span
          onClick={() => alert("Abrir registro modal")}
          className="text-blue-600 underline cursor-pointer hover:text-blue-800"
        >
          registrarte
        </span>{" "}
        para guardar tus datos y acceder a beneficios.
      </p>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-700">
          <img
            src="/images/empty-cart-illustration.jpg"
            alt="Carrito vacío"
            className="mx-auto mb-6 w-36 h-36 opacity-80"
          />
          <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
          <p className="mb-6">¡Pero no te vayas con las manos vacías!</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <>
       <div className="grid md:grid-cols-2 gap-4 mb-10">
  {/* Nombre */}
  <input
    type="text"
    placeholder="Nombre completo"
    value={shippingInfo.name}
    onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
    required
    className="w-full border border-gray-300 px-4 py-2 rounded-md"
  />

  {/* Teléfono */}
  <input
    type="tel"
    placeholder="Teléfono"
    value={shippingInfo.phone}
    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
    required
    className="w-full border border-gray-300 px-4 py-2 rounded-md"
  />

  {/* Dirección (50%) */}
  <input
    type="text"
    placeholder="Dirección de entrega (Ej: Mercedes 4094)"
    value={shippingInfo.address}
    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
    required
    className="w-full md:col-span-1 border border-gray-300 px-4 py-2 rounded-md"
  />

  {/* Departamento (25%) + Código Postal (25%) */}
  <div className="grid grid-cols-2 gap-4">
  <select
  value={shippingInfo.department}
  onChange={(e) => setShippingInfo({ ...shippingInfo, department: e.target.value })}
  required
  className="w-full border border-gray-300 px-4 py-2 rounded-md bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-black transition"
>
      <option value="">Departamento</option>
      <option>Artigas</option>
      <option>Canelones</option>
      <option>Cerro Largo</option>
      <option>Colonia</option>
      <option>Durazno</option>
      <option>Flores</option>
      <option>Florida</option>
      <option>Lavalleja</option>
      <option>Maldonado</option>
      <option>Montevideo</option>
      <option>Paysandú</option>
      <option>Rivera</option>
      <option>Rocha</option>
      <option>Río Negro</option>
      <option>Salto</option>
      <option>San José</option>
      <option>Soriano</option>
      <option>Tacuarembó</option>
      <option>Treinta y Tres</option>
    </select>

    <input
      type="text"
      placeholder="Código Postal (opcional)"
      value={shippingInfo.postalCode}
      onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
      className="w-full border border-gray-300 px-4 py-2 rounded-md"
    />
  </div>

  {/* Checkbox Registrarme */}
  <div className="md:col-span-2 flex items-center gap-2 mt-2">
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

  {/* Email si elige registrarse */}
  {shippingInfo.wantsToRegister && (
    <input
      type="email"
      placeholder="Correo electrónico"
      value={shippingInfo.email}
      onChange={(e) =>
        setShippingInfo({ ...shippingInfo, email: e.target.value })
      }
      className="w-full md:col-span-2 border border-gray-300 px-4 py-2 rounded-md"
      required
    />
  )}
</div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Resumen de tu compra</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-4 py-2 rounded-md border text-sm ${currency === "USD" ? "bg-black text-white" : "bg-white text-black"}`}
              >
                Pagar en USD
              </button>
              <button
                onClick={() => setCurrency("UYU")}
                className={`px-4 py-2 rounded-md border text-sm ${currency === "UYU" ? "bg-black text-white" : "bg-white text-black"}`}
              >
                Pagar en UYU
              </button>
            </div>
          </div>

          <ul className="divide-y divide-gray-200 mb-6">
            {items.map((item, index) => {
              const price = currency === "USD" ? item.priceUSD : item.priceUYU;
              const totalItem = price * item.quantity;
              return (
                <li key={index} className="py-4 flex gap-4 items-center">
                  <Link to={`/producto/${item.slug}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/producto/${item.slug}`}>
                      <p className="font-semibold text-sm mb-1 hover:underline">
                        {item.name}
                      </p>
                    </Link>
                    <div className="text-sm text-gray-500 flex flex-wrap items-center gap-3">
                      <span>
                        Talle: <span className="inline-block border border-gray-300 px-2 py-0.5 rounded-md bg-gray-50 text-gray-800">{item.size}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        Cantidad:
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                          disabled={item.quantity >= 99}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
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
                        Personalizado: {item.customName} #{item.customNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm whitespace-nowrap font-semibold">
                    ${totalItem} {currency}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="bg-gray-100 p-6 rounded-2xl shadow-inner mt-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-700">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ${total} {currency}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.address}
              className="w-full bg-black text-white text-sm sm:text-base py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? "Cargando..." : "Finalizar compra"}
            </button>
          </div>

          <div className="mt-10">
            <RelatedProducts excludeSlugs={items.map((i) => i.slug)} />
          </div>
        </>
      )}
    </section>
  );
}