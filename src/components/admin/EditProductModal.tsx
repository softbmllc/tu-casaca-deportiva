// src/components/admin/EditProductModal.tsx

// Versión funcional anterior de EditProductModal (restaurada)
import React, { useState, useEffect } from "react";
import { Product } from "../../data/types";
import { updateProduct, fetchCategories } from "../../firebaseUtils";
import { generateSlug } from "../../utils/generateSlug";
import { uploadImageToImageKit } from "../../utils/imagekitUtils";
import TiptapEditor from "./TiptapEditor";
import { TIPOS } from "../../constants/tipos";

interface Props {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onClose: () => void;
  subcategories: {
    id: string;
    name: string | { es?: string; en?: string };
    categoryId: string;
  }[];
  open: boolean;
}

export default function EditProductModal({
  product,
  onSave,
  onClose,
  subcategories,
  open,
}: Props) {
  const [categories, setCategories] = useState<
    { id: string; name: string | { es?: string; en?: string } }[]
  >([]);
  const [form, setForm] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Cargar categorías
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Inicializar form al abrir
  useEffect(() => {
    if (product) {
      console.log("🧪 Producto recibido en modal:", product);
      setForm({
        ...product,
        tipo: product.tipo || "",
        category: product.category || { id: "", name: "" },
        subcategory: product.subcategory || { id: "", name: "" },
        description: product.description || "",
        extraDescriptionTop: product.extraDescriptionTop || "",
        extraDescriptionBottom: product.extraDescriptionBottom || "",
      });
      console.log("🧪 formData seteado al abrir modal:", {
        ...product,
        tipo: product.tipo || "",
      });
      setImages(product.images || []);
      setVariants(product.variants || []);
      setSelectedCategory(product.category?.id || "");
      setSelectedSubcategory(product.subcategory?.id || "");
      setDescription(product.description || "");
    }
  }, [product, open]);

  // Sincronizar imágenes y variantes con form
  useEffect(() => {
    setForm((prev) => (prev ? { ...prev, images, variants } : prev));
    // eslint-disable-next-line
  }, [images, variants]);

  // Sincronizar descripción
  useEffect(() => {
    setForm((prev) => (prev ? { ...prev, description } : prev));
  }, [description]);

  // Handlers de inputs
  const handleChange = (key: keyof Product, value: any) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleVariantChange = (vIdx: number, key: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIdx ? { ...v, [key]: value } : v
      )
    );
  };

  const handleOptionChange = (vIdx: number, oIdx: number, key: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIdx
          ? {
              ...v,
              options: v.options.map((o: any, j: number) =>
                j === oIdx ? { ...o, [key]: value } : o
              ),
            }
          : v
      )
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { label: { es: "", en: "" }, options: [{ value: "", priceUSD: 0, stock: 0 }] },
    ]);
  };
  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };
  const addOption = (vIdx: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIdx
          ? {
              ...v,
              options: [...v.options, { value: "", priceUSD: 0, stock: 0 }],
            }
          : v
      )
    );
  };
  const removeOption = (vIdx: number, oIdx: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIdx
          ? { ...v, options: v.options.filter((_: any, j: number) => j !== oIdx) }
          : v
      )
    );
  };

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadImageToImageKit(file);
      if (url) {
        setImages((prev) => [...prev, url]);
      }
    } catch (e) {
      alert("Error subiendo imagen");
    }
  };
  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Guardar producto
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!form) throw new Error("Faltan datos");
      if (!form.title?.en?.trim()) throw new Error("El nombre es obligatorio");
      if (!selectedCategory || !selectedSubcategory)
        throw new Error("Debe seleccionar categoría y subcategoría");
      if (!images.length) throw new Error("Debe subir al menos una imagen");
      // Calcular stockTotal y priceUSD
      const stockTotal = variants.reduce(
        (total, v) =>
          total +
          (v.options
            ? v.options.reduce((s: number, o: any) => s + (o.stock || 0), 0)
            : 0),
        0
      );
      const priceUSD = Math.min(
        ...variants.flatMap((v) => v.options.map((o: any) => o.priceUSD))
      );
      // Slug
      const subcatObj = subcategories.find((s) => s.id === selectedSubcategory);
      const subcatName =
        typeof subcatObj?.name === "string"
          ? subcatObj?.name
          : subcatObj?.name?.es || subcatObj?.name?.en || "";
      const slug = `${generateSlug(form.title?.en || "")}-${(subcatName || "")
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
      // Eliminar size del objeto actualizado si existe
      const { size, ...formWithoutSize } = form as any;
      const updated: Product = {
        ...formWithoutSize,
        id: form.id,
        images,
        variants,
        stockTotal,
        priceUSD,
        slug,
        category: {
          id: selectedCategory,
          name:
            typeof categories.find((c) => c.id === selectedCategory)?.name ===
            "string"
              ? (categories.find((c) => c.id === selectedCategory)?.name as string)
              : (categories.find((c) => c.id === selectedCategory)?.name as any)?.es ||
                (categories.find((c) => c.id === selectedCategory)?.name as any)?.en ||
                "",
        },
        subcategory: {
          id: selectedSubcategory,
          name: subcatName,
          categoryId: subcatObj?.categoryId || "",
        },
        description: description,
      };
      await updateProduct(form.id, updated);
      onSave(updated);
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <div className="fixed inset-0 z-50 bg-white bg-opacity-75 flex items-center justify-center">
        <span className="text-gray-600">Cargando datos del producto...</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2" id="modal-title">
              Editar Producto
            </h3>
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
            )}
            <div className="space-y-6 divide-y divide-gray-200 max-h-[70vh] overflow-y-auto px-2 py-4">
              <div className="bg-gray-50 p-4 rounded-md shadow-inner">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Título del producto</label>
                      <input
                        type="text"
                        className="w-full border px-3 py-2 rounded"
                        value={form.title?.es || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            title: {
                              es: e.target.value,
                              en: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium tracking-wide text-gray-800 mb-1">Categoría</label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                        }}
                        className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                        required
                      >
                        <option value="">Seleccionar Categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {typeof cat.name === "string" ? cat.name : cat.name?.es || cat.name?.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium tracking-wide text-gray-800 mb-1">Subcategoría</label>
                    <div className="relative">
                      <select
                        name="subcategory"
                        value={selectedSubcategory}
                        onChange={(e) => {
                          setSelectedSubcategory(e.target.value);
                        }}
                        className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                        required
                      >
                        <option value="">Seleccionar subcategoría</option>
                        {subcategories
                          .filter((sub) => sub.categoryId === selectedCategory)
                          .map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {typeof sub.name === "string" ? sub.name : sub.name?.es || sub.name?.en}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Tipo de producto
                      </label>
                      <select
                        name="tipo"
                        value={form.tipo || ""}
                        onChange={(e) =>
                          setForm((prev) => prev ? { ...prev, tipo: e.target.value } : prev)
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">Seleccionar tipo</option>
                        {TIPOS.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <label className="block text-sm font-medium tracking-wide text-gray-800 mb-1">Descripción</label>
                <TiptapEditor content={description} onChange={setDescription} withDefaultStyles={true} />
              </div>
              <div className="bg-gray-50 p-4 rounded-md shadow-inner mt-6">
                <label className="block font-semibold tracking-wide text-gray-800 mb-2">Variantes del producto</label>
                {variants.map((variant, vIdx) => (
                  <div key={vIdx} className="mb-4 border p-3 rounded-md bg-white">
                    <div className="flex gap-4 mb-2">
                      <input
                        type="text"
                        className="w-1/2 border-gray-300 focus:ring-black focus:border-black border p-2"
                        placeholder="Nombre en español"
                        value={variant.label.es}
                        onChange={(e) =>
                          handleVariantChange(vIdx, "label", {
                            ...variant.label,
                            es: e.target.value,
                            en: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        className="w-1/2 border-gray-300 focus:ring-black focus:border-black border p-2"
                        placeholder="Nombre en inglés"
                        value={variant.label.en}
                        onChange={(e) =>
                          handleVariantChange(vIdx, "label", {
                            ...variant.label,
                            es: e.target.value,
                            en: e.target.value,
                          })
                        }
                      />
                    </div>
                    {variant.options.map((option: any, oIdx: number) => (
                      <div key={oIdx} className="grid grid-cols-3 gap-2 mb-1 items-end">
                        <div>
                          <label className="block text-xs font-semibold tracking-wide text-gray-800 mb-1">Valor</label>
                          <input
                            type="text"
                            className="border-gray-300 focus:ring-black focus:border-black border p-2 w-full"
                            placeholder="Ej: 60 cápsulas"
                            value={option.value}
                            onChange={(e) =>
                              handleOptionChange(vIdx, oIdx, "value", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-wide text-gray-800 mb-1">Precio</label>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            className="border-gray-300 focus:ring-black focus:border-black border p-2 w-full"
                            placeholder="Ej: 19.99"
                            value={option.priceUSD}
                            onChange={(e) =>
                              handleOptionChange(vIdx, oIdx, "priceUSD", parseFloat(e.target.value))
                            }
                          />
                        </div>
                        <div className="flex gap-1 items-end">
                          <div className="w-full">
                            <label className="block text-xs font-semibold tracking-wide text-gray-800 mb-1">Stock</label>
                            <input
                              type="number"
                              min={0}
                              className="border-gray-300 focus:ring-black focus:border-black border p-2 w-full"
                              placeholder="Ej: 10"
                              value={option.stock || 0}
                              onChange={(e) =>
                                handleOptionChange(vIdx, oIdx, "stock", parseInt(e.target.value))
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(vIdx, oIdx)}
                            className="ml-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-blue-600 text-sm mt-2"
                      onClick={() => addOption(vIdx)}
                    >
                      + Agregar opción
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(vIdx)}
                      className="bg-red-500 text-white px-2 py-1 rounded mt-2 ml-2"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-blue-600 mt-2"
                  onClick={addVariant}
                >
                  + Agregar variante
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-md shadow-inner mt-6">
                <label className="block text-sm font-semibold tracking-wide text-gray-800 mb-2">Imágenes</label>
                <div className="flex flex-wrap gap-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                      <img src={url} alt={`imagen-${idx}`} className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-bl px-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium tracking-wide text-gray-800 mb-1">Agregar nueva imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-white hover:bg-gray-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}