"use client";

import { useState, useEffect } from "react";
import ArticulosList from "./ArticulosList";
import OrderForm from "./OrderForm";
import type { OrderItem } from "../types";

export default function ArticulosWithOrderForm() {
  const [order, setOrder] = useState<OrderItem[]>([]);

  // Cargar pedido guardado desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pedido");
    if (saved) {
      try {
        setOrder(JSON.parse(saved));
      } catch {
        localStorage.removeItem("pedido");
      }
    }
  }, []);

  // Guardar pedido al cambiar
  useEffect(() => {
    localStorage.setItem("pedido", JSON.stringify(order));
  }, [order]);

  // Agregar artículo o aumentar cantidad
  const handleAddToOrder = (item: OrderItem) => {
    setOrder((prev) => {
      const existing = prev.find((i) => i.codigo === item.codigo);
      if (existing) {
        return prev.map((i) =>
          i.codigo === item.codigo ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 🧩 Lista de artículos */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-white hover:border-gray-100 transition duration-300 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
          Catálogo de artículos
        </h2>
        <ArticulosList
          onAddToOrder={(articulo) =>
            handleAddToOrder({ ...articulo, cantidad: 1 })
          }
        />
      </div>

      {/* 🧾 Formulario del pedido */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-white hover:border-gray-100 transition duration-300 p-4 sm:p-6">
        <OrderForm order={order} setOrder={setOrder} />
      </div>
    </div>
  );
}
