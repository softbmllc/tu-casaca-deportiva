// src/components/admin/ImageUploader.tsx

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { handleImageUpload } from "../../utils/handleImageUpload";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  // Eliminado el estado local de imágenes
  const [error, setError] = useState("");
  const imageRef = useRef<string[]>(images);

  useEffect(() => {
    imageRef.current = images;
  }, [images]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    console.log("Archivos seleccionados:", files);
    if (!files || files.length === 0) return;
    setError("");

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (fileExt === 'webp') {
        alert("⚠️ Atención: Las imágenes en formato .webp pueden causar problemas de navegación. Recomendamos usar formato .jpg o .png.");
      }

      if (file.size > 5000000) {
        setError("Una o más imágenes superan los 5MB");
        return null;
      }

      console.log("🔍 Archivo a subir:", file); // nuevo log

      let url: string | null = null;
      try {
        const result = await handleImageUpload(file);
        url = typeof result === "string" ? result : null;
      } catch (err) {
        console.error("❌ Error inesperado al subir imagen:", err);
        setError("Error inesperado al subir la imagen.");
        return null;
      }

      if (!url) {
        console.warn("⛔ No se recibió una URL válida desde ImageKit:", url);
        return null;
      }
      return url;
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((url: string | null): url is string => !!url);

    // Normaliza URLs (trim) y elimina duplicados usando referencia interna
    const combined = [...imageRef.current, ...successfulUploads.map(url => url.trim())];
    const updatedImages = Array.from(new Set(combined));
    imageRef.current = updatedImages;
    console.log("Imágenes subidas:", updatedImages);
    onChange(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    imageRef.current = updatedImages;
    onChange(updatedImages);
  };

  return (
    <div>
      <div className="mb-3">
        <div
          onClick={triggerFileInput}
          className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
        >
          <span className="block text-gray-500 mb-2">
            Hacé clic para subir imágenes
          </span>
          <span className="block text-sm text-gray-400">
            PNG, JPG o WEBP, máx. 5MB
          </span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={`${image}-preview-${index}`}
                className="relative border rounded-lg overflow-hidden"
              >
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}