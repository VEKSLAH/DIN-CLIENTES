import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

interface Articulo {
  codigo: string;
  descripcion: string;
  precio: number;
  stock: "S" | "N" | "C" | null;
  rubro: string;
  marca: string;
  lista: string;
  equivalente: string;
}

type StockValue = "S" | "N" | "C";

const stockColor: Record<StockValue, string> = {
  S: "bg-green-500",
  N: "bg-red-500",
  C: "bg-yellow-400",
};

const stockText: Record<StockValue, string> = {
  S: "Disponible",
  N: "No disponible",
  C: "Consultar",
};

function highlight(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span
        key={`${part}-${i}`}
        className="bg-red-100 text-red-600 font-semibold rounded-sm px-0.5"
      >
        {part}
      </span>
    ) : (
      <span key={`${part}-${i}`}>{part}</span>
    )
  );
}

export default function Articulos() {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { isLoading: formLoading },
  } = useForm({
    defaultValues: {
      codigo: "",
      descripcion: "",
      disponibilidad: "",
      pagina: 1,
    },
  });

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [goPageInput, setGoPageInput] = useState("");

  const limit = 100;
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/articulos";

  const debounceRef = useRef<number | null>(null);
  const inflightRef = useRef(false);

  const codigo = watch("codigo");
  const descripcion = watch("descripcion");
  const disponibilidad = watch("disponibilidad");
  const pagina = watch("pagina");

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // 📦 Cargar artículos
  const fetchArticulos = async (opts?: {
    codigo?: string;
    descripcion?: string;
    disponibilidad?: string;
    pagina?: number;
  }) => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setIsTransitioning(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const vals = getValues();
      const pageToUse = opts?.pagina ?? vals.pagina ?? 1;
      const codeToUse = opts?.codigo ?? vals.codigo ?? "";
      const descToUse = opts?.descripcion ?? vals.descripcion ?? "";
      const dispToUse = opts?.disponibilidad ?? vals.disponibilidad ?? "";

      const params = new URLSearchParams({
        page: String(pageToUse),
        limit: String(limit),
      });
      if (codeToUse) params.append("codigo", codeToUse);
      if (descToUse) params.append("descripcion", descToUse);
      if (dispToUse) params.append("disponibilidad", dispToUse);

      const res = await fetch(`${API_URL}?${params}`, { signal });
      if (!res.ok) throw new Error("Error al cargar los artículos");

      const data = await res.json();
      if (!data.ok) throw new Error("Error en la respuesta del servidor");

      if (
        getValues("codigo") === codeToUse &&
        getValues("descripcion") === descToUse &&
        getValues("disponibilidad") === dispToUse
      ) {
        setArticulos(data.articulos || []);
        setTotal(data.total || 0);
        setValue("pagina", data.page ?? pageToUse);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("❌ Error en fetchArticulos:", err);
        setError(err?.message || "Error desconocido");
        setArticulos([]);
        setTotal(0);
      }
    } finally {
      inflightRef.current = false;
      setTimeout(() => setIsTransitioning(false), 200);
    }

    return () => controller.abort();
  };

  // 🚀 Carga inicial
  useEffect(() => {
    fetchArticulos({ pagina: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔁 Debounce inputs
  const handleInputChange = (
    field: "codigo" | "descripcion" | "disponibilidad",
    value: string
  ) => {
    setValue(field, value);
    setValue("pagina", 1);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchArticulos({
        codigo: field === "codigo" ? value : getValues().codigo,
        descripcion: field === "descripcion" ? value : getValues().descripcion,
        disponibilidad:
          field === "disponibilidad" ? value : getValues().disponibilidad,
        pagina: 1,
      });
      debounceRef.current = null;
    }, 300);
  };

  // 🔀 Cambiar página
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setValue("pagina", newPage);
    setGoPageInput("");
    fetchArticulos({ pagina: newPage });
  };

  // 🔎 Ir a página específica
  const handleGoPage = () => {
    const n = parseInt(goPageInput);
    if (!Number.isNaN(n) && n >= 1 && n <= totalPages) {
      setGoPageInput("");
      handlePageChange(n);
    }
  };

  const isLoading = formLoading;
  const tableKey = `page-${pagina}-${codigo}-${descripcion}-${disponibilidad}`;

  return (
    <div className="p-4">
      {/* 🔍 Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por código"
          {...register("codigo")}
          onChange={(e) => handleInputChange("codigo", e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Buscar por descripción"
          {...register("descripcion")}
          onChange={(e) => handleInputChange("descripcion", e.target.value)}
          className="flex-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
        />

        {/* 🔘 Filtro disponibilidad con color */}
        <div className="relative">
          <select
            {...register("disponibilidad")}
            onChange={(e) =>
              handleInputChange("disponibilidad", e.target.value)
            }
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none appearance-none pr-8"
          >
            <option value="">Todas</option>
            <option value="S">🟢 Disponible</option>
            <option value="N">🔴 No disponible</option>
            <option value="C">🟡 Consultar</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-center">Error: {error}</p>}

      {/* 📋 Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner max-h-[65vh] overflow-y-auto custom-scroll">
        <table className="w-full min-w-[800px] text-xs">
          <thead className="sticky top-0 bg-red-600 text-white text-left shadow-sm z-10">
            <tr>
              {[
                "Código",
                "Descripción",
                "Precio",
                "Rubro",
                "Marca Artículo",
                "Marca Vehículo",
                "Stock",
                "Equivalencia",
              ].map((header) => (
                <th key={header} className="p-2 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <AnimatePresence mode="wait">
            <motion.tbody
              key={tableKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: isTransitioning ? 0.4 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-gray-500 animate-pulse"
                  >
                    Cargando artículos...
                  </td>
                </tr>
              ) : (
                articulos.map((art, idx) => (
                  <tr
                    key={art.codigo + idx}
                    className={`border-b border-gray-100 transition ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-red-50`}
                  >
                    <td className="p-2 font-medium text-gray-800">
                      {highlight(art.codigo, codigo)}
                    </td>
                    <td className="p-2 text-gray-700">
                      {highlight(
                        art.descripcion || "Sin descripción",
                        descripcion
                      )}
                    </td>
                    <td className="p-2 text-gray-800 font-semibold">
                      ${art.precio.toFixed(2)}
                    </td>
                    <td className="p-2 text-gray-600">{art.rubro}</td>
                    <td className="p-2 text-gray-600">{art.marca}</td>
                    <td className="p-2 text-gray-600">{art.lista}</td>
                    <td className="p-2">
                      {art.stock ? (
                        <div
                          className={`h-4 w-4 rounded-full ${
                            stockColor[art.stock]
                          }`}
                          title={stockText[art.stock]}
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-2 text-gray-600">{art.equivalente}</td>
                  </tr>
                ))
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* 🔢 Paginación */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-sm">
        <button
          onClick={() => handlePageChange(pagina - 1)}
          disabled={pagina <= 1 || isLoading}
          className="bg-red-500 text-white px-3 py-1.5 rounded-md disabled:opacity-50 hover:bg-red-600 transition"
        >
          Anterior
        </button>

        <span className="text-gray-700 font-medium">
          {isLoading
            ? "Cargando..."
            : total > 0
            ? `Página ${pagina} de ${totalPages}`
            : "Sin resultados"}
        </span>

        <button
          onClick={() => handlePageChange(pagina + 1)}
          disabled={pagina >= totalPages || isLoading}
          className="bg-red-500 text-white px-3 py-1.5 rounded-md disabled:opacity-50 hover:bg-red-600 transition"
        >
          Siguiente
        </button>

        {/* Ir a */}
        <div className="flex items-center gap-2 ml-2">
          <input
            type="number"
            value={goPageInput}
            onChange={(e) => setGoPageInput(e.target.value)}
            placeholder="Ir a..."
            className="border border-gray-300 rounded-md px-2 py-1 w-20 focus:ring-2 focus:ring-red-400 focus:outline-none"
            min={1}
            max={totalPages}
          />
          <button
            onClick={handleGoPage}
            disabled={isLoading || !goPageInput}
            className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition disabled:opacity-50"
          >
            Ir
          </button>
        </div>
      </div>
    </div>
  );
}
