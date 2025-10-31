"use client";

import { useState } from "react";
import type { OrderItem } from "../types";

interface Props {
  order: OrderItem[];
  setOrder: React.Dispatch<React.SetStateAction<OrderItem[]>>;
}

export default function OrderForm({ order, setOrder }: Props) {
  const [cliente, setCliente] = useState({
    nombre: "",
    whatsapp: "",
    email: "",
  });

  const total = order.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const handleRemove = (codigo: string) => {
    setOrder((prev) => prev.filter((item) => item.codigo !== codigo));
  };

  const handleChangeCantidad = (codigo: string, delta: number) => {
    setOrder((prev) =>
      prev.map((item) =>
        item.codigo === codigo
          ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
          : item
      )
    );
  };

  const handleClear = () => {
    setOrder([]);
    localStorage.removeItem("pedido");
  };

  const handleSendWhatsApp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!cliente.nombre || order.length === 0) return;

    const numero = "1165512113";
    const mensaje = `*Nuevo pedido desde DIN Clientes*%0A%0A👤 *Cliente:* ${cliente.nombre}%0A📱 *WhatsApp:* ${cliente.whatsapp}%0A✉️ *Email:* ${cliente.email}%0A%0A🧾 *Detalle del pedido:*%0A${order
      .map(
        (item) =>
          `• ${item.descripcion} (${item.codigo}) x${item.cantidad} — $${(
            item.precio * item.cantidad
          ).toLocaleString("es-AR")}`
      )
      .join("%0A")}%0A%0A💰 *Total:* $${total.toLocaleString("es-AR")}`;

    const url = `https://wa.me/549${numero}?text=${mensaje}`;
    const win = window.open(url, "_blank");
    if (win) win.focus();
  };

  const handleSendEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!cliente.nombre || order.length === 0) return;

    const destinatario = "ventas@din.com.ar";
    const asunto = `Nuevo pedido - ${cliente.nombre}`;
    const cuerpo = `Nuevo pedido desde DIN Clientes

Cliente: ${cliente.nombre}
WhatsApp: ${cliente.whatsapp}
Email: ${cliente.email}

Detalle del pedido:
${order
  .map(
    (item) =>
      `• ${item.descripcion} (${item.codigo}) x${item.cantidad} — $${(
        item.precio * item.cantidad
      ).toLocaleString("es-AR")}`
  )
  .join("\n")}

Total: $${total.toLocaleString("es-AR")}
`;

    const mailtoLink = `mailto:${destinatario}?subject=${encodeURIComponent(
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`;

    const a = document.createElement("a");
    a.href = mailtoLink;
    a.click();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
        Pedido
      </h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          placeholder="Nombre"
          value={cliente.nombre}
          onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-red-400 focus:outline-none placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="WhatsApp"
          value={cliente.whatsapp}
          onChange={(e) => setCliente({ ...cliente, whatsapp: e.target.value })}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-red-400 focus:outline-none placeholder-gray-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={cliente.email}
          onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-red-400 focus:outline-none placeholder-gray-400"
        />
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden max-h-60 overflow-y-auto shadow-inner">
        {order.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No hay artículos en el pedido.
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-2 text-left font-semibold">Artículo</th>
                <th className="p-2 text-center">Cant.</th>
                <th className="p-2 text-right">Subtotal</th>
                <th className="p-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {order.map((item) => (
                <tr
                  key={item.codigo}
                  className="border-b border-gray-100 even:bg-gray-50 hover:bg-gray-100 transition"
                >
                  <td className="p-2">{item.descripcion}</td>
                  <td className="p-2 text-center flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleChangeCantidad(item.codigo, -1)}
                      className="px-2 py-0.5 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => handleChangeCantidad(item.codigo, 1)}
                      className="px-2 py-0.5 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                    >
                      +
                    </button>
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    ${(item.precio * item.cantidad).toLocaleString("es-AR")}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => handleRemove(item.codigo)}
                      className="text-red-500 hover:text-red-700 text-xs underline transition"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-gray-800 font-semibold text-sm">
          Total: ${total.toLocaleString("es-AR")}
        </div>
        <div className="flex gap-1 text-xs">
          <button
            onClick={handleSendWhatsApp}
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
            disabled={!cliente.nombre || order.length === 0}
          >
            Enviar por WhatsApp
          </button>
          <button
            onClick={handleSendEmail}
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
            disabled={!cliente.nombre || order.length === 0}
          >
            Enviar por Email
          </button>
          <button
            onClick={handleClear}
            className="border-2 border-red-600 hover:border-red-500 text-red-500 px-3 py-1 rounded-md hover:bg-red-500 hover:text-white transition duration-300"
          >
            Vaciar
          </button>
        </div>
      </div>
    </div>
  );
}
