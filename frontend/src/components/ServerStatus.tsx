import { useEffect, useState } from "react";

export default function ServerStatus() {
  const [status, setStatus] = useState<{
    source?: string;
    lastUpdate?: string;
    totalArticulos?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("https://din-clientes.onrender.com/status");
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        setError("Error al obtener estado del servidor");
      }
    };

    fetchStatus();
  }, []);

  if (error)
    return (
      <p className="text-xs text-red-600 text-center mt-3 bg-red-600/10 py-2 rounded-lg">
        {error}
      </p>
    );

  if (!status)
    return (
      <p className="text-xs text-gray-400 text-center mt-3">
        Cargando estado del servidor...
      </p>
    );

  // Determinar color del indicador según la fuente
  const indicatorColor =
    status.source === "Render" ? "bg-green-500" : "bg-amber-500";

  return (
    <div className="mt-4 text-sm text-red-700 text-center bg-red-600/10 rounded-xl py-2 px-3 shadow-sm">
      <div className="flex items-center justify-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`}></span>
        <p>
          🗂️ <strong>Fuente:</strong> {status.source}
        </p>
      </div>

      <p className="mt-1">
        ⏰ <strong>Última actualización:</strong>{" "}
        {status.lastUpdate
          ? new Date(status.lastUpdate).toLocaleString("es-AR")
          : "N/D"}
      </p>

      <p>
        📦 <strong>Artículos:</strong> {status.totalArticulos ?? "—"}
      </p>
    </div>
  );
}
