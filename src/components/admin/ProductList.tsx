// src/components/admin/ProductList.tsx
import { useEffect, useState } from "react";
import productCatalog from "../../data/products";
import { Product as BaseProduct } from "../../data/types";
import { useNavigate } from "react-router-dom";
import ModalConfirm from "./ModalConfirm";

interface AdminProduct extends Partial<BaseProduct> {
  id: number;
  name: string;
  title: string;
  league: string;
  category: string;
  extraDescription?: string;
  descriptionPosition?: "top" | "bottom";
}

export default function ProductList() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filter, setFilter] = useState("Todas");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = () => {
      const local = localStorage.getItem("productos");
      if (local) {
        const parsedProducts = JSON.parse(local);
        const normalizedProducts = parsedProducts.map((p: AdminProduct) => ({
          ...p,
          title: p.title || p.name || "",
          name: p.name || p.title || "",
          active: p.active !== false,
          league: p.league || p.category || "FÚtbol",
          category: p.category || p.league || "FÚtbol",
          extraDescription: p.extraDescription || "",
          descriptionPosition: p.descriptionPosition || "bottom",
          stock: p.stock || { S: 0, M: 0, L: 0, XL: 0 },
          images: p.images || [],
          slug: p.slug || `${p.id}-${(p.name || p.title || "").toLowerCase().replace(/\s+/g, '-')}`
        }));
        setProducts(normalizedProducts);
      } else {
        initializeProductsFromCatalog();
      }
    };

    const initializeProductsFromCatalog = () => {
      const enriched = productCatalog.map((p, index) => ({
        ...p,
        id: p.id || index + 1,
        title: p.name,
        extraDescription: "",
        descriptionPosition: "bottom" as const,
        active: true,
        category: p.league || p.category || "FÚtbol",
        league: p.league || p.category || "FÚtbol",
        stock: p.stock || { S: 0, M: 0, L: 0, XL: 0 },
        images: p.images || [],
      }));
      localStorage.setItem("productos", JSON.stringify(enriched));
      setProducts(enriched);
    };

    loadProducts();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "productos") {
        loadProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveToStorage = (updated: AdminProduct[]) => {
    localStorage.setItem("productos", JSON.stringify(updated));
    setProducts(updated);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'productos',
      newValue: JSON.stringify(updated)
    }));
  };

  const toggleActive = (id: number) => {
    const updated = products.map((p) => p.id === id ? { ...p, active: !p.active } : p);
    saveToStorage(updated);
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/editar/${id}`);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const confirmDelete = () => {
    if (confirmDeleteId !== null) {
      const updated = products.filter((p) => p.id !== confirmDeleteId);
      saveToStorage(updated);
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
  };

  const uniqueCategories = [
    "Todas",
    ...Array.from(new Set(products.map((p) => p.league || p.category || "Fútbol")))
  ].sort();

  const filteredProducts =
    filter === "Todas"
      ? products
      : products.filter((p) => (p.league || p.category) === filter);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Publicaciones</h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Filtrar por categoría:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-500 italic">No hay productos publicados.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Título</th>
              <th className="py-2 text-left">Liga</th>
              <th className="py-2 text-left">Precio</th>
              <th className="py-2 text-left">Stock</th>
              <th className="py-2 text-left">Estado</th>
              <th className="py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="py-2">{product.title || product.name}</td>
                <td className="py-2">{product.league || product.category || "Fútbol"}</td>
                <td className="py-2">{product.priceUSD || product.usdPrice} USD / {product.priceUYU || product.uyuPrice} UYU</td>
                <td className="py-2">{Object.entries(product.stock || {}).map(([talle, cant]) => `${talle}: ${cant}`).join(", ")}</td>
                <td className="py-2">{product.active === false ? "Inactivo" : "Activo"}</td>
                <td className="py-2 space-x-2">
                  <button onClick={() => handleEdit(product.id)} className="text-blue-600 hover:underline text-sm">Editar</button>
                  <button onClick={() => toggleActive(product.id)} className="text-yellow-600 hover:underline text-sm">{product.active === false ? "Activar" : "Desactivar"}</button>
                  <button onClick={() => handleDeleteClick(product.id, product.title || product.name)} className="text-red-600 hover:underline text-sm">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {confirmDeleteId !== null && (
        <ModalConfirm
          title="¿Confirmar eliminación?"
          message={`¿Seguro que quieres eliminar "${confirmDeleteName}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}