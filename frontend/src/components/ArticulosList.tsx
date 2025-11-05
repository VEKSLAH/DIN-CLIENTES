"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

export interface Articulo {
  codigo: string;
  descripcion: string;
  precio: number;
  stock: "S" | "N" | "C" | null;
  rubro: string;
  marca: string;
  lista: string;
  equivalente: string;
}

export interface FiltrosForm {
  rubro: string;
  lista: string;
  disponibilidad: string;
  [key: string]: string;
}

export interface Props {
  rubros: string[];
  listas: string[];
  loadingFilters: boolean;
  handleInputChange: (field: keyof FiltrosForm, value: string) => void;
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
  C: "Consultar disponibilidad",
};

const highlight = (text: string, query: string) => {
  if (!query) return text;

  const palabras = query.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return text;

  const regex = new RegExp(`(${palabras.join("|")})`, "gi");

  return text.split(regex).map((part, i) =>
    palabras.some((palabra) => part.toLowerCase() === palabra.toLowerCase()) ? (
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
};

interface ArticulosListProps {
  onAddToOrder: (articulo: Articulo) => void;
}

export default function ArticulosList({ onAddToOrder }: ArticulosListProps) {
  const { register, watch, setValue, getValues } = useForm({
    defaultValues: {
      codigo: "",
      descripcion: "",
      disponibilidad: "",
      rubro: "",
      lista: "",
      pagina: 1,
    },
  });

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [rubros, setRubros] = useState<string[]>([]);
  const [listas, setListas] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [goPageInput, setGoPageInput] = useState("");
  const [added, setAdded] = useState<string | null>(null);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const limit = 100;
  
  //// DEV: const API_BASE = "http://localhost:3000";

  const API_BASE = (() => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return url.replace(/\/$/, "");
  })();

  const API_URL = `${API_BASE}/articulos`;
  const RUBROS_URL = `${API_BASE}/rubros`;
  const LISTAS_URL = `${API_BASE}/listas`;

  const debounceRef = useRef<number | null>(null);
  const inflightRef = useRef(false);

  const codigo = watch("codigo");
  const descripcion = watch("descripcion");
  const disponibilidad = watch("disponibilidad");
  const rubro = watch("rubro");
  const lista = watch("lista");
  const pagina = watch("pagina");

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const controllerRef = useRef<AbortController | null>(null);

  // 🚀 Cargar artículos
  const fetchArticulos = async (opts?: {
    codigo?: string;
    descripcion?: string;
    disponibilidad?: string;
    rubro?: string;
    lista?: string;
    pagina?: number;
  }) => {
    // 🚫 Cancela la request anterior si sigue activa
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    if (inflightRef.current) return;
    inflightRef.current = true;
    setIsTransitioning(true);
    setError(null);

    try {
      const vals = getValues();
      const params = new URLSearchParams({
        page: String(opts?.pagina ?? vals.pagina ?? 1),
        limit: String(limit),
      });

      const fields: (keyof typeof vals)[] = [
        "codigo",
        "descripcion",
        "disponibilidad",
        "rubro",
        "lista",
      ];

      fields.forEach((field) => {
        const val = opts?.[field] ?? vals[field];
        if (val) params.append(field, val as string);
      });

      const res = await fetch(`${API_URL}?${params}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Error al cargar los artículos");

      const data = await res.json();
      if (!data.ok) throw new Error("Error en la respuesta del servidor");

      setArticulos(data.articulos || []);
      setTotal(data.total || 0);
      setValue("pagina", data.page ?? opts?.pagina ?? 1);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("❌ Error en fetchArticulos:", err);
      setError(err?.message || "Error desconocido");
      setArticulos([]);
      setTotal(0);
    } finally {
      inflightRef.current = false;
      setTimeout(() => setIsTransitioning(false), 200);
    }
  };

  // 🎯 Cargar rubros y listas al iniciar
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [resRubros, resListas] = await Promise.all([
          fetch(RUBROS_URL),
          fetch(LISTAS_URL),
        ]);

        const dataRubros = await resRubros.json();
        const dataListas = await resListas.json();

        setRubros(dataRubros.rubros || []);
        setListas(dataListas.listas || []);
      } catch (err) {
        console.error("❌ Error al cargar filtros:", err);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
    fetchArticulos({ pagina: 1 });
  }, []);

  // 🕒 Debounce búsqueda
  const handleInputChange = (
    field: "codigo" | "descripcion" | "disponibilidad" | "rubro" | "lista",
    value: string
  ) => {
    setValue(field, value);
    setValue("pagina", 1);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchArticulos({
        ...getValues(),
        [field]: value,
        pagina: 1,
      });
      debounceRef.current = null;
    }, 300);
  };

  // ➕ Agregar artículo
  const handleAdd = (art: Articulo) => {
    onAddToOrder(art);
    setAdded(art.codigo);
    setTimeout(() => setAdded(null), 1000);
  };

  // 🔀 Paginación
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setValue("pagina", newPage);
    setGoPageInput("");
    fetchArticulos({ pagina: newPage });
  };

  const handleGoPage = () => {
    const n = parseInt(goPageInput);
    if (!Number.isNaN(n) && n >= 1 && n <= totalPages) {
      setGoPageInput("");
      handlePageChange(n);
    }
  };

  const tableKey = `page-${pagina}-${codigo}-${descripcion}-${disponibilidad}-${rubro}-${lista}`;

  return (
    <div className="p-3">
      {/* 🔍 Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          {...register("codigo")}
          placeholder="Buscar por código"
          onChange={(e) => handleInputChange("codigo", e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
        <input
          {...register("descripcion")}
          placeholder="Buscar por descripción"
          onChange={(e) => handleInputChange("descripcion", e.target.value)}
          className="flex-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
        {/* 🧾 Filtro de Rubro */}
        <select
          {...register("rubro")}
          disabled={loadingFilters}
          onChange={(e) => handleInputChange("rubro", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none appearance-none pr-8 min-w-40"
        >
          <option value="">Todos los rubros</option>
          {rubros.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* 🚗 Filtro de Marca Vehículo (Lista) */}
        <select
          {...register("lista")}
          disabled={loadingFilters}
          onChange={(e) => handleInputChange("lista", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none appearance-none pr-8 min-w-40"
        >
          <option value="">Todas las marcas vehículo</option>
          {listas.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          {...register("disponibilidad")}
          onChange={(e) => handleInputChange("disponibilidad", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none appearance-none pr-8"
        >
          <option value="">Todas</option>
          <option value="S">🟢 Disponible</option>
          <option value="N">🔴 No disponible</option>
          <option value="C">🟡 Consultar</option>
        </select>
      </div>

      {/* 🌀 Loader de búsqueda */}
      {isTransitioning && (
        <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse mb-3">
          <svg
            className="w-4 h-4 animate-spin text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Buscando artículos...
        </div>
      )}

      <div>
        {/* ⚠️ Error */}
        {error && <p className="text-red-600 text-center">Error: {error}</p>}

        {/* 🧩 Tabla */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner max-h-[65vh] overflow-y-auto custom-scroll">
          <table className="w-full min-w-[800px] text-xs">
            <thead className="sticky top-0 bg-red-600 text-white text-left shadow-sm z-10">
              <tr>
                {[
                  "Agregar",
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
                {articulos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500">
                      No se encontraron artículos
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
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleAdd(art)}
                          className={`w-8 h-8 rounded-md text-white flex items-center justify-center transition-all duration-200 
                     ${
                       added === art.codigo
                         ? "bg-green-500 hover:bg-green-600 scale-105"
                         : "bg-red-500 hover:bg-red-600 scale-105"
                     }
                         `}
                        >
                          {added === art.codigo ? "✔" : "+"}
                        </button>
                      </td>
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
                        $
                        {art.marca && art.marca !== "APEDIDO"
                          ? // &&
                            // (art.stock === "S" || art.stock === "C")
                            (art.precio * 0.87 * 0.6 * 2.2).toLocaleString(
                              "es-AR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : (art.precio * 0.87 * 2.2).toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </td>
                      <td className="p-2 text-gray-600">{art.rubro}</td>
                      <td className="p-2 text-gray-600">{art.marca}</td>
                      <td className="p-2 text-gray-600">{art.lista}</td>
                      <td className="p-2 text-center">
                        {art.stock ? (
                          <div
                            className={`h-4 w-4 rounded-full inline-block ${
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
            disabled={pagina <= 1}
            className="bg-red-500 text-white px-3 py-1.5 rounded-md disabled:opacity-50 hover:bg-red-600 transition"
          >
            Anterior
          </button>

          <span className="text-gray-700 font-medium">
            Página {pagina} de {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagina + 1)}
            disabled={pagina >= totalPages}
            className="bg-red-500 text-white px-3 py-1.5 rounded-md disabled:opacity-50 hover:bg-red-600 transition"
          >
            Siguiente
          </button>

          <div className="flex items-center gap-2 ml-2">
            <input
              type="number"
              value={goPageInput}
              onChange={(e) => setGoPageInput(e.target.value)}
              placeholder="Ir a..."
              className="border border-gray-300 rounded-md px-2 py-1 w-20 focus:ring-1 focus:ring-gray-600 focus:outline-none"
              min={1}
              max={totalPages}
            />
            <button
              onClick={handleGoPage}
              disabled={!goPageInput}
              className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition disabled:opacity-50"
            >
              Ir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
