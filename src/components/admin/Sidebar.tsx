// src/components/admin/Sidebar.tsx
import React from "react";

interface SidebarProps {
  activeView: string;
  onChangeView: (view: string) => void;
}

export default function Sidebar({ activeView, onChangeView }: SidebarProps) {
  const menuItems = [
    { label: "Clientes", view: "clients" },
    { label: "Ver Publicaciones", view: "productList" },
    { label: "Crear Publicaciones", view: "productForm" },
    { label: "Historial de Pedidos", view: "orders" },
    { label: "Usuarios", view: "users" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen px-4 py-6">
      <h2 className="text-lg font-bold mb-6">Panel de Administración</h2>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onChangeView(item.view)}
            className={`w-full text-left px-4 py-2 rounded font-medium transition ${
              activeView === item.view
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}