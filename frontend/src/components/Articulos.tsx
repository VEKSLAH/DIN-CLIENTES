import { useEffect, useState } from "react";

interface Articulo {
  codigo: string;
  descripcion: string;
  precio: number;
  stock: "S" | "N" | "C" | null; // stock con valores posibles
  rubro: string;
  marca: string;
  lista: string;
  equivalente: string;
}

// Tipos literales para stock
type StockValue = "S" | "N" | "C";

const stockColor: Record<StockValue, string> = {
  S: "bg-green-500",
  N: "bg-red-500",
  C: "bg-yellow-400",
};

const stockText: Record<StockValue, string> = {
  S: "Este artículo esta disponible",
  N: "Este artículo no esta disponible",
  C: "Consultar disponibilidad",
};

// Función para resaltar texto buscado
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
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [total, setTotal] = useState(0);

  const [codigoBuscado, setCodigoBuscado] = useState("");
  const [descripcionBuscada, setDescripcionBuscada] = useState("");
  const [paginaInput, setPaginaInput] = useState("");

  const API_URL = import.meta.env.PROD
    ? "https://din-clientes.onrender.com/articulos"
    : "http://localhost:3000/articulos";

  const fetchArticulos = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
      });
      if (codigoBuscado) params.append("codigo", codigoBuscado);
      if (descripcionBuscada) params.append("descripcion", descripcionBuscada);

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error("Error al cargar los artículos");
      const data = await res.json();
      if (!data.ok) throw new Error("Error en la respuesta del servidor");

      setArticulos(data.articulos);
      setTotal(data.total);
      setPage(data.page);
      setPaginaInput("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchArticulos(1), 300);
    return () => clearTimeout(timeout);
  }, [codigoBuscado, descripcionBuscada]);

  const totalPages = Math.ceil(total / limit);
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchArticulos(newPage);
  };

  const handlePaginaInput = () => {
    const p = parseInt(paginaInput);
    if (!isNaN(p)) handlePageChange(p);
  };

  return (
    <div className="p-4">
      {/* Buscadores */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por código"
          value={codigoBuscado}
          onChange={(e) => setCodigoBuscado(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Buscar por descripción"
          value={descripcionBuscada}
          onChange={(e) => setDescripcionBuscada(e.target.value)}
          className="flex-[2] border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
      </div>

      {loading && (
        <p className="text-gray-500 text-center py-4 animate-pulse">
          Cargando artículos...
        </p>
      )}
      {error && <p className="text-red-600 text-center">Error: {error}</p>}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner max-h-[65vh] overflow-y-auto custom-scroll">
        <table className="w-full min-w-[800px] text-xs">
          <thead className="sticky top-0 bg-red-600 text-white text-left shadow-sm z-10">
            <tr>
              {[
                "Código",
                "Descripción",
                "Precio",
                "Rubro",
                "Marca",
                "Lista",
                "Stock",
                "Equivalencia",
              ].map((header) => (
                <th key={header} className="p-2 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articulos.map((art, idx) => (
              <tr
                key={art.codigo}
                className={`border-b border-gray-100 transition ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-red-50`}
              >
                <td className="p-2 font-medium text-gray-800">
                  {highlight(art.codigo, codigoBuscado)}
                </td>
                <td className="p-2 text-gray-700">
                  {highlight(
                    art.descripcion || "Sin descripción",
                    descripcionBuscada
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
                      className={`h-4 w-4 rounded-full ${stockColor[art.stock]}`}
                      title={stockText[art.stock]}
                    ></div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-2 text-gray-600">{art.equivalente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-sm">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="bg-red-500 text-white px-3 py-1.5 rounded-md disabled:opacity-50 hover:bg-red-600 transition"
        >
          Anterior
        </button>
        <span className="text-gray-700 font-medium">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="bg-red-500 text-white px-3 py-1.5 rounded-md disabled:opacity-50 hover:bg-red-600 transition"
        >
          Siguiente
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Ir a..."
            value={paginaInput}
            onChange={(e) => setPaginaInput(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 w-20 focus:ring-2 focus:ring-red-400 focus:outline-none"
            min={1}
            max={totalPages}
          />
          <button
            onClick={handlePaginaInput}
            className="bg-red-700 text-white px-3 py-1.5 rounded-md hover:bg-red-800 transition"
          >
            Ir
          </button>
        </div>
      </div>
    </div>
  );
}
