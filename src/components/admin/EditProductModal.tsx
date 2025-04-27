// src/components/admin/EditProductModal.tsx
import { useState } from "react";
import { teamsByCategory } from "../../data/teams";

interface Product {
  id: string;
  name: string;
  team: string;
  league?: string;
  category?: string;
  usdPrice: string | number;
  uyuPrice: string | number;
  stock: Record<string, number>;
  descriptionTop: string;
  descriptionBottom: string;
  active?: boolean;
  images?: string[];
  title?: string;
  slug?: string;
}

interface Props {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onClose: () => void;
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const allLeagues = Object.keys(teamsByCategory).sort();

export default function EditProductModal({ product, onSave, onClose }: Props) {
  const [formData, setFormData] = useState<Product>({ ...product });

  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "team") {
      let newLeague = "";
      Object.entries(teamsByCategory).forEach(([category, teams]) => {
        if (teams.includes(value)) {
          newLeague = category;
        }
      });
      if (newLeague) {
        setFormData((prev) => ({ ...prev, league: newLeague, category: newLeague }));
      }
    }
  };

  const handleStockChange = (size: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      stock: { ...prev.stock, [size]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let slug = formData.slug;
    if (!slug && formData.name) {
      slug = `${formData.name.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-").replace(/[^\w-]/g, "")}-${Date.now().toString(36)}`;
    }
    const name = formData.name || formData.title || "";
    const active = formData.active !== false;
    onSave({
      ...formData,
      name,
      title: name,
      slug,
      images: formData.images || [],
      active,
      league: formData.league || "F\u00daTBOL",
      category: formData.league || "F\u00daTBOL",
      usdPrice: typeof formData.usdPrice === "string" ? parseInt(formData.usdPrice) : formData.usdPrice,
      uyuPrice: typeof formData.uyuPrice === "string" ? parseInt(formData.uyuPrice) : formData.uyuPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-2xl space-y-6 shadow-lg overflow-y-auto max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-600 hover:text-black hover:underline"
        >
          🔍 Volver
        </button>

        <h2 className="text-xl font-bold">Editar producto</h2>

        <div>
          <label className="block font-semibold mb-1">Nombre del producto</label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Liga/Categoría</label>
          <select
            value={formData.league || ""}
            onChange={(e) => handleChange("league", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Seleccionar liga</option>
            {allLeagues.map((league) => (
              <option key={league} value={league}>{league}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Equipo</label>
          <select
            value={formData.team || ""}
            onChange={(e) => handleChange("team", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Seleccionar equipo</option>
            {Object.entries(teamsByCategory).map(([cat, teams]) => (
              <optgroup key={cat} label={cat}>
                {teams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Precio USD</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.usdPrice || ""}
              onChange={(e) => handleChange("usdPrice", e.target.value)}
              className="w-full border px-3 py-2 rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Precio UYU</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.uyuPrice || ""}
              onChange={(e) => handleChange("uyuPrice", e.target.value)}
              className="w-full border px-3 py-2 rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Descripción adicional (arriba)</label>
          <textarea
            value={formData.descriptionTop || ""}
            onChange={(e) => handleChange("descriptionTop", e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Descripción adicional (abajo)</label>
          <textarea
            value={formData.descriptionBottom || ""}
            onChange={(e) => handleChange("descriptionBottom", e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Stock por talle</label>
          <div className="grid grid-cols-3 gap-4">
            {sizes.map((size) => (
              <div key={size}>
                <label className="block text-sm font-medium mb-1">{size}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.stock[size] || ""}
                  onChange={(e) => handleStockChange(size, Number(e.target.value))}
                  className="w-full border px-2 py-1 rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-black/80"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
