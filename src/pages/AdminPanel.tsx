// src/pages/AdminPanel.tsx
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import ClientList from "../components/admin/ClientList";
import ProductList from "../components/admin/ProductList";
import ProductForm from "../components/admin/ProductForm";
import UserList from "../components/admin/UserList";
import AdminCategoryManager from "../components/admin/AdminCategoryManager"; // ✅ archivo nuevo
import OrderAdmin from "../components/admin/OrderAdmin";
import { ClientDetailWrapper } from "../components/admin/ClientDetail";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ importar hook de autenticación

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { user, isLoading } = useAuth(); // ✅ usar contexto de autenticación

  useEffect(() => {
    const path = location.pathname.split('/').pop() || "clients";
    setActiveView(path);
  }, [location]);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    navigate(`/admin/${view}`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar dinámico */}
      <Sidebar activeView={activeView} onChangeView={handleViewChange} />

      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <div className="mb-4 text-sm text-gray-600">
          {isLoading ? (
            <><strong>Usuario logueado:</strong> <span className="text-gray-400">Cargando usuario...</span></>
          ) : user ? (
            <><strong>Usuario logueado:</strong> {user.email}</>
          ) : (
            <><strong>Usuario logueado:</strong> <span className="text-red-500">No logueado</span></>
          )}
        </div>
        <Routes>
          <Route index element={<Navigate to="/admin/clients" replace />} />
          <Route
            path="clients"
            element={
              <ClientList onSelectClient={(id) => setSelectedClientId(id)} />
            }
          />
          <Route path="productList" element={<ProductList />} />
          <Route path="productForm" element={<ProductForm />} />
          <Route path="orders" element={<OrderAdmin />} />
          <Route path="users" element={<UserList />} />
          <Route path="categories" element={<AdminCategoryManager />} />
          <Route path="editar/:id" element={<ProductForm />} />

          {/* Ruta de fallback */}
          <Route path="*" element={<Navigate to="/admin/clients" replace />} />
        </Routes>
        {selectedClientId && (
          <ClientDetailWrapper
            clientId={selectedClientId || ""}
            onBack={() => setSelectedClientId(null)}
          />
        )}
      </main>
    </div>
  );
}