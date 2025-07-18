// src/components/admin/EditProductModal.tsx

import { useState, useEffect } from "react";
import { defaultDescriptions } from "../../data/defaultDescriptions";
import { uploadImageToImageKit } from "../../utils/imagekitUtils";
import { Product } from "../../data/types";
import { updateProduct, fetchLeagues, fetchSubcategories } from "../../firebaseUtils";
import { generateSlug } from "../../utils/generateSlug";

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
}


const sizes = ["S", "M", "L", "XL", "XXL"];

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

// Ejemplo de integración de useForm (no estaba en el original, pero aquí va el bloque pedido)
import { useForm } from "react-hook-form";

export default function EditProductModal({ product, onSave, onClose }: Props) {
  // useForm para manejo de formulario (si se usa en algún lado)
  const { register, handleSubmit, reset, formState } = useForm<Product>({
    defaultValues: {
      title: product.title,
      slug: product.slug,
      name: product.name,
      priceUSD: product.priceUSD,
      priceUYU: product.priceUYU,
      discountPriceUSD: product.discountPriceUSD ?? undefined,
      discountPriceUYU: product.discountPriceUYU ?? undefined,
      description: product.description || "",
      extraDescriptionTop: product.extraDescriptionTop || "",
      extraDescriptionBottom: product.extraDescriptionBottom || "",
      defaultDescriptionType: product.defaultDescriptionType || "camiseta",
      descriptionPosition: product.descriptionPosition || "bottom",
      allowCustomization: product.allowCustomization ?? true,
    }
  });

useEffect(() => {
  if (!product || !product.id) return;

  // Limpiar los campos vacíos o no numéricos a undefined antes de reset
  if (typeof product.discountPriceUSD !== "number") product.discountPriceUSD = undefined;
  if (typeof product.discountPriceUYU !== "number") product.discountPriceUYU = undefined;

  reset({
    title: product.title || "",
    slug: product.slug || "",
    name: product.name || "",
    description: product.description || "",
    priceUSD: product.priceUSD || 0,
    priceUYU: product.priceUYU || 0,
    discountPriceUSD: isNaN(Number(product.discountPriceUSD)) ? undefined : product.discountPriceUSD,
    discountPriceUYU: isNaN(Number(product.discountPriceUYU)) ? undefined : product.discountPriceUYU,
    extraDescriptionTop: product.extraDescriptionTop || "",
    extraDescriptionBottom: product.extraDescriptionBottom || "",
    defaultDescriptionType: product.defaultDescriptionType || "camiseta",
    descriptionPosition: product.descriptionPosition || "bottom",
    allowCustomization: product.allowCustomization ?? true,
  });

  // 🧪 Debug en producción: mostrar los valores que se cargan en el reset
  console.log("🧪 reset data:", {
    title: product.title || "",
    slug: product.slug || "",
    name: product.name || "",
    description: product.description || "",
    priceUSD: product.priceUSD || 0,
    priceUYU: product.priceUYU || 0,
    discountPriceUSD: isNaN(Number(product.discountPriceUSD)) ? undefined : product.discountPriceUSD,
    discountPriceUYU: isNaN(Number(product.discountPriceUYU)) ? undefined : product.discountPriceUYU,
    extraDescriptionTop: product.extraDescriptionTop || "",
    extraDescriptionBottom: product.extraDescriptionBottom || "",
    defaultDescriptionType: product.defaultDescriptionType || "camiseta",
    descriptionPosition: product.descriptionPosition || "bottom",
    allowCustomization: product.allowCustomization ?? true,
  });

  setSelectedCategory(typeof product.category === "string" ? product.category : product.category?.id || "");
  setSelectedSubcategory(typeof product.subCategory === "string" ? product.subCategory : product.subCategory?.id || "");
  setSelectedTeam(typeof product.team === "string" ? product.team : product.team?.id || "");
}, [product, reset]);
const [formData, setFormData] = useState<Product>({
  ...product,
  discountPriceUSD: product.discountPriceUSD ?? undefined,
  discountPriceUYU: product.discountPriceUYU ?? undefined,
});
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [uploadingImages, setUploadingImages] = useState(false);

const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
const [subcategories, setSubcategories] = useState<{ id: string; name: string; categoryId: string }[]>([]);

const [selectedCategory, setSelectedCategory] = useState(
  typeof product.category === "string" ? product.category : product.category?.id || ""
);
const [selectedSubcategory, setSelectedSubcategory] = useState(
  typeof product.subCategory === "string" ? product.subCategory : product.subCategory?.id || ""
);
const [selectedTeam, setSelectedTeam] = useState<string>("");

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);

useEffect(() => {
  const loadAllData = async () => {
    try {
      const leagues = await fetchLeagues();
      const allSubcategoriesPromises = leagues.map((league) => fetchSubcategories(league.id));
      const allSubcategories = (await Promise.all(allSubcategoriesPromises)).flat();


      setCategories(leagues);
      setSubcategories(allSubcategories);
    } catch (error) {
      console.error("[EditProductModal] Error al cargar datos desde Firebase:", error);
    }
  };

  loadAllData();
}, []);


const handleChange = (field: keyof Product, value: any) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

const handleStockChange = (size: string, value: number) => {
  setFormData((prev) => ({ ...prev, stock: { ...prev.stock, [size]: value } }));
};

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;
  setUploadingImages(true);
  setError("");

  try {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Uno de los archivos no es una imagen válida.");
        setUploadingImages(false);
        return;
      }
    }
    const uploadPromises = files.map(file => uploadImageToImageKit(file));
    const urls = (await Promise.all(uploadPromises)).filter((url): url is string => !!url);
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...urls],
    }));
    e.target.value = "";
  } catch (error) {
    console.error("Error en la carga de imágenes:", error);
    setError("Error al subir una o más imágenes. Intente nuevamente.");
  } finally {
    setUploadingImages(false);
  }
};

const handleSaveProduct = async () => {
  setError("");
  setSaving(true);
  try {
    if (!formData.title?.trim()) {
      setError("El nombre del producto es obligatorio.");
      setSaving(false);
      return;
    }
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
    // Validación: el precio de oferta UYU debe ser menor al precio original UYU
    if (
      typeof formData.discountPriceUYU === "number" &&
      formData.discountPriceUYU >= formData.priceUYU
    ) {
      alert("⚠️ El precio de oferta debe ser menor al precio original (UYU).");
      setSaving(false);
      return;
    }
    // (Opcional) Validar USD también:
    if (
      typeof formData.discountPriceUSD === "number" &&
      formData.discountPriceUSD >= formData.priceUSD
    ) {
      alert("⚠️ El precio de oferta debe ser menor al precio original (USD).");
      setSaving(false);
      return;
    }
    const productId = String(formData.id);
    const { id, ...productData } = formData;

    const selectedCategoryObj = categories.find((cat) => cat.id === selectedCategory);
    const selectedSubcategoryObj = subcategories.find((sub) => sub.id === selectedSubcategory);

    const updatedProduct: Product = {
      id: productId,
      ...productData,
      title: (productData.title ?? "") as string,
      slug: (productData.slug ?? generateSlug(productData.title ?? "")) as string,
      images: productData.images || [],
      priceUSD: productData.priceUSD !== undefined ? Number(productData.priceUSD) : 0,
      priceUYU: productData.priceUYU !== undefined ? Number(productData.priceUYU) : 0,
      stock: {
        S: productData.stock?.S || 0,
        M: productData.stock?.M || 0,
        L: productData.stock?.L || 0,
        XL: productData.stock?.XL || 0,
        XXL: productData.stock?.XXL || 0,
      },
      category: {
        id: selectedCategoryObj?.id ?? "",
        name: selectedCategoryObj?.name ?? "",
      },
      subCategory: {
        id: selectedSubcategoryObj?.id ?? "",
        name: selectedSubcategoryObj?.name ?? "",
      },
      defaultDescriptionType: productData.defaultDescriptionType || "none",
      extraDescriptionTop: productData.extraDescriptionTop || "",
      extraDescriptionBottom: productData.extraDescriptionBottom || "",
      allowCustomization: productData.allowCustomization || false,
      descriptionPosition: productData.descriptionPosition || "bottom",
      active: productData.active !== undefined ? productData.active : true,
      // discountPriceUSD and discountPriceUYU will be cleaned below
      discountPriceUSD: productData.discountPriceUSD,
      discountPriceUYU: productData.discountPriceUYU,
    };

    // --- LIMPIEZA DE PRECIOS DE OFERTA: eliminar si no son números válidos ---
    if (
      typeof updatedProduct.discountPriceUSD !== "number" ||
      isNaN(updatedProduct.discountPriceUSD)
    ) {
      delete updatedProduct.discountPriceUSD;
    }
    if (
      typeof updatedProduct.discountPriceUYU !== "number" ||
      isNaN(updatedProduct.discountPriceUYU)
    ) {
      delete updatedProduct.discountPriceUYU;
    }

    // 🧪 Debug: Mostrar el producto a guardar antes de actualizar
    console.log("🧪 Producto a guardar:", updatedProduct);
    // 🧪 Debug extra: Confirmar el estado exacto del producto actualizado
    console.log("🧪 Producto actualizado:", updatedProduct);

    await updateProduct(productId, updatedProduct);
    onSave(updatedProduct);
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
    setFormData((prevState) => {
      const oldImages = prevState.images || [];
      const activeIndex = oldImages.findIndex((url) => url === active.id);
      const overIndex = oldImages.findIndex((url) => url === over.id);
      return { ...prevState, images: arrayMove(oldImages, activeIndex, overIndex) };
    });
  }
};

const moveImageLeft = (index: number) => {
  if (index > 0 && formData.images) {
    setFormData((prev) => {
      const newImages = [...(prev.images || [])];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return { ...prev, images: newImages };
    });
  }
};

const moveImageRight = (index: number) => {
  if (formData.images && index < formData.images.length - 1) {
    setFormData((prev) => {
      const newImages = [...(prev.images || [])];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return { ...prev, images: newImages };
    });
  }
};

const removeImage = (index: number) => {
  setFormData((prev) => {
    const newImages = [...(prev.images || [])];
    newImages.splice(index, 1);
    return { ...prev, images: newImages };
  });
};

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
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">Editar Producto</h3>

          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            {/* Datos básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título Interno</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory("");
                    setSelectedTeam("");
                  }}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                >
                  <option value="">Seleccionar Categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => {
                    setSelectedSubcategory(e.target.value);
                    setSelectedTeam("");
                  }}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                >
                  <option value="">Seleccionar Subcategoría</option>
                  {subcategories
                    .filter((sub) => sub.categoryId === selectedCategory)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio USD</label>
                <input
                  type="number"
                  value={formData.priceUSD || 0}
                  onChange={(e) => handleChange("priceUSD", parseFloat(e.target.value))}
                  className="remove-arrows shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio UYU</label>
                <input
                  type="number"
                  value={formData.priceUYU || 0}
                  onChange={(e) => handleChange("priceUYU", parseFloat(e.target.value))}
                  className="remove-arrows shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                  min="0"
                  step="1"
                  required
                />
              </div>
              {/* Bloque de precios oferta */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio oferta USD (opcional)</label>
                <input
                  type="number"
                  value={
                    typeof formData.discountPriceUSD === "number" && !isNaN(formData.discountPriceUSD)
                      ? formData.discountPriceUSD
                      : ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "discountPriceUSD",
                      e.target.value === "" ? undefined : parseFloat(e.target.value)
                    )
                  }
                  className="remove-arrows shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio oferta UYU (opcional)</label>
                <input
                  type="number"
                  value={
                    typeof formData.discountPriceUYU === "number" && !isNaN(formData.discountPriceUYU)
                      ? formData.discountPriceUYU
                      : ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "discountPriceUYU",
                      e.target.value === "" ? undefined : parseFloat(e.target.value)
                    )
                  }
                  className="remove-arrows shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                  min="0"
                  step="1"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Stock por Talle</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <div key={size} className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{size}</label>
                    <input
                      type="number"
                      value={formData.stock?.[size] || 0}
                      onChange={(e) => handleStockChange(size, parseInt(e.target.value))}
                      className="remove-arrows shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md appearance-none"
                      min="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Descripción automática */}
            {(() => {
              // Validación de defaultDescriptionType (versión más segura)
              const validDescriptions = ["none", "camiseta", "campera", "nba"];
              const defaultType = formData.defaultDescriptionType || "none";
              const currentValue = validDescriptions.includes(defaultType.toLowerCase())
                ? defaultType.toLowerCase()
                : "none";
              return (
                <div className="space-y-2">
                  <label htmlFor="defaultDescriptionType" className="block font-medium text-sm text-gray-700">
                    Descripción automática
                  </label>
                  <select
                    id="defaultDescriptionType"
                    value={currentValue}
                    onChange={(e) => {
                      const type = e.target.value as "none" | "camiseta" | "campera" | "nba";
                      const desc = type !== "none" ? defaultDescriptions[type] : "";
                      setFormData((prev) => ({
                        ...prev,
                        defaultDescriptionType: type,
                        extraDescriptionBottom: desc,
                      }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="none">Sin descripción automática</option>
                    <option value="camiseta">Camiseta</option>
                    <option value="campera">Campera</option>
                    <option value="nba">NBA</option>
                  </select>
                </div>
              );
            })()}

            {/* Personalización */}
<div>
  <label className="flex items-center space-x-2 mt-4">
    <input
      type="checkbox"
      checked={formData.allowCustomization || false}
      onChange={(e) => handleChange("allowCustomization", e.target.checked)}
      className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
    />
    <span className="text-sm text-gray-700">Permitir personalización con nombre y número</span>
  </label>
</div>

            {/* Imágenes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Imágenes</h4>
              <div className="mb-4">
                <label className="inline-block px-4 py-2 bg-black text-white rounded-md shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={uploadingImages}
                  />
                  {uploadingImages ? "Subiendo..." : "Agregar Imagen"}
                </label>
              </div>
              {formData.images && formData.images.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={formData.images} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.images.map((url, index) => (
                        <SortableImageItem
                          key={url}
                          id={url}
                          url={url}
                          onRemove={() => removeImage(index)}
                          onMoveLeft={() => moveImageLeft(index)}
                          onMoveRight={() => moveImageRight(index)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No hay imágenes. Por favor suba al menos una imagen.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer de botones */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleSaveProduct}
            disabled={saving}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
);
}