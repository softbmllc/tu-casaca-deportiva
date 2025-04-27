// src/pages/AdminPanel.tsx
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import ClientList from "../components/admin/ClientList";
import ProductList from "../components/admin/ProductList";
import ProductForm from "../components/admin/ProductForm";
import OrderList from "../components/admin/OrderList";
import UserList from "../components/admin/UserList";
import { useEffect, useState } from "react";

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState("clients");
  
  // Actualizar activeView basado en la URL actual
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
      {/* Sidebar que cambia usando navigate */}
      <Sidebar activeView={activeView} onChangeView={handleViewChange} />

      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Routes>
          <Route index element={<Navigate to="/admin/clients" replace />} />
          <Route path="clients" element={<ClientList onSelectClient={() => {}} />} />
          <Route path="productList" element={<ProductList />} />
          <Route path="productForm" element={<ProductForm />} />
          <Route path="orders" element={<OrderList onSelectOrder={() => {}} />} />
          <Route path="users" element={<UserList />} />
          {/* Añadir ruta para editar producto */}
          <Route path="editar/:id" element={<ProductForm />} />
          {/* Ruta de fallback */}
          <Route path="*" element={<Navigate to="/admin/clients" replace />} />
        </Routes>
      </main>
    </div>
  );
}