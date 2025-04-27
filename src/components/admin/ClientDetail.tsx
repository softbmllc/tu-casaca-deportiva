// src/components/admin/ClientDetail.tsx
import { useEffect, useState } from "react";

interface Props {
  clientId: number;
  onBack: () => void;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
  country: string;
}

interface Pedido {
  id: number;
  total: number;
  fecha: string;
  estado: string;
  cliente: {
    email: string;
  };
}

export default function ClientDetail({ clientId, onBack }: Props) {
  const [client, setClient] = useState<Client | null>(null);
  const [editing, setEditing] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const data = localStorage.getItem("usuarios");
    if (data) {
      const usuarios = JSON.parse(data) as Client[];
      const found = usuarios.find((u) => u.id === clientId);
      if (found) setClient(found);
    }
  }, [clientId]);

  useEffect(() => {
    if (!client) return;
    const pedidosData = localStorage.getItem("pedidos");
    if (pedidosData) {
      const allPedidos = JSON.parse(pedidosData) as Pedido[];
      const filtered = allPedidos.filter((p) => p.cliente?.email === client.email);
      setPedidos(filtered);
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client) return;
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
  };

  const handleSave = () => {
    if (!client) return;
    const data = localStorage.getItem("usuarios");
    if (data) {
      const usuarios = JSON.parse(data) as Client[];
      const updated = usuarios.map((u) => (u.id === client.id ? client : u));
      localStorage.setItem("usuarios", JSON.stringify(updated));
      setEditing(false);
    }
  };

  if (!client) return <p className="text-red-600 p-6 font-bold">Cliente no encontrado.</p>;

  return (
    <div className="p-6 bg-white rounded shadow max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Perfil del Cliente</h2>
  
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 font-medium ${
            activeTab === "personal" ? "border-b-2 border-black" : "text-gray-500"
          }`}
        >
          Datos Personales
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 font-medium ${
            activeTab === "orders" ? "border-b-2 border-black" : "text-gray-500"
          }`}
        >
          Historial de Pedidos
        </button>
      </div>
      {activeTab === "personal" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-semibold">Nombre</label>
              <input
                type="text"
                name="name"
                value={client.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block font-semibold">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={client.phone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block font-semibold">Dirección</label>
              <input
                type="text"
                name="address"
                value={client.address}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block font-semibold">Ciudad</label>
              <input
                type="text"
                name="city"
                value={client.city}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block font-semibold">Departamento</label>
              <input
                type="text"
                name="department"
                value={client.department}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block font-semibold">Código Postal</label>
              <input
                type="text"
                name="postalCode"
                value={client.postalCode}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block font-semibold">País</label>
              <input
                type="text"
                name="country"
                value={client.country}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                disabled={!editing}
              />
            </div>
          </div>
          <div className="flex gap-4">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Editar datos
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Guardar cambios
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </>
      )}
      {activeTab === "orders" && (
        <div>
          {pedidos.length === 0 ? (
            <p className="text-gray-500 italic">Este cliente aún no tiene pedidos registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">ID</th>
                  <th className="py-2 text-left">Total</th>
                  <th className="py-2 text-left">Estado</th>
                  <th className="py-2 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b">
                    <td className="py-2">{pedido.id}</td>
                    <td className="py-2">{pedido.total} USD</td>
                    <td className="py-2">{pedido.estado}</td>
                    <td className="py-2">{new Date(pedido.fecha).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
);
}
