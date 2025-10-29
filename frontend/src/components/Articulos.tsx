////////////////////////// OK //////////////////////////////


// import { useEffect, useState } from "react";

// interface Articulo {
//   codigo: string;
//   descripcion: string;
//   precio: number;
//   stock: number | null;
//   rubro: string;
//   marca: string;
//   lista: string;
// }

// // Función para resaltar coincidencias
// function highlight(text: string, query: string) {
//   if (!query) return text;
//   const regex = new RegExp(`(${query})`, "gi");
//   return text.split(regex).map((part, i) =>
//     regex.test(part) ? (
//       <span key={i} style={{ backgroundColor: "#fee2e2", color: "#dc2626", fontWeight: "bold" }}>
//         {part}
//       </span>
//     ) : (
//       part
//     )
//   );
// }

// export default function Articulos() {
//   const [articulos, setArticulos] = useState<Articulo[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [page, setPage] = useState(1);
//   const [limit] = useState(100);
//   const [total, setTotal] = useState(0);

//   const [codigoBuscado, setCodigoBuscado] = useState("");
//   const [descripcionBuscada, setDescripcionBuscada] = useState("");

//   const fetchArticulos = async (p = page) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams({
//         page: p.toString(),
//         limit: limit.toString(),
//       });
//       if (codigoBuscado) params.append("codigo", codigoBuscado);
//       if (descripcionBuscada) params.append("descripcion", descripcionBuscada);

//       const res = await fetch(`http://localhost:3000/articulos?${params}`);
//       if (!res.ok) throw new Error("Error al cargar los artículos");
//       const data = await res.json();
//       if (!data.ok) throw new Error("Error en la respuesta del servidor");

//       setArticulos(data.articulos);
//       setTotal(data.total);
//       setPage(data.page);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Búsqueda instantánea con debounce
//   useEffect(() => {
//     const timeout = setTimeout(() => fetchArticulos(1), 300);
//     return () => clearTimeout(timeout);
//   }, [codigoBuscado, descripcionBuscada]);

//   const totalPages = Math.ceil(total / limit);
//   const handlePageChange = (newPage: number) => {
//     if (newPage < 1 || newPage > totalPages) return;
//     fetchArticulos(newPage);
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Lista de Artículos ({total})</h1>

//       {/* Buscadores */}
//       <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
//         <input
//           type="text"
//           placeholder="Buscar por código"
//           value={codigoBuscado}
//           onChange={(e) => setCodigoBuscado(e.target.value)}
//           style={{ padding: 8, flex: 1 }}
//         />
//         <input
//           type="text"
//           placeholder="Buscar por descripción"
//           value={descripcionBuscada}
//           onChange={(e) => setDescripcionBuscada(e.target.value)}
//           style={{ padding: 8, flex: 2 }}
//         />
//       </div>

//       {loading && <p>Cargando...</p>}
//       {error && <p style={{ color: "#dc2626" }}>Error: {error}</p>}

//       {/* Tabla de artículos */}
//       <div style={{ overflowX: "auto" }}>
//         <table
//           style={{
//             width: "100%",
//             borderCollapse: "collapse",
//             minWidth: 600,
//           }}
//         >
//           <thead>
//             <tr style={{ backgroundColor: "#dc2626", color: "#fff" }}>
//               <th style={{ padding: 10, border: "1px solid #ddd" }}>Código</th>
//               <th style={{ padding: 10, border: "1px solid #ddd" }}>Descripción</th>
//               <th style={{ padding: 10, border: "1px solid #ddd" }}>Precio</th>
//               <th style={{ padding: 10, border: "1px solid #ddd" }}>Rubro</th>
//               <th style={{ padding: 10, border: "1px solid #ddd" }}>Marca</th>
//               <th style={{ padding: 10, border: "1px solid #ddd" }}>Lista</th>
//             </tr>
//           </thead>
//           <tbody>
//             {articulos.map((art) => (
//               <tr key={art.codigo} style={{ borderBottom: "1px solid #ddd" }}>
//                 <td style={{ padding: 8 }}>{highlight(art.codigo, codigoBuscado)}</td>
//                 <td style={{ padding: 8 }}>{highlight(art.descripcion || "Sin descripción", descripcionBuscada)}</td>
//                 <td style={{ padding: 8 }}>${art.precio.toFixed(2)}</td>
//                 <td style={{ padding: 8 }}>{art.rubro}</td>
//                 <td style={{ padding: 8 }}>{art.marca}</td>
//                 <td style={{ padding: 8 }}>{art.lista}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Paginación */}
//       <div style={{ marginTop: 20 }}>
//         <button
//           onClick={() => handlePageChange(page - 1)}
//           disabled={page <= 1}
//           style={{ marginRight: 10, backgroundColor: "#f87171", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4 }}
//         >
//           Anterior
//         </button>
//         <span>
//           Página {page} de {totalPages}
//         </span>
//         <button
//           onClick={() => handlePageChange(page + 1)}
//           disabled={page >= totalPages}
//           style={{ marginLeft: 10, backgroundColor: "#f87171", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4 }}
//         >
//           Siguiente
//         </button>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";

interface Articulo {
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number | null;
  rubro: string;
  marca: string;
  lista: string;
  equivalente: string;
}

// Función para resaltar coincidencias
function highlight(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} style={{ backgroundColor: "#fee2e2", color: "#dc2626", fontWeight: "bold" }}>
        {part}
      </span>
    ) : (
      part
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
  const [paginaInput, setPaginaInput] = useState(""); // para el input de página

const API_URL =
  import.meta.env.PROD
    ? "https://din-clientes.onrender.com/articulos" // producción
    : "http://localhost:3000/articulos";           // desarrollo local

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
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Búsqueda instantánea con debounce
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
    <div style={{ padding: 20 }}>
      <h1>Lista de Artículos ({total})</h1>

      {/* Buscadores */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Buscar por código"
          value={codigoBuscado}
          onChange={(e) => setCodigoBuscado(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        <input
          type="text"
          placeholder="Buscar por descripción"
          value={descripcionBuscada}
          onChange={(e) => setDescripcionBuscada(e.target.value)}
          style={{ padding: 8, flex: 2 }}
        />
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "#dc2626" }}>Error: {error}</p>}

      {/* Tabla de artículos */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 600,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#dc2626", color: "#fff" }}>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Código</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Descripción</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Precio</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Rubro</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Marca</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Lista</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Stock</th>
              <th style={{ padding: 10, border: "1px solid #ddd" }}>Equivalencia</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((art) => (
              <tr key={art.codigo} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: 8 }}>{highlight(art.codigo, codigoBuscado)}</td>
                <td style={{ padding: 8 }}>{highlight(art.descripcion || "Sin descripción", descripcionBuscada)}</td>
                <td style={{ padding: 8 }}>${art.precio.toFixed(2)}</td>
                <td style={{ padding: 8 }}>{art.rubro}</td>
                <td style={{ padding: 8 }}>{art.marca}</td>
                <td style={{ padding: 8 }}>{art.lista}</td>
                <td style={{ padding: 8 }}>{art.stock}</td>
                <td style={{ padding: 8 }}>{art.equivalente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          style={{ backgroundColor: "#f87171", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4 }}
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          style={{ backgroundColor: "#f87171", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4 }}
        >
          Siguiente
        </button>

        
      {/* Ir a página específica */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="number"
          placeholder="Número de página"
          value={paginaInput}
          onChange={(e) => setPaginaInput(e.target.value)}
          style={{ padding: 6, width: 120 }}
          min={1}
          max={totalPages}
        />
        <button
          onClick={handlePaginaInput}
          style={{ backgroundColor: "#dc2626", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4 }}
        >
          Ir
        </button>
      </div>
      </div>

    </div>
  );
}
