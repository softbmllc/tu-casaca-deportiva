// src/components/admin/layout/AdminLayout.tsx

import { ReactNode } from "react";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../Sidebar";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar izquierdo */}
      <Sidebar activeView="clients" onChangeView={(view) => navigate(`/admin/${view}`)} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hola, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 underline hover:text-red-700"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}