// src/components/admin/EditProductModal.tsx

import React, { useState } from 'react';
import { ReactSortable } from "react-sortablejs";
import { useEffect } from "react";
import ImageUploader from "./ImageUploader";
import TiptapEditor from "./TiptapEditor";
import { Product } from "../../data/types";
import { updateProduct, fetchCategories, fetchSubcategories } from "../../firebaseUtils";
import { generateSlug } from "../../utils/generateSlug";
import { uploadImageToImageKit } from "../../utils/imagekitUtils";
import { TIPOS } from "@/constants/tipos";

import { normalizeProduct } from "../../utils/normalizeProduct";

// Drag and Drop
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type ImageItem = {
  id: string;
  url: string;
};

// Tipo para ligas almacenadas en localStorage
type League = {
  id: number;
  name: string;
};

// Tipo para equipos almacenados en localStorage
type Team = {
  id: number;
  name: string;
  league: string;
};

interface Props {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onClose: () => void;
  subcategories: {
    id: string;
    name: string | { es?: string; en?: string };
    categoryId: string;
  }[];
  open: boolean; // <-- aseguramos que open esté como prop
}


// Componente para imagen arrastrable con flechas
function SortableImageItem({
  id,
  url,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: {
  id: string;
  url: string;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Separar claramente el área arrastrable (solo la imagen) de los botones
  return (
    <div className="relative group">
      <div
        ref={setNodeRef}
        style={style}
        className="cursor-move"
        {...attributes}
        {...listeners}
      >
        <img
          src={url}
          alt="Vista previa"
          className="w-full h-40 object-cover rounded border"
        />
      </div>

      {/* Botón Eliminar */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
      >
        ×
      </button>

      {/* Flechas Izquierda y Derecha */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-100 transition">
        <button
          type="button"
          onClick={onMoveLeft}
          className="bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onMoveRight}
          className="bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function EditProductModal({ product, onSave, onClose, subcategories, open }: Props) {
  // Reinicializa formData cada vez que el modal se abre y cambia el producto
  useEffect(() => {
    if (open && product) {
      console.log("🧪 product recibido al abrir modal: ", product);
      setFormData({
        ...product,
        tipo: product.tipo ?? "",
      });
    }
  }, [open, product]);
  const [formData, setFormData] = useState<Product | null>(null);

useEffect(() => {
  if (product) {
    setFormData({
      ...product,
      tipo: product.tipo ?? "",
    });
  }
}, [product]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  const [categories, setCategories] = useState<{ id: string; name: string | { es?: string; en?: string }; categoryId: string }[]>([]);


  // Cargar categorías desde Firebase al montar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(
          fetchedCategories.map((cat) => ({
            ...cat,
            categoryId: cat.id,
          }))
        );
      } catch (error) {
        console.error("❌ Error al cargar categorías:", error);
      }
    };
    loadCategories();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // Estado para la subcategoría seleccionada
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  // Debug visual para categorías
  console.log("📦 Categorías cargadas:", categories);
  
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  // Descripciones en inglés y español (inputs controlados)
  const [descriptionEN, setDescriptionEN] = useState(product.description?.en || "");
  const [descriptionES, setDescriptionES] = useState(product.description?.es || "");
  const [variants, setVariants] = useState(
    product.variants || [{ label: { es: "", en: "" }, options: [{ value: "", priceUSD: 0 }] }]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

useEffect(() => {
  if (!product || subcategories.length === 0 || categories.length === 0) return;

  const initialCategory = categories.find((cat) => cat.id === product.category?.id);
  const initialSubcategory = subcategories.find((s) => s.id === product.subcategory?.id);

  setSelectedCategory(initialCategory?.id || product.category?.id || "");
  setSelectedSubcategory(initialSubcategory?.id || product.subcategory?.id || "");

  // Log del producto recibido al abrir modal
  console.log("🧪 product recibido al abrir modal:", product);

  // Nuevo bloque para tipo
  const tipoFinal = product.tipo ?? "";
  console.log("✅ Tipo recibido desde Firebase:", tipoFinal);
  setFormData((prev) => {
    if (prev?.id === product.id) return prev;
    return {
      ...product,
      tipo: tipoFinal,
      category: {
        id: initialCategory?.id || product.category?.id || "",
        name:
          typeof initialCategory?.name === "string"
            ? initialCategory.name
            : typeof initialCategory?.name === "object"
            ? initialCategory.name?.es || initialCategory.name?.en || ""
            : "",
      },
      subcategory: {
        id: initialSubcategory?.id || product.subcategory?.id || "",
        name:
          typeof initialSubcategory?.name === "string"
            ? initialSubcategory.name
            : typeof initialSubcategory?.name === "object"
            ? initialSubcategory.name?.es || initialSubcategory.name?.en || ""
            : "",
        categoryId: initialSubcategory?.categoryId || product.subcategory?.categoryId || "",
      }
    };
  });
}, [product, categories, subcategories]);




const handleChange = (field: keyof Product, value: any) => {
  setFormData((prev) => prev ? { ...prev, [field]: value } : prev);
};


const [images, setImages] = useState<ImageItem[]>(
  product.images?.filter((img): img is string => typeof img === "string").map((url, index) => ({
    id: `${index}-${url}`,
    url,
  })) || []
);

// Permite eliminar una imagen por índice
const handleRemoveImage = (index: number) => {
  const updated = [...images];
  updated.splice(index, 1);
  setImages(updated);
};

const handleImageUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const url = await handleImageUpload(file);
  if (url) {
    setImages((prev) => [...prev, { id: `${Date.now()}`, url }]);
  } else {
    console.error("Error: no se pudo obtener la URL de la imagen subida.");
  }
};

// Mantener sincronizadas las imágenes con formData
useEffect(() => {
  setFormData((prev) => prev ? { ...prev, images: images.map((img) => img.url) } : prev);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [images]);

const handleUpload = async (file: File): Promise<string | null> => {
  console.log("📤 Subiendo archivo:", file);

  try {
    const url = await uploadImageToImageKit(file);
    console.log("✅ URL devuelta por ImageKit:", url);
    return url;
  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    return null;
  }
};

  const handleSaveProduct = async () => {
    setError("");
    setSaving(true);
    try {
      if (!formData) {
        setError("Error interno: datos del producto no están listos.");
        setSaving(false);
        return;
      }
      if (!formData.title?.en.trim()) {
        setError("El nombre del producto es obligatorio.");
        setSaving(false);
        return;
      }
      // Validación de categoría y subcategoría usando los valores seleccionados
      if (!selectedCategory || !selectedSubcategory) {
        setError("Debe seleccionar categoría y subcategoría.");
        setSaving(false);
        return;
      }
      if (!formData.images || formData.images.length === 0) {
        setError("Debe subir al menos una imagen del producto.");
        setSaving(false);
        return;
      }
      const productId = String(formData.id);
      const { id, ...productData } = formData;

      // Sincroniza variants en formData antes de guardar
      formData.variants = variants;

      const selectedCategoryObj = categories.find((cat) => cat.id === selectedCategory);
      const selectedSubcategoryObj =
        subcategories.find((sub) => sub.id === selectedSubcategory) || { id: "", name: "" };

      const calculatedStockTotal = variants.reduce((total, variant) => {
        return total + variant.options.reduce((sum, opt: any) => sum + (opt.stock || 0), 0);
      }, 0);

      // Obtener el objeto completo de la subcategoría seleccionada
      const selectedSubcategoryObject = subcategories.find(
        (s) => s.id === selectedSubcategory
      );

      // Generar slug único por subcategoría
      const subcategoryName = typeof selectedSubcategoryObject?.name === "string"
        ? selectedSubcategoryObject.name
        : selectedSubcategoryObject?.name?.es || selectedSubcategoryObject?.name?.en || "";

      const cleanSubcat = subcategoryName.toLowerCase().replace(/\s+/g, "-");
      const baseSlug = generateSlug(productData.title?.en || "");
      const finalSlug = `${baseSlug}-${cleanSubcat}`;

      // Solo incluir subcategory (minúscula) en updatedProduct, nunca subCategory
      const updatedProduct: Product = {
        ...product,
        ...productData,
        images: images.map((img) => img.url),
        id: productId,
        stockTotal: calculatedStockTotal,
        title: {
          en: productData.title?.en?.trim() || "",
          es: productData.title?.es?.trim() || "",
        },
        slug: finalSlug,
        priceUSD: productData.priceUSD || 0,
        stock: {},
        category: {
          id: selectedCategoryObj?.id ?? selectedCategory ?? "",
          name:
            typeof selectedCategoryObj?.name === "string"
              ? selectedCategoryObj.name
              : typeof selectedCategoryObj?.name === "object"
              ? selectedCategoryObj?.name.es || selectedCategoryObj?.name.en || ""
              : "",
        },
        subcategory: {
          id: selectedSubcategoryObject?.id ?? "",
          name:
            typeof selectedSubcategoryObject?.name === "string"
              ? selectedSubcategoryObject?.name
              : typeof selectedSubcategoryObject?.name === "object"
              ? selectedSubcategoryObject?.name.es || selectedSubcategoryObject?.name.en || ""
              : "",
          categoryId: selectedSubcategoryObject?.categoryId ?? "",
        },
        tipo: productData.tipo?.trim() || "",
        defaultDescriptionType: productData.defaultDescriptionType || "none",
        extraDescriptionTop: productData.extraDescriptionTop || "",
        extraDescriptionBottom: productData.extraDescriptionBottom || "",
        description: {
          en: descriptionEN.trim(),
          es: descriptionES.trim(),
        },
        allowCustomization: productData.allowCustomization || false,
        descriptionPosition: productData.descriptionPosition || "bottom",
        active: productData.active !== undefined ? productData.active : true,
      };

      await updateProduct(productId, {
        ...updatedProduct,
        variants: variants,
      });
      
      onSave({
        ...updatedProduct,
        variants: variants,
      });
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setError("Error al guardar el producto. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setImages((prevImages) => {
      const activeIndex = prevImages.findIndex((img) => img.id === active.id);
      const overIndex = prevImages.findIndex((img) => img.id === over.id);
      return arrayMove(prevImages, activeIndex, overIndex);
    });
  }
};

const moveImageLeft = (index: number) => {
  if (formData && index > 0 && formData.images) {
    setFormData((prev) => {
      if (!prev) return prev;
      const newImages = [...(prev.images || [])];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return { ...prev, images: newImages };
    });
  }
};

const moveImageRight = (index: number) => {
  if (formData && formData.images && index < formData.images.length - 1) {
    setFormData((prev) => {
      if (!prev) return prev;
      const newImages = [...(prev.images || [])];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return { ...prev, images: newImages };
    });
  }
};

const removeImage = (index: number) => {
  setFormData((prev) => {
    if (!prev) return prev;
    const newImages = [...(prev.images || [])];
    newImages.splice(index, 1);
    return { ...prev, images: newImages };
  });
};

// Loader visual si formData aún no está listo
if (!formData) {
  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-75 flex items-center justify-center">
      <span className="text-gray-600">Cargando datos del producto...</span>
    </div>
  );
}

// Log justo antes del return para ver el valor de formData.tipo al renderizar
console.log("🧠 formData.tipo al renderizar:", JSON.stringify(formData?.tipo));

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
            </svg>
            Editar Producto
          </h3>

          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          <div className="space-y-6 divide-y divide-gray-200 max-h-[70vh] overflow-y-auto px-2 py-4">
            {/* Datos básicos */}
            <div className="bg-gray-50 p-4 rounded-md shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Título del producto</label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded"
                      value={formData.title?.es || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                        setSelectedTeam("");
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L10 5.414 6.707 8.707a1 1 0 01-1.414-1.414l4-4A1 1 0 0110 3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium tracking-wide text-gray-800 mb-1">Subcategoría</label>
                  {selectedSubcategory === "" && (
                    <div className="mb-2 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 p-2 rounded">
                      Este producto no tiene subcategoría asignada. Seleccioná una antes de guardar.
                    </div>
                  )}
                  <div className="relative">
                    <select
                      name="subcategory"
                      value={selectedSubcategory || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setSelectedSubcategory(selectedId);
                        const selected = subcategories.find((s) => s.id === selectedId);
                        if (selected) {
                          setFormData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  subcategory: {
                                    id: selected.id,
                                    name:
                                      typeof selected.name === "string"
                                        ? selected.name
                                        : selected.name?.es || selected.name?.en || "",
                                    categoryId: selected.categoryId,
                                  },
                                }
                              : prev
                          );
                        }
                      }}
                      className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                      required
                    >
                      <option value="">Seleccionar subcategoría</option>
                      {selectedSubcategory && (
                        <option value={selectedSubcategory}>
                          {
                            (() => {
                              const selected = subcategories.find(s => s.id === selectedSubcategory);
                              if (!selected) return "Subcategoría";
                              const name = selected.name;
                              return typeof name === "string" ? name : name?.es || name?.en || "Subcategoría";
                            })()
                          }
                        </option>
                      )}
                      {subcategories
                        .filter((sub) =>
                          sub.categoryId === selectedCategory &&
                          sub.id !== selectedSubcategory // evitar duplicar la que ya mostramos arriba
                        )
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {typeof sub.name === "string" ? sub.name : sub.name?.es || sub.name?.en}
                          </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L10 5.414 6.707 8.707a1 1 0 01-1.414-1.414l4-4A1 1 0 0110 3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
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
                {/* Precio USD eliminado */}
                {/* Precio UYU eliminado */}
              </div>
            </div>

            {/* Descripción */}
            <div className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium tracking-wide text-gray-800 mb-1">Descripción (EN)</label>
                  <TiptapEditor content={descriptionEN} onChange={setDescriptionEN} withDefaultStyles={true} />
                </div>
                <div>
                  <label className="block text-sm font-medium tracking-wide text-gray-800 mb-1">Descripción (ES)</label>
                  <TiptapEditor content={descriptionES} onChange={setDescriptionES} withDefaultStyles={true} />
                </div>
              </div>
            </div>

            {/* Variantes */}
            <div className="bg-gray-50 p-4 rounded-md shadow-inner mt-6">
              <label className="block font-semibold tracking-wide text-gray-800 mb-2">Variantes del producto</label>
              {variants.map((variant, vIndex) => (
                <div key={vIndex} className="mb-4 border p-3 rounded-md bg-white">
                  <div className="flex gap-4 mb-2">
                    <input
                      type="text"
                      className="w-1/2 border-gray-300 focus:ring-black focus:border-black border p-2"
                      placeholder="Nombre en español (Ej: Tamaño)"
                      value={variant.label.es}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[vIndex].label.es = e.target.value;
                        setVariants(updated);
                      }}
                    />
                    <input
                      type="text"
                      className="w-1/2 border-gray-300 focus:ring-black focus:border-black border p-2"
                      placeholder="Nombre en inglés (Ej: Size)"
                      value={variant.label.en}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[vIndex].label.en = e.target.value;
                        setVariants(updated);
                      }}
                    />
                  </div>
                  {variant.options.map((option, oIndex) => (
                    <div key={oIndex} className="grid grid-cols-3 gap-2 mb-1 items-end">
                      <div>
                        <label className="block text-xs font-semibold tracking-wide text-gray-800 mb-1">Valor</label>
                        <input
                          type="text"
                          className="border-gray-300 focus:ring-black focus:border-black border p-2 w-full"
                          placeholder="Ej: 60 cápsulas"
                          value={option.value}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[vIndex].options[oIndex].value = e.target.value;
                            setVariants(updated);
                          }}
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
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[vIndex].options[oIndex].priceUSD = parseFloat(e.target.value);
                            setVariants(updated);
                          }}
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
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[vIndex].options[oIndex].stock = parseInt(e.target.value);
                              setVariants(updated);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...variants];
                            updated[vIndex].options = updated[vIndex].options.filter((_, i) => i !== oIndex);
                            setVariants(updated);
                          }}
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
                    onClick={() => {
                      const updated = [...variants];
                      updated[vIndex].options.push({ value: "", priceUSD: 0 });
                      setVariants(updated);
                    }}
                  >
                    + Agregar opción
                  </button>
                  {/* Eliminar variante */}
                  <button
                    type="button"
                    onClick={() => {
                      const newVariants = variants.filter((_, i) => i !== vIndex);
                      setVariants(newVariants);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded mt-2 ml-2"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-blue-600 mt-2"
                onClick={() => {
                  setVariants([...variants, { label: { es: "", en: "" }, options: [{ value: "", priceUSD: 0 }] }]);
                }}
              >
                + Agregar variante
              </button>
            </div>

            {/* Imágenes */}
            <div className="bg-gray-50 p-4 rounded-md shadow-inner mt-6">
              <label className="block text-sm font-semibold tracking-wide text-gray-800 mb-2">Imágenes</label>
              <ReactSortable<ImageItem> list={images} setList={(newList) => setImages(newList)} animation={150} className="flex flex-wrap gap-2">
                {images.map((item, index) => (
                  <div key={item.id} className="relative w-24 h-24 border rounded overflow-hidden">
                    <img src={item.url} alt={`imagen-${index}`} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-bl px-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </ReactSortable>

              <div className="mt-4">
                <label className="block text-sm font-medium tracking-wide text-gray-800 mb-1">Agregar nueva imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file).then((url) => {
                        if (url) setImages((prev) => [...prev, { id: `${Date.now()}`, url }]);
                      });
                    }
                  }}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer de botones */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleSaveProduct}
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
import { handleImageUpload } from "../../utils/handleImageUpload";