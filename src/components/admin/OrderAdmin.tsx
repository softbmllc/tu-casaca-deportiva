// src/components/admin/OrderAdmin.tsx

// Utilidad para obtener info del cliente desde diferentes fuentes
const getClienteInfo = (pedido: Order) => {
  const cliente = (typeof pedido.client === 'object' && pedido.client !== null)
    ? pedido.client
    : typeof pedido.clientInfo === 'object'
    ? pedido.clientInfo
    : typeof pedido.shippingInfo === 'object'
    ? pedido.shippingInfo
    : {};

  return {
    nombre: cliente.nombre || cliente.name || "-",
    telefono: cliente.telefono || cliente.phone || "-",
    direccion: cliente.direccion || cliente.address || pedido.address || pedido.shippingInfo?.address || "-",
    address: cliente.address || pedido.address || pedido.shippingInfo?.address || "-",
    address2: cliente.address2 || (cliente as any)?.apto || (cliente as any)?.address_line2 || (pedido.shippingInfo?.address2 || "-"),
    email: cliente.email || "-"
  };
};

import { useState, useEffect } from "react";
import { CartItem } from "@/data/types";
import { discountStockByOrder } from "@/firebaseUtils";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase"; // asumimos que ya existe tu instancia db

interface ClientInfo {
  name?: string;
  nombre?: string;
  email?: string;
  phone?: string;
  telefono?: string;
  address?: string;
  address2?: string;
  direccion?: string;
  country?: string;
}

interface ShippingInfo {
  // Define properties as needed, or leave empty if unknown
  [key: string]: any;
}

interface OrderItem {
  title?: { es?: string };
  name?: { es?: string };
  options?: string;
  quantity?: number;
  price?: number;
}

interface Order {
  id: number | string;
  client: string | ClientInfo;
  items: OrderItem[] | string[];
  total: number;
  status: "En Proceso" | "Cancelado" | "Confirmado" | "Entregado" | "Enviado";
  address: string;
  city: string;
  department: string;
  postalCode: string;
  phone?: string;
  createdAt: Date;
  clientInfo?: ClientInfo;
  amountPaid?: number;
  shippingInfo?: ShippingInfo;
  totalAmount?: number;
}

export default function OrderAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  // Para tipado de la función handleStatusChange
  type OrderType = Order;
  // Nueva función para cambiar el estado de un pedido y descontar stock si corresponde
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find((o: OrderType) => o.id === orderId);
    if (!order) return;

    // Actualizar en Firestore
    // await updateOrderStatus(order.id, newStatus); // Si se requiere, reimplementa updateOrderStatus aquí
    if (newStatus === "Confirmado" && order.status !== "Confirmado") {
      await discountStockByOrder({ cartItems: order.items as CartItem[] });
    }

    const updatedOrders: Order[] = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
    );
    setOrders(updatedOrders);
  };
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // Estado para el filtro de estado de pedido
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const snapshot = await getDocs(collection(db, "orders"));
      const docs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const cliente = data.cliente || {};
        const clientRaw = data.clientInfo || data.client || {};
        const shippingRaw = data.shippingInfo || {};

        return {
          id: docSnap.id,
          client: {
            name: clientRaw.name || clientRaw.nombre || cliente.nombre || "-",
            email: clientRaw.email || cliente.email || "-",
            phone: clientRaw.phone || clientRaw.telefono || cliente.telefono || "-",
          },
          address: shippingRaw.address || cliente.direccion || data.address || "-",
          city: shippingRaw.city || cliente.ciudad || data.city || "-",
          department: shippingRaw.state || cliente.departamento || data.department || "-",
          postalCode: shippingRaw.postalCode || cliente.codigoPostal || data.postalCode || shippingRaw.zip || shippingRaw.zipCode || "-",
          items: data.items || [],
          total: data.total || 0,
          amountPaid: data.amountPaid || data.total || 0,
          status: data.status || "En proceso",
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          shippingInfo: shippingRaw,
          totalAmount: data.totalAmount || data.total || 0,
        } as Order;
      });
      setOrders(docs);
    };

    fetchOrders();
  }, []);

  const cycleStatus = (status: Order["status"]): Order["status"] => {
    const order = ["En proceso", "Cancelado", "Confirmado", "Entregado", "Enviado"];
    const index = order.indexOf(status);
    return order[(index + 1) % order.length] as Order["status"];
  };

  const updateStatus = async (id: number | string, newStatus: Order["status"]) => {
    const order = orders.find((order) => order.id === id);
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    // Actualizar en Firestore
    await updateDoc(doc(db, "orders", id.toString()), {
      status: newStatus,
    });
    // Descontar stock si corresponde
    if (order && newStatus === 'Confirmado' && order.status !== 'Confirmado') {
      try {
        await discountStockByOrder({ cartItems: order.items as any });
        console.log('Stock actualizado con éxito');
      } catch (err) {
        console.error('Error al descontar stock:', err);
      }
    }
  };

  const generateLabel = async (order: Order) => {
    console.log("[Etiqueta] Generando para:", order);
    const doc = new jsPDF({ orientation: "landscape", unit: "in", format: [4, 6] });
  
    // Cargar imagen como base64
    const response = await fetch("/logo-etiqueta.png");
    const blob = await response.blob();
    const reader = new FileReader();
  
    reader.onloadend = async () => {
      const base64data = reader.result as string;
  
      // Recuadro
      doc.setDrawColor(200);
      doc.rect(0.2, 0.2, 5.6, 3.6);
  
      // Título
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Etiqueta de Envío", 3, 0.6, { align: "center" });
  
      // Logo
      doc.addImage(base64data, "PNG", 0.4, 1.0, 1.6, 1.6);
  
      // Campos
      doc.setFontSize(12);
      let y = 1.0;
      const labelX = 2.4;
      const valueX = 3.8;
  
      const drawRow = (label: string, value: string) => {
        doc.setFont(undefined, "bold");
        doc.text(`${label}:`, labelX, y);
        doc.setFont(undefined, "normal");
        doc.text(value, valueX, y);
        y += 0.35;
      };
  
      drawRow("Orden", `${order.id ?? "-"}`);
      drawRow("Nombre", typeof order.client === "object" ? order.client?.name || "-" : order.client);
      drawRow("Teléfono", typeof order.client === "object" ? order.client?.phone || "-" : "-");
      drawRow("Dirección", order.address);
      drawRow("Ciudad", order.city);
      drawRow("Departamento", order.department);
      drawRow("Código Postal", order.postalCode);

      // Generar imagen QR en base64 con el ID
      const qrDataUrl = await QRCode.toDataURL(`ID-${order.id}`);
      doc.addImage(qrDataUrl, "PNG", 5.0, 2.8, 0.8, 0.8); // Ubicación esquina inferior derecha
  
      doc.save(`Etiqueta-${order.client}.pdf`);
    };
  
    reader.readAsDataURL(blob);
  };

  const exportCSV = () => {
    const csv = [
      ["ID", "Cliente", "Productos", "Total", "Estado"],
      ...orders.map((o) => [
        o.id,
        `"${typeof o.client === "object" ? o.client.name : o.client}"`,
        `"${o.items}"`,
        `"${o.total} USD"`,
        `"${o.status}"`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pedidos.csv";
    link.click();
  };

  // Filtrar pedidos según el filtro visual y el término de búsqueda
  const pedidosFiltrados = orders.filter((pedido) => {
    const estadoMatch =
      filtroEstado === "Todos"
        ? true
        : pedido.status === filtroEstado;
    const clienteInfo = getClienteInfo(pedido);
    const nombre = clienteInfo.nombre || "Sin nombre";
    const email = clienteInfo.email || "";
    const busquedaMatch =
      nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      email.toLowerCase().includes(busqueda.toLowerCase());
    return estadoMatch && busquedaMatch;
  });

  // Función para formatear la fecha
  function formatDate(date: Date | string) {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString();
  }

  // Acciones de detalle, imprimir, eliminar
  function handleVerDetalle(pedido: Order) {
    setSelectedOrder(pedido);
  }
  function handleImprimirEtiqueta(pedido: Order) {
    generateLabel(pedido);
  }
  function handleEliminarPedido(id: number | string) {
    setOrderToDelete(orders.find((o) => o.id === id) || null);
  }


  if (!Array.isArray(orders)) {
    console.error("Error: orders no es un array", orders);
    return <div className="p-4 text-red-600 font-semibold">Error al cargar los pedidos.</div>;
  }
  console.log("[PEDIDOS RENDERIZADOS]", orders);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Historial de Pedidos</h1>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-4">
        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="Todos">Todos</option>
          <option value="En proceso">En proceso</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Enviado">Enviado</option>
        </select>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-1 min-w-[200px]"
        />
      </div>

      {/* Tabla de pedidos */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">Teléfono</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {pedidosFiltrados.map((pedido) => {
              const clienteInfo = getClienteInfo(pedido);
              return (
                <tr key={pedido.id}>
                  <td className="px-4 py-2 text-sm text-gray-800">{formatDate(pedido.createdAt)}</td>
                  <td className="px-4 py-2 border">{pedido.shippingInfo?.name || 'No disponible'}</td>
                  <td className="px-4 py-2 border">{pedido.shippingInfo?.email || 'No disponible'}</td>
                  <td className="px-4 py-2 border">{pedido.shippingInfo?.phone || 'No disponible'}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {(() => {
                      const total = Array.isArray(pedido.items)
                        ? pedido.items.reduce((sum, item) => {
                            if (typeof item !== "object") return sum;
                            const price =
                              item?.price !== undefined
                                ? item.price
                                : (item as any)?.priceUSD ?? 0;
                            const quantity = item?.quantity ?? 0;
                            return sum + price * quantity;
                          }, 0)
                        : 0;
                      return `$${total.toFixed(2)}`;
                    })()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <select
                      value={pedido.status}
                      onChange={(e) => updateStatus(pedido.id, e.target.value as Order["status"])}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmado">Confirmado</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 flex gap-2">
                    <button
                      onClick={() => handleVerDetalle(pedido)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver detalle
                    </button>
                    <button
                      onClick={() => handleImprimirEtiqueta(pedido)}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Imprimir
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Estás seguro que deseas eliminar la orden ${pedido.id}?`)) {
                          deleteDoc(doc(db, "orders", pedido.id.toString()));
                          setOrders(orders.filter(o => o.id !== pedido.id));
                        }
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedOrder && (() => {
        const clienteInfo = getClienteInfo(selectedOrder);
        // Calcular el total correctamente sumando los subtotales de cada producto
        const total =
          Array.isArray(selectedOrder.items)
            ? selectedOrder.items.reduce(
                (sum, item) =>
                  typeof item === "object"
                    ? sum +
                      (
                        ((item.price !== undefined ? item.price : (item as any).priceUSD ?? 0) *
                        (item.quantity ?? 0))
                      )
                    : sum,
                0
              )
            : 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">Detalle del Pedido</h2>
              {/* Datos del cliente por shippingInfo */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Datos del cliente</h3>
                <p><strong>Nombre:</strong> {selectedOrder?.shippingInfo?.name || 'No disponible'}</p>
                <p><strong>Email:</strong> {selectedOrder?.shippingInfo?.email || 'No disponible'}</p>
                <p><strong>Teléfono:</strong> {selectedOrder?.shippingInfo?.phone || 'No disponible'}</p>
              </div>
              <div className="mb-4">
                <p><strong>ID:</strong> {selectedOrder.id}</p>
                <p>
                  <strong>Dirección:</strong>{" "}
                  {
                    [
                      clienteInfo.address,
                      clienteInfo.address2,
                      selectedOrder.city,
                      selectedOrder.department,
                      selectedOrder.postalCode
                    ].filter(Boolean).join(', ') || '-'
                  }
                </p>
              </div>
              <div className="mb-4">
                <h3 className="font-bold mb-2">Productos:</h3>
                <table className="w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Producto</th>
                      <th className="border px-2 py-1">Variante</th>
                      <th className="border px-2 py-1">Cantidad</th>
                      <th className="border px-2 py-1">Precio Unitario</th>
                      <th className="border px-2 py-1">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedOrder.items) &&
                      selectedOrder.items.map((item, index) => {
                        if (typeof item === "string") return null;
                        const title = item.title?.es || item.name?.es || "Producto";
                        const variant = item.options || "-";
                        const quantity = item.quantity ?? 0;
                        const price = item.price ?? 0;
                        const subtotal = (price * quantity).toFixed(2);

                        return (
                          <tr key={index}>
                            <td className="border px-2 py-1">{title}</td>
                            <td className="border px-2 py-1">{variant}</td>
                            <td className="border px-2 py-1">{quantity}</td>
                            <td className="border px-2 py-1">${price.toFixed(2)}</td>
                            <td className="border px-2 py-1">${subtotal}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <p className="font-semibold mt-2 text-right">
                  Total: ${total.toFixed(2)}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Cerrar</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}