// src/components/admin/ProductList.tsx

import { useEffect, useState } from "react";
import { Product, Category, Subcategory } from "../../data/types";
import { fetchProducts, deleteProduct, fetchProductById, updateProduct } from "../../firebaseUtils";
import EditProductModal from "./EditProductModal";
import ModalConfirm from "./ModalConfirm";
import { normalizeProduct } from "@/utils/normalizeProduct";
import { fetchCategories, fetchAllSubcategories } from "@/firebaseUtils";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  console.log("🔍 subcategories cargadas:", subcategories);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedCategories = await fetchCategories();
        const fetchedSubcategories = (await fetchAllSubcategories()) as Subcategory[];

        // ✅ Guardamos en el estado para usos futuros
        setCategories(fetchedCategories);
        setSubcategories(fetchedSubcategories);

        const productsData = await fetchProducts();

        // 🧠 Usamos las variables locales directamente (no el estado)
        console.log("🧪 Paso previo a normalizeProduct – subcategories disponibles:", fetchedSubcategories);

        const normalizedProducts = productsData.map((p) => {
          try {
            return normalizeProduct(p, fetchedCategories, fetchedSubcategories);
          } catch (e) {
            console.warn("Error normalizando producto:", p, e);
            return null;
          }
        });

        setProducts(normalizedProducts.filter((p) => p !== null));
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("No se pudieron cargar los productos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEdit = async (id: string) => {
    try {
      const raw = await fetchProductById(id);
      if (raw) {
        // ⚠️ Cargamos categorías y subcategorías FRESCAS para que normalizeProduct tenga la data necesaria
        const freshCategories = await fetchCategories();
        const freshSubcategories = await fetchAllSubcategories();

        const normalized = normalizeProduct(raw, freshCategories, freshSubcategories);
        setEditingProduct(normalized);
        setIsModalOpen(true);
      } else {
        setError(`No se encontró el producto con ID: ${id}`);
      }
    } catch (error) {
      console.error("Error al cargar producto para editar:", error);
      setError("No se pudo cargar el producto para editar. Intenta nuevamente.");
    }
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      if (updatedProduct.id) {
        await updateProduct(updatedProduct.id, updatedProduct);
        const fresh = await fetchProductById(updatedProduct.id);

        // 🔁 Refrescamos subcategorías manualmente desde Firebase para asegurar consistencia
        const freshSubcategories = await fetchAllSubcategories();

        if (fresh) {
          const normalized = normalizeProduct(fresh, categories, freshSubcategories);
          setEditingProduct(normalized);
        }

        const refreshedProducts = await fetchProducts();
        const normalizedRefreshed = refreshedProducts.map((p) => {
          try {
            return normalizeProduct(p, categories, freshSubcategories);
          } catch (e) {
            console.warn("Error normalizando producto actualizado:", p, e);
            return null;
          }
        });
        setProducts(normalizedRefreshed.filter((p) => p !== null));
        setIsModalOpen(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setError("No se pudo guardar el producto. Intenta nuevamente.");
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      await updateProduct(id, { active: !product.active });
      const refreshedProducts = await fetchProducts();
      setProducts(refreshedProducts);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setError("No se pudo actualizar el estado del producto.");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      try {
        await deleteProduct(confirmDeleteId);
        const refreshedProducts = await fetchProducts();
        setProducts(refreshedProducts);
        setConfirmDeleteId(null);
        setConfirmDeleteName("");
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        setError("No se pudo eliminar el producto.");
      }
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
  };

  const uniqueLeagues = [
    "Todas",
    ...Array.from(
      new Set(
        products
          .map((p) =>
            typeof p.category === "object" ? p.category?.name : p.category
          )
          .filter(Boolean)
      )
    ),
  ].sort();

  const filteredProducts =
    filter === "Todas"
      ? products
      : products.filter(
          (p) =>
            (typeof p.category === "object"
              ? p.category?.name
              : p.category) === filter
        );

  const visibleProducts = filteredProducts.filter((p) =>
    p.title?.es?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Publicaciones</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
          <button onClick={() => setError(null)} className="ml-2">&times;</button>
        </div>
      )}

      <div className="mb-4">
        <label className="mr-2 font-medium">Filtrar por categoría:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        >
          {uniqueLeagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>
      </div>

      {/* Buscador de productos por título */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black w-full md:w-1/3"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando productos...</div>
      ) : visibleProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 italic">No hay productos.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700 font-semibold">
                <th className="py-2 text-left">Título</th>
                <th className="py-2 text-left">Marca</th>
                <th className="py-2 text-left">Subcategoría</th>
                <th className="py-2 text-left">Precio</th>
                <th className="py-2 text-left">Stock</th>
                <th className="py-2 text-left">Estado</th>
                <th className="py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-2">{product.title.es}</td>
                  <td className="py-2">
                    {typeof product.category === "object"
                      ? product.category?.name
                      : product.category || "Sin categoría"}
                  </td>
                  <td className="py-2">
                    {typeof product.subcategory === "object"
                      ? product.subcategory?.name || "Sin subcategoría"
                      : "Sin subcategoría"}
                  </td>
                  <td className="py-2">
                    US$ {product.variants?.[0]?.options?.[0]?.priceUSD ?? product.priceUSD}
                  </td>
                  <td className="py-2">{product.stockTotal ?? 0}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <button onClick={() => handleEdit(product.id!)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-800 rounded hover:bg-gray-100 transition">
                        ✏️ Editar
                      </button>
                      <button onClick={() => toggleActive(product.id!)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 rounded hover:bg-yellow-100 transition">
                        🔄 {product.active ? "Desactivar" : "Activar"}
                      </button>
                      <button onClick={() => handleDeleteClick(product.id!, product.title.es)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 border border-red-300 text-red-800 rounded hover:bg-red-100 transition">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDeleteId && (
        <ModalConfirm
          title="¿Eliminar producto?"
          message={`¿Seguro que quieres eliminar "${confirmDeleteName}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={false}
        />
      )}

      {isModalOpen && editingProduct && (
        <EditProductModal
          key={editingProduct.id}
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          subcategories={subcategories} // 🔁 Pasamos las subcategorías como prop
        />
      )}
    </div>
  );
}