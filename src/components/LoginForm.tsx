// src/components/LoginForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin, auth } from "../firebaseUtils";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await signInAdmin(email, password);
      const resolvedEmail = auth.currentUser?.email || email;
      const resolvedName = resolvedEmail ? resolvedEmail.split("@")[0] : "admin";
      login({ id: user.uid, email: resolvedEmail, name: resolvedName });
      alert("Inicio de sesión exitoso");
      navigate("/admin", { replace: true });
    } catch (error: any) {
      const code = error?.code || "auth/unknown";
      console.error("❌ Login error:", code, error?.message);
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        alert("Contraseña incorrecta.");
      } else if (code === "auth/user-not-found") {
        alert("No existe un usuario con ese email.");
      } else if (code === "auth/too-many-requests") {
        alert("Demasiados intentos. Intenta más tarde o restablece tu contraseña.");
      } else if (code === "auth/network-request-failed") {
        alert("Error de red. Verifica tu conexión y reintenta.");
      } else {
        alert("No se pudo iniciar sesión: " + code);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      {/* Logo */}
      <img
        src="/logo1.png"
        alt="Bionova"
        className="w-24 h-24 object-contain mb-4"
      />

      {/* Subtítulo bienvenida */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido al panel</h1>
      <p className="text-gray-500 text-sm mb-8 text-center">
        Ingresá tus credenciales para acceder a la administración.
      </p>

      {/* Formulario */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white shadow-lg rounded-xl px-8 pt-8 pb-6"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            required
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            required
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-900 transition-all"
        >
          Iniciar sesión
        </button>
      </form>

      {/* Footer */}
      <p className="text-gray-400 text-xs mt-6">
        &copy; {new Date().getFullYear()} MutterGames. All rights reserved.
      </p>
    </div>
  );
}