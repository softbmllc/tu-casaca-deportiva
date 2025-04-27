// src/pages/EditProduct.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Product {
  id: number;
  title?: string;
  name?: string;
  category?: string;
  league?: string;
  team?: string;
  priceUSD: number;
  priceUYU: number;
  stock: Record<string, number>;
  images: string[];
  extraDescription?: string;
  descriptionPosition?: "top" | "bottom";
  active: boolean;
  slug?: string;
}

const defaultStock = { S: 0, M: 0, L: 0, XL: 0 };

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem("productos");
    if (local) {
      const products = JSON.parse(local) as Product[];
      const match = products.find((p) => p.id === Number(id));
      if (match) {
        // Asegurar que el producto tiene todos los campos necesarios
        setProduct({
          ...match,
          title: match.title || match.name || "",
          name: match.name || match.title || "",
          league: match.league || match.category || "FÚTBOL",
          category: match.category || match.league || "FÚTBOL",
          active: match.active !== false,
          stock: match.stock || defaultStock,
          images: match.images || [],
          extraDescription: match.extraDescription || "",
          descriptionPosition: match.descriptionPosition || "bottom",
        });
      }
    }
  }, [id]);

  const handleChange = (key: keyof Product, value: any) => {
    if (product) setProduct({ ...product, [key]: value });
    
    // Si se cambia category, actualizar league para mantener sincronización
    if (key === "category" && product) {
      setProduct({ ...product, [key]: value, league: value });
    }
    
    // Si se cambia league, actualizar category para mantener sincronización
    if (key === "league" && product) {
      setProduct({ ...product, [key]: value, category: value });
    }
    
    // Si se cambia name, actualizar title para mantener sincronización
    if (key === "name" && product) {
      setProduct({ ...product, [key]: value, title: value });
    }
    
    // Si se cambia title, actualizar name para mantener sincronización
    if (key === "title" && product) {
      setProduct({ ...product, [key]: value, name: value });
    }
  };

  const handleStockChange = (size: keyof typeof defaultStock, value: number) => {
    if (product) setProduct({ ...product, stock: { ...product.stock, [size]: value } });
  };

  const handleDeleteImage = (index: number) => {
    if (product) {
      const updatedImages = [...product.images];
      updatedImages.splice(index, 1);
      setProduct({ ...product, images: updatedImages });
    }
  };

  const handleImageMove = (index: number, direction: "up" | "down") => {
    if (!product) return;
    const newImages = [...product.images];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target >= 0 && target < newImages.length) {
      [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
      setProduct({ ...product, images: newImages });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !product) return;
    const files = Array.from(e.target.files);
    const sizeLimitMB = 2;
    const validFiles = files.filter((file) => file.size / 1024 / 1024 <= sizeLimitMB);
    setUploading(true);

    const uploadedUrls = await Promise.all(
      validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_preset");
        const res = await fetch("https://api.cloudinary.com/v1_1/ddkyumyw3/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.secure_url;
      })
    );

    setProduct({ ...product, images: [...product.images, ...uploadedUrls] });
    setUploading(false);
  };

  const handleSave = () => {
    if (!product) return;
    const local = localStorage.getItem("productos");
    if (!local) return;
    
    // Generar slug si no existe
    let slug = product.slug;
    if (!slug && (product.name || product.title)) {
      const baseName = (product.name || product.title)?.toLowerCase().replace(/\s+/g, '-') || '';
      slug = `${baseName}-${Date.now().toString(36)}`;
    }
    
    const products = JSON.parse(local) as Product[];
    
    // Crear una versión normalizada del producto con todos los campos necesarios
    const updatedProduct = {
      ...product,
      slug,
      // Asegurar que name y title están sincronizados
      name: product.name || product.title || "",
      title: product.title || product.name || "",
      // Asegurar que league y category están sincronizados
      league: product.league || product.category || "FÚTBOL",
      category: product.category || product.league || "FÚTBOL",
      // Asegurar valores por defecto donde sea necesario
      extraDescription: product.extraDescription || "",
      descriptionPosition: product.descriptionPosition || "bottom",
    };
    
    const updated = products.map((p) => (p.id === product.id ? updatedProduct : p));
    localStorage.setItem("productos", JSON.stringify(updated));
    
    // Notificar a otras pestañas/ventanas que ha habido un cambio
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'productos',
        newValue: JSON.stringify(updated)
      }));
    } catch (error) {
      console.error("Error al disparar evento:", error);
    }
    
    navigate("/admin");
  };

  if (!product) return <p className="p-6">Cargando producto...</p>;

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
      <button
  onClick={() => navigate("/admin")}
  className="flex items-center gap-2 text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded mb-6 text-sm transition"
>
  ← Volver
</button>
      <h2 className="text-xl font-bold mb-4">Editar Publicación</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          value={product.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          className="border px-3 py-2 rounded w-full mb-4"
          placeholder="Título del producto"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Liga/Categoría</label>
        <select
          value={product.league || "FÚTBOL"}
          onChange={(e) => handleChange("league", e.target.value)}
          className="border px-3 py-2 rounded w-full mb-4"
        >
          <option value="Premier League">Premier League</option>
          <option value="La Liga">La Liga</option>
          <option value="Serie A">Serie A</option>
          <option value="Bundesliga">Bundesliga</option>
          <option value="Selecciones">Selecciones</option>
          <option value="Uruguay">Uruguay</option>
          <option value="Retro">Retro</option>
          <option value="FÚTBOL">FÚTBOL (Otro)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-sm font-medium">Precio USD</label>
    <input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={product.priceUSD}
  onChange={(e) => handleChange("priceUSD", Number(e.target.value))}
  className="border px-3 py-2 rounded w-full appearance-none"
/>
  </div>

  <div>
  <label className="block text-sm font-medium">Precio UYU</label>
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={product.priceUYU}
    onChange={(e) => handleChange("priceUYU", Number(e.target.value))}
    className="border px-3 py-2 rounded w-full appearance-none"
  />
</div>
</div>

<div className="mb-4">
  <label className="block font-semibold mb-2">Stock por talle</label>
  <div className="flex gap-4">
    {Object.keys(product.stock).map((size) => (
      <div key={size} className="flex flex-col items-center text-sm">
        <label className="mb-1 font-medium">{size}</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={product.stock[size as keyof typeof defaultStock]}
          onChange={(e) => handleStockChange(size as keyof typeof defaultStock, Number(e.target.value))}
          className="border px-3 py-1 rounded text-center w-20 appearance-none"
        />
      </div>
    ))}
  </div>
</div>

<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Descripción adicional</label>
  <textarea
    value={product.extraDescription || ""}
    onChange={(e) => handleChange("extraDescription", e.target.value)}
    className="border px-3 py-2 rounded w-full"
    placeholder="Escribí una descripción extra para el producto..."
  />
</div>

<div className="mt-2">
  <label className="block text-sm font-medium mb-1">Posición de la descripción adicional</label>
  <div className="flex gap-4">
    <label className="flex items-center">
      <input
        type="radio"
        name="descriptionPosition"
        value="top"
        checked={product.descriptionPosition === "top"}
        onChange={() => handleChange("descriptionPosition", "top")}
        className="mr-2"
      />
      Arriba
    </label>
    <label className="flex items-center">
      <input
        type="radio"
        name="descriptionPosition"
        value="bottom"
        checked={product.descriptionPosition === "bottom"}
        onChange={() => handleChange("descriptionPosition", "bottom")}
        className="mr-2"
      />
      Abajo
    </label>
  </div>
</div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Imágenes</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
        />
        {uploading && <p className="text-sm text-gray-500 mt-2">Subiendo imágenes...</p>}

        {product.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {product.images.map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} alt={`img-${idx}`} className="w-full rounded shadow" />
                <button
                  onClick={() => handleDeleteImage(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
                <div className="flex justify-center gap-1 mt-1">
                  <button
                    onClick={() => handleImageMove(idx, "up")}
                    disabled={idx === 0}
                    className="text-xs bg-gray-200 px-1 py-0.5 rounded hover:bg-gray-300 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleImageMove(idx, "down")}
                    disabled={idx === product.images.length - 1}
                    className="text-xs bg-gray-200 px-1 py-0.5 rounded hover:bg-gray-300 disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={product.active}
            onChange={(e) => handleChange("active", e.target.checked)}
            className="mr-2"
          />
          <span>Producto activo</span>
        </label>
      </div>

      <button
        onClick={handleSave}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
      >
        Guardar Cambios
      </button>
    </div>
  );
}