// src/components/admin/CreateProductForm.tsx
import { useForm, Controller, Control, FieldValues } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageUploader from "./ImageUploader";
import { leagues } from "../../data/leagues";

// Definimos los tamaños disponibles como una constante
const SIZES = ["S", "M", "L", "XL"] as const;
// Creamos un tipo a partir de los valores de SIZES
type Size = typeof SIZES[number];

// Tipamos el objeto de stock para que utilice el tipo Size
type StockRecord = Record<Size, number>;

// Interfaz para nuestro formulario
interface FormData {
  title: string;
  league: string;
  team: string;
  subtitle: string;
  usdPrice: number;
  uyuPrice: number;
  details: string;
  extraDescription: string;
  descriptionPosition: "top" | "bottom";
  active: boolean;
  stock: StockRecord;
}

// Función para generar un slug totalmente único basado en el título + timestamp
const generateUniqueSlug = (title: string): string => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  
  // Normalizar título eliminando acentos y caracteres especiales
  const normalizedTitle = title
    .toLowerCase()
    .normalize("NFD") // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos
    .replace(/[^a-z0-9\s-]/g, "") // Eliminar caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Evitar guiones duplicados
    .replace(/^-|-$/g, ""); // Eliminar guiones al inicio y final
  
  return `${normalizedTitle}-${timestamp}-${randomId}`;
};

// Función para encontrar la liga correspondiente a un equipo
const findLeagueForTeam = (team: string): string | null => {
  for (const league of leagues) {
    if (league.teams.includes(team)) {
      return league.name;
    }
  }
  return null;
};

// Interfaz para el producto que guardamos en localStorage
interface Product {
  id: number;
  slug: string;
  name: string;
  title: string;
  subtitle: string;
  league: string;
  category: string;
  team: string;
  priceUSD: number;
  usdPrice: number;
  priceUYU: number;
  uyuPrice: number;
  details: string;
  extraDescription: string;
  descriptionPosition: "top" | "bottom";
  active: boolean;
  stock: StockRecord;
  images: string[];
  image: string;
  sizes: Size[];
}

export default function CreateProductForm() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      league: "",
      team: "",
      subtitle: "",
      usdPrice: 80,
      uyuPrice: 3200,
      details: "",
      extraDescription: "",
      descriptionPosition: "bottom",
      active: true,
      stock: {
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
      },
    },
  });

  // Observar cambios en el equipo seleccionado para actualizar la liga automáticamente
  const selectedTeam = watch("team");
  const selectedLeague = watch("league");
  
  useEffect(() => {
    if (selectedTeam && (!selectedLeague || selectedLeague === "")) {
      const league = findLeagueForTeam(selectedTeam);
      if (league) {
        console.log(`Equipo '${selectedTeam}' encontrado en liga '${league}'`);
        setValue("league", league);
      } else {
        console.log(`No se encontró liga para el equipo '${selectedTeam}'`);
      }
    }
  }, [selectedTeam, selectedLeague, setValue]);

  // Actualizar equipos cuando se selecciona una liga
  useEffect(() => {
    if (selectedLeague) {
      const leagueData = leagues.find((l) => l.name === selectedLeague);
      if (leagueData) {
        setTeams(leagueData.teams);
      } else {
        setTeams([]);
      }
    } else {
      setTeams([]);
    }
  }, [selectedLeague]);

  // Cargar datos para edición
  useEffect(() => {
    if (id) {
      try {
        const productos = JSON.parse(localStorage.getItem("productos") || "[]");
        const producto = productos.find((p: any) => p.id === Number(id) || p.id === id);

        if (producto) {
          console.log("Cargando producto para edición:", producto);

          // Mapear campos del producto a los campos del formulario
          setValue("title", producto.title || producto.name || "");
          setValue("league", producto.league || producto.category || "");
          setValue("team", producto.team || "");
          setValue("subtitle", producto.subtitle || "");
          setValue("usdPrice", producto.usdPrice || producto.priceUSD || 0);
          setValue("uyuPrice", producto.uyuPrice || producto.priceUYU || 0);
          setValue("details", producto.details || "");
          setValue(
            "extraDescription",
            producto.extraDescription || producto.descriptionTop || producto.descriptionBottom || ""
          );
          setValue("descriptionPosition", producto.descriptionPosition || "bottom");
          setValue("active", producto.active !== false);
          
          // Asegurarse de que stock tenga la estructura correcta
          const stock: StockRecord = { S: 0, M: 0, L: 0, XL: 0 };
          if (producto.stock) {
            // Asignar solo las propiedades que existen en nuestro StockRecord
            SIZES.forEach(size => {
              if (typeof producto.stock[size] === 'number') {
                stock[size] = producto.stock[size];
              }
            });
          }
          setValue("stock", stock);
          
          setImages(producto.images || []);

          // Actualizar los equipos si hay una liga seleccionada
          if (producto.league || producto.category) {
            const leagueData = leagues.find(
              (l) => l.name === (producto.league || producto.category)
            );
            if (leagueData) {
              setTeams(leagueData.teams);
            }
          }
        } else {
          console.error("Producto no encontrado para editar con ID:", id);
        }
      } catch (error) {
        console.error("Error al cargar producto:", error);
        setError("Error al cargar el producto");
      }
    }
  }, [id, setValue]);

  const onSubmit = (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      console.log("Datos del formulario a guardar:", data);
      console.log("Imágenes a guardar:", images);
      
      // Obtener productos existentes o iniciar un array vacío
      const existingProducts = JSON.parse(localStorage.getItem("productos") || "[]");

      // Generar un nuevo ID único para nuevos productos
      let productId: number;
      let productSlug: string;

      if (id) {
        // Edición: mantener el ID y slug existentes
        const existingProduct = existingProducts.find((p: any) => 
          p.id === Number(id) || p.id === id || p.id?.toString() === id
        );
        if (existingProduct) {
          productId = existingProduct.id;
          productSlug = existingProduct.slug;
          console.log(`Editando producto con ID: ${productId} y slug: ${productSlug}`);
        } else {
          // Por alguna razón no se encontró el producto, crear uno nuevo
          productId = Date.now();
          productSlug = generateUniqueSlug(data.title);
          console.error(`No se encontró el producto a editar con ID ${id}, creando uno nuevo.`);
        }
      } else {
        // Creación: generar ID y slug nuevos
        productId = Date.now();
        productSlug = generateUniqueSlug(data.title);
        console.log(`Creando producto nuevo con ID: ${productId} y slug: ${productSlug}`);
      }

      // Construir objeto de producto con todos los campos normalizados
      const product: Product = {
        id: productId,
        slug: productSlug,
        name: data.title, // Para compatibilidad con componentes que usan name
        title: data.title, // Para componentes admin que usan title
        subtitle: data.subtitle,
        league: data.league, // Para compatibilidad con componentes que usan league
        category: data.league, // Para componentes admin que usan category
        team: data.team,
        priceUSD: Number(data.usdPrice), // Para compatibilidad con componentes que usan priceUSD
        usdPrice: Number(data.usdPrice), // Para componentes admin que usan usdPrice
        priceUYU: Number(data.uyuPrice), // Para compatibilidad con componentes que usan priceUYU
        uyuPrice: Number(data.uyuPrice), // Para componentes admin que usan uyuPrice
        details: data.details,
        extraDescription: data.extraDescription,
        descriptionPosition: data.descriptionPosition,
        active: data.active,
        stock: data.stock,
        images: images,
        image: images.length > 0 ? images[0] : "",
        sizes: [...SIZES], // Copiamos el array de tamaños
      };

      // Actualizar o añadir el producto
      if (id) {
        // Edición: reemplazar el producto existente
        const updatedProducts = existingProducts.map((p: any) =>
          p.id === Number(id) || p.id === id || p.id?.toString() === id ? product : p
        );
        localStorage.setItem("productos", JSON.stringify(updatedProducts));
        console.log("Producto actualizado en localStorage");
      } else {
        // Creación: añadir el nuevo producto
        existingProducts.push(product);
        localStorage.setItem("productos", JSON.stringify(existingProducts));
        console.log("Producto nuevo agregado a localStorage");
      }

      // Disparar evento para notificar a otras pestañas
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'productos',
        newValue: localStorage.getItem("productos")
      }));

      // Navegar de vuelta a la lista de productos
      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setError(`Error al guardar el producto. Detalles: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Editar producto" : "Crear nuevo producto"}
      </h2>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

      <div className="mb-4">
        <label className="block font-medium mb-1">Título/Nombre *</label>
        <input
          {...register("title", { required: "El título es obligatorio" })}
          className="w-full border rounded p-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title?.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block font-medium mb-1">Liga/Categoría *</label>
          <select
            {...register("league", { required: "La liga es obligatoria" })}
            className="w-full border rounded p-2"
            onChange={(e) => {
              setValue("league", e.target.value);
              setValue("team", "");
            }}
          >
            <option value="">Seleccionar liga...</option>
            {leagues.map((league) => (
              <option key={league.name} value={league.name}>
                {league.name}
              </option>
            ))}
          </select>
          {errors.league && (
            <p className="text-red-500 text-sm mt-1">{errors.league?.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Equipo</label>
          <select
            {...register("team")}
            className="w-full border rounded p-2"
            disabled={!selectedLeague}
          >
            <option value="">Seleccionar equipo...</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Subtítulo</label>
        <input {...register("subtitle")} className="w-full border rounded p-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block font-medium mb-1">Precio USD *</label>
          <input
  type="text"
  inputMode="numeric"
  pattern="\d*"
  {...register("usdPrice", { required: "El precio USD es obligatorio", min: { value: 1, message: "El precio debe ser mayor a 0" } })}
  className="w-full border rounded p-2"
/>
          {errors.usdPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.usdPrice?.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Precio UYU *</label>
          <input
  type="text"
  inputMode="numeric"
  pattern="\d*"
  {...register("uyuPrice", { required: "El precio UYU es obligatorio", min: { value: 1, message: "El precio debe ser mayor a 0" } })}
  className="w-full border rounded p-2"
/>
          {errors.uyuPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.uyuPrice?.message}</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Detalles</label>
        <textarea
          {...register("details")}
          className="w-full border rounded p-2 min-h-[100px]"
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Descripción extra</label>
        <textarea
          {...register("extraDescription")}
          className="w-full border rounded p-2 min-h-[100px]"
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Posición de descripción extra</label>
        <select
          {...register("descriptionPosition")}
          className="w-full border rounded p-2"
        >
          <option value="top">Arriba (antes de los detalles)</option>
          <option value="bottom">Abajo (después de los detalles)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input type="checkbox" {...register("active")} className="mr-2" />
          <span>Activo (visible en el sitio)</span>
        </label>
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">Stock por talle</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SIZES.map((size) => (
            <div key={size} className="border p-3 rounded">
              <label className="block font-medium mb-1">Talle {size}</label>
              <Controller
                name={`stock.${size}`}
                control={control}
                render={({ field }) => (
                  <input
  type="text"
  inputMode="numeric"
  pattern="\d*"
  value={field.value}
  onChange={(e) => {
    const value = parseInt(e.target.value);
    field.onChange(isNaN(value) ? 0 : value);
  }}
  className="w-full border rounded p-2"
/>
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">Imágenes</label>
        <p className="text-sm text-gray-500 mb-2">
          Podés subir varias imágenes. La primera imagen será la principal.
        </p>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          {loading
            ? "Guardando..."
            : id
            ? "Actualizar producto"
            : "Crear producto"}
        </button>
      </div>
    </form>
  );
}