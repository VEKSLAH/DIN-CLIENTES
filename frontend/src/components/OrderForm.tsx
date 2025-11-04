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

  const [mensajeError, setMensajeError] = useState("");

  // Total con factor aplicado
  const total = order.reduce(
    (acc, item) => acc + item.precio * 0.87 * 2.2 * item.cantidad,
    0
  );

  // Agregar artículo sumando cantidad si ya existe
  // const handleAddItem = (nuevoItem: OrderItem) => {
  //   setOrder((prev) => {
  //     const existe = prev.find((item) => item.codigo === nuevoItem.codigo);
  //     if (existe) {
  //       return prev.map((item) =>
  //         item.codigo === nuevoItem.codigo
  //           ? { ...item, cantidad: item.cantidad + nuevoItem.cantidad }
  //           : item
  //       );
  //     } else {
  //       return [...prev, nuevoItem];
  //     }
  //   });
  // };

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

  const validarCampos = () => {
    if (!cliente.nombre || !cliente.whatsapp || !cliente.email) {
      setMensajeError("⚠️ Completá todos los campos antes de enviar.");
      return false;
    }
    if (order.length === 0) {
      setMensajeError("🧾 Agregá al menos un artículo al pedido.");
      return false;
    }
    setMensajeError("");
    return true;
  };

  const handleSendWhatsApp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validarCampos()) return;

    const numero = "2994608210";
    const mensaje = `*Nuevo pedido desde DIN Clientes*%0A%0A👤 *Cliente:* ${
      cliente.nombre
    }%0A📱 *WhatsApp:* ${cliente.whatsapp}%0A✉️ *Email:* ${
      cliente.email
    }%0A%0A🧾 *Detalle del pedido:*%0A${order
      .map((item) => {
        const precioFinal = item.precio * 0.87 * 2.2;
        return `• ${item.descripcion} (${item.codigo}) x${item.cantidad} — $${(
          precioFinal * item.cantidad
        ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
      })
      .join("%0A")}%0A%0A💰 *Total:* $${total.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

    const url = `https://wa.me/549${numero}?text=${mensaje}`;
    const win = window.open(url, "_blank");
    if (win) win.focus();
  };
//// Se comenta codigo para futura implementacion, recordar aplicar descuento y multiplicador ////
  //   const handleSendEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
  //     e.preventDefault();
  //     if (!validarCampos()) return;

  //     const destinatario = "ventas@din.com.ar";
  //     const asunto = `Nuevo pedido - ${cliente.nombre}`;
  //     const cuerpo = `Nuevo pedido desde DIN Clientes

  // Cliente: ${cliente.nombre}
  // WhatsApp: ${cliente.whatsapp}
  // Email: ${cliente.email}

  // Detalle del pedido:
  // ${order
  //   .map(
  //     (item) =>
  //       `• ${item.descripcion} (${item.codigo}) x${item.cantidad} — $${(
  //         item.precio * item.cantidad
  //       ).toLocaleString("es-AR")}`
  //   )
  //   .join("\n")}

  // Total: $${total.toLocaleString("es-AR")}
  // `;

  //     const mailtoLink = `mailto:${destinatario}?subject=${encodeURIComponent(
  //       asunto
  //     )}&body=${encodeURIComponent(cuerpo)}`;

  //     const a = document.createElement("a");
  //     a.href = mailtoLink;
  //     a.click();

  //     setTimeout(() => {
  //       setMensajeError(
  //         "📧 Si no se abrió tu cliente de correo, copiá la dirección: ventas@din.com.ar"
  //       );
  //     }, 1000);
  //   };
  //// Se comenta codigo para futura implementacion ////
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
        Pedido
      </h2>

      {mensajeError && (
        <div className="mb-3 text-xs text-red-600 bg-red-100 border border-red-300 rounded-md px-3 py-2">
          {mensajeError}
        </div>
      )}

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

      {/* Lista de artículos */}
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
                  {/* <td className="p-2 text-right whitespace-nowrap">
                    ${(item.precio * item.cantidad).toLocaleString("es-AR")}
                  </td> */}
                  <td className="p-2 text-right whitespace-nowrap">
                    $
                    {(item.precio * 0.87 * 2.2 * item.cantidad).toLocaleString(
                      "es-AR",
                      { minimumFractionDigits: 2 }
                    )}
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
          Total: ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </div>
        <div className="flex gap-1 text-xs">
          <button
            onClick={handleSendWhatsApp}
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
          >
            Enviar por WhatsApp
          </button>
          {/* Se comementa boton para implementacion futura */}

          {/* <button
            onClick={handleSendEmail}
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
          >
            Enviar por Email
          </button> */}

          {/* Se comementa boton para implementacion futura */}
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
