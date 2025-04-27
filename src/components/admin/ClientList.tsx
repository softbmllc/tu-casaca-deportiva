// src/components/admin/ClientList.tsx
import { useState, useEffect } from "react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  department?: string;
  postalCode?: string;
  country?: string;
}

interface Props {
  onSelectClient: (id: number) => void;
}

export default function ClientList({ onSelectClient }: Props) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const savedClients = JSON.parse(localStorage.getItem("usuarios") || "[]");
    setClients(savedClients);
  }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lista de Clientes</h2>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-1 rounded text-sm"
        />
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Email</th>
            <th className="py-2">Teléfono</th>
            <th className="py-2">Dirección</th>
            <th className="py-2">País</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((client) => (
            <tr key={client.id} className="border-b">
              <td className="py-2">{client.name}</td>
              <td className="py-2">{client.email}</td>
              <td className="py-2">{client.phone}</td>
              <td className="py-2">{client.address}</td>
              <td className="py-2">{client.country}</td>
              <td className="py-2">
                <button
                  onClick={() => onSelectClient(client.id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver perfil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}