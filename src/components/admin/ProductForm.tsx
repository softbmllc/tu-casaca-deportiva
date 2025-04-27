// src/components/admin/ProductForm.tsx
import { useState } from "react";
import { toast } from "react-hot-toast";

interface Product {
  id: number;
  title: string;
  category: string;
  priceUSD: number;
  priceUYU: number;
  stock: Record<string, number>;
  images: string[];
  extraDescription: string;
  descriptionPosition: "top" | "bottom";
}

type UploadedImage = {
  url: string;
  publicId: string;
};

const defaultStock = { S: 0, M: 0, L: 0, XL: 0 };
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddkyumyw3/image/upload";
const UPLOAD_PRESET = "unsigned_preset";

export default function ProductForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Premier League");
  const [priceUSD, setPriceUSD] = useState(0);
  const [priceUYU, setPriceUYU] = useState(0);
  const [stock, setStock] = useState(defaultStock);
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [extraDescription, setExtraDescription] = useState("");
  const [descriptionPosition, setDescriptionPosition] = useState<"top" | "bottom">("bottom");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const sizeLimitMB = 2;
      const validFiles = files.filter((file) => file.size / 1024 / 1024 <= sizeLimitMB);

      setUploading(true);

      const uploads = await Promise.all(
        validFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          return { url: data.secure_url, publicId: data.public_id };
        })
      );

      setUploadedImages((prev) => [...prev, ...uploads]);
      setUploading(false);
    }
  };

  const handleImageMove = (index: number, direction: "up" | "down") => {
    const newPreviews = [...uploadedImages];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target >= 0 && target < newPreviews.length) {
      [newPreviews[index], newPreviews[target]] = [newPreviews[target], newPreviews[index]];
      setUploadedImages(newPreviews);
    }
  };

  const handleImageDelete = async (publicId: string) => {
    try {
      await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      setUploadedImages((prev) => prev.filter((img) => img.publicId !== publicId));
    } catch (error) {
      alert("Error al eliminar la imagen");
      console.error(error);
    }
  };

  const handleStockChange = (size: keyof typeof stock, value: number) => {
    setStock({ ...stock, [size]: value });
  };

  const handleSubmit = () => {
    const newProduct: Product = {
      id: Date.now(),
      title,
      category,
      priceUSD,
      priceUYU,
      stock,
      images: uploadedImages.map((img) => img.url),
      extraDescription,
      descriptionPosition,
    };

    const products = JSON.parse(localStorage.getItem("productos") || "[]");
    localStorage.setItem("productos", JSON.stringify([...products, newProduct]));

    toast.success("Producto creado exitosamente");
    setTitle("");
    setCategory("Premier League");
    setPriceUSD(0);
    setPriceUYU(0);
    setStock(defaultStock);
    setUploadedImages([]);
    setExtraDescription("");
    setDescriptionPosition("bottom");
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Crear Publicación</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option>Premier League</option>
          <option>La Liga</option>
          <option>Serie A</option>
          <option>Bundesliga</option>
          <option>Selecciones</option>
          <option>Uruguay</option>
          <option>NBA</option>
          <option>Retro</option>
        </select>

        <div>
          <label className="block text-sm font-medium">Precio USD</label>
          <input
  type="text"
  inputMode="numeric"
  pattern="\d*"
  value={priceUSD === 0 ? "" : priceUSD}
  onChange={(e) => setPriceUSD(Number(e.target.value) || 0)}
  className="border px-3 py-2 rounded w-full appearance-none"
/>
        </div>

        <div>
          <label className="block text-sm font-medium">Precio UYU</label>
          <input
  type="text"
  inputMode="numeric"
  pattern="\d*"
  value={priceUYU === 0 ? "" : priceUYU}
  onChange={(e) => setPriceUYU(Number(e.target.value) || 0)}
  className="border px-3 py-2 rounded w-full appearance-none"
/>
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">Stock por talle</label>
          <div className="flex gap-4">
            {Object.keys(stock).map((size) => (
              <div key={size} className="flex flex-col items-center text-sm">
                <label className="mb-1 font-medium">{size}</label>
                <input
  type="text"
  inputMode="numeric"
  pattern="\d*"
  value={stock[size as keyof typeof stock] === 0 ? "" : stock[size as keyof typeof stock]}
  onChange={(e) =>
    handleStockChange(size as keyof typeof stock, Number(e.target.value) || 0)
  }
  className="border px-3 py-1 rounded text-center w-20 appearance-none"
/>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">Imágenes (máx. 2MB c/u)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
          />
          {uploading && <p className="text-sm text-gray-500 mt-2">Subiendo imágenes...</p>}

          {uploadedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img.url} alt={`img-${idx}`} className="w-full rounded shadow" />
                  <button
                    onClick={() => handleImageDelete(img.publicId)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded px-2 py-1 hover:bg-red-600"
                  >
                    ❌
                  </button>
                  <div className="flex justify-center gap-2 mt-1">
                    <button
                      onClick={() => handleImageMove(idx, "up")}
                      disabled={idx === 0}
                      className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleImageMove(idx, "down")}
                      disabled={idx === uploadedImages.length - 1}
                      className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">Descripción adicional</label>
          <textarea
            rows={3}
            value={extraDescription}
            onChange={(e) => setExtraDescription(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <div className="mt-2">
            <label className="mr-4">
              <input
                type="radio"
                name="descPosition"
                value="top"
                checked={descriptionPosition === "top"}
                onChange={() => setDescriptionPosition("top")}
              /> Mostrar arriba
            </label>
            <label>
              <input
                type="radio"
                name="descPosition"
                value="bottom"
                checked={descriptionPosition === "bottom"}
                onChange={() => setDescriptionPosition("bottom")}
              /> Mostrar abajo
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
      >
        Guardar publicación
      </button>
    </div>
  );
}
