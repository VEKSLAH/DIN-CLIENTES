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

        setStatus({
          source: data.fuente,
          lastUpdate: data.ultima_actualizacion,
          totalArticulos:
            typeof data.detalles === "string"
              ? parseInt(data.detalles.match(/\d+/)?.[0] || "0")
              : undefined,
        });
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
      <p className="hidden hover:flex text-xs text-gray-400 text-center mt-3">
        Cargando estado del servidor...
      </p>
    );

  const indicatorColor =
    status.source === "Okawa" ? "bg-green-500" : "bg-red-500";

  return (
    <div className="flex flex-col justify-start items-start text-xs text-white transition duration-300 rounded-xl py-2 px-3 shadow-sm group hover:bg-white/10 hover:text-black">
      <p className="mt-1">
        <strong>Última actualización:</strong>{" "}
        {status.lastUpdate
          ? new Date(status.lastUpdate).toLocaleString("es-AR")
          : "N/D"}
      </p>

      <p>
        <strong>Artículos:</strong> {status.totalArticulos ?? "—"}
      </p>
      <div className="flex items-center justify-start gap-2 w-full">
        <p className="opacity-60 text-[11px]">
          Estado del servidor actualizado
        </p>
        <div
          className={`w-2.5 h-2.5 rounded-full ${indicatorColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>
      </div>
    </div>
  );
}
