// src/pages/CartPage.tsx
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import RelatedProducts from "../components/RelatedProducts";
import { CartItem } from "../data/types";
import { Trash2, Minus, Plus } from "lucide-react";
import AuthChoice from "../components/AuthChoice";
import Footer from "../components/Footer";

export default function CartPage() {
  const { items, updateItem, clearCart } = useCart();
  const [currency, setCurrency] = useState<"USD" | "UYU">("USD");
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();
  const [showResetForm, setShowResetForm] = useState(false);
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [resetPassword, setResetPassword] = useState("");
const [resetConfirm, setResetConfirm] = useState("");
  
  // Estado para la información de envío con los nuevos campos
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    department: "",
    postalCode: "",
    wantsToRegister: false,
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Función modular para crear un pedido
  const crearPedido = () => {
    const total = items.reduce((sum, item) => {
      const price = currency === "USD" ? item.priceUSD : item.priceUYU;
      return sum + price * item.quantity;
    }, 0);

    return {
      cliente: {
        nombre: shippingInfo.name,
        telefono: shippingInfo.phone,
        direccion: shippingInfo.address,
        ciudad: shippingInfo.city,
        departamento: shippingInfo.department,
        codigoPostal: shippingInfo.postalCode,
        email: shippingInfo.email,
        // No incluimos la contraseña por seguridad
      },
      items: items.map(item => ({
        id: item.id,
        nombre: item.name,
        precio: currency === "USD" ? item.priceUSD : item.priceUYU,
        cantidad: item.quantity,
        talle: item.size,
        customName: item.customName,
        customNumber: item.customNumber,
      })),
      total: total,
      moneda: currency,
      estado: "simulado",
      fecha: new Date().toISOString(),
    };
  };

  // Función para simular un pedido
  const simularPedido = () => {
    // Validar campos obligatorios
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert("Por favor completa los campos obligatorios: nombre, teléfono y dirección");
      return;
    }

    // Validar campos de registro si el usuario quiere registrarse
    if (shippingInfo.wantsToRegister) {
      if (!shippingInfo.email || !shippingInfo.password || !shippingInfo.confirmPassword) {
        alert("Para registrarte, debes completar email, contraseña y confirmar contraseña");
        return;
      }
      
      if (shippingInfo.password !== shippingInfo.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
    }

    // Crear el pedido
const pedido = crearPedido();

// Guardar en localStorage
const pedidosActuales = JSON.parse(localStorage.getItem("pedidos") || "[]");
localStorage.setItem("pedidos", JSON.stringify([...pedidosActuales, pedido]));

// Si quiere registrarse, también guardamos el usuario
if (shippingInfo.wantsToRegister) {
  const usuariosActuales = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const emailYaExiste = usuariosActuales.some((u: any) => u.email === shippingInfo.email);

  if (emailYaExiste) {
    alert("Este correo ya está registrado. Por favor iniciá sesión o usá otro correo.");
    return;
  }

  const nuevoUsuario = {
    nombre: shippingInfo.name,
    telefono: shippingInfo.phone,
    direccion: shippingInfo.address,
    ciudad: shippingInfo.city,
    departamento: shippingInfo.department,
    codigoPostal: shippingInfo.postalCode,
    email: shippingInfo.email,
    password: shippingInfo.password, // En producción, usar hash
  };

  localStorage.setItem("usuarios", JSON.stringify([...usuariosActuales, nuevoUsuario]));
}

// Limpiar carrito
clearCart();

// Redireccionar
navigate("/admin");
  };

  const handleCheckout = async () => {
    // Validar campos obligatorios
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert("Por favor completa los campos obligatorios: nombre, teléfono y dirección");
      return;
    }

    // Validar campos de registro si el usuario quiere registrarse
    if (shippingInfo.wantsToRegister) {
      if (!shippingInfo.email || !shippingInfo.password || !shippingInfo.confirmPassword) {
        alert("Para registrarte, debes completar email, contraseña y confirmar contraseña");
        return;
      }
      
      if (shippingInfo.password !== shippingInfo.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
    }
    
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
            city: shippingInfo.city,
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

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
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
          {/* Nueva distribución en 2 filas */}
          <div className="space-y-4 mb-10">
            {/* Fila 1: Nombre (50%) + Dirección (50%) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={shippingInfo.name}
                onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md"
              />
              
              <input
                type="text"
                placeholder="Dirección de entrega (Ej: Mercedes 4094)"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md"
              />
            </div>

            {/* Fila 2: Teléfono (25%) + Ciudad (25%) + Departamento (25%) + Código Postal (25%) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="tel"
                placeholder="Teléfono"
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md"
              />
              
              <input
                type="text"
                placeholder="Ciudad"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                className="w-full border border-gray-300 px-4 py-2 rounded-md"
              />
              
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

            {/* Campos de registro */}
{shippingInfo.wantsToRegister && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <input
      type="email"
      placeholder="Correo electrónico"
      value={shippingInfo.email}
      onChange={(e) =>
        setShippingInfo({ ...shippingInfo, email: e.target.value })
      }
      className="w-full border border-gray-300 px-4 py-2 rounded-md col-span-2"
      required
    />

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

            {/* Botón de Simular Pedido */}
            <button
              onClick={simularPedido}
              disabled={loading || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.address}
              className="w-full mb-3 bg-blue-600 text-white text-sm sm:text-base py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              Simular pedido
            </button>

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
          <Footer />
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
              alert("Inicio de sesión exitoso ✅");
              setShowLoginModal(false);
            } else {
              alert("Correo o contraseña incorrectos ❌");
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
              alert("Correo no registrado ❌");
              return;
            }

            if (resetPassword !== resetConfirm) {
              alert("Las contraseñas no coinciden ❌");
              return;
            }

            usuarios[index].password = resetPassword;
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            alert("Contraseña actualizada ✅");
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Registro completo simulado ✅");
          setShowRegisterModal(false);
        }}
        className="space-y-4"
      >
        {/* Fila 1: Nombre + Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Dirección de entrega"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
        </div>

        {/* Fila 2: Teléfono + Ciudad + Departamento + Código Postal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="tel"
            placeholder="Teléfono"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Ciudad"
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <select
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md bg-white text-gray-700 col-span-1"
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
            placeholder="Código Postal"
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
        </div>

        {/* Fila 3: Email + Contraseña + Confirmar contraseña */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="password"
            placeholder="Contraseña"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            required
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
    </section>
  );
}