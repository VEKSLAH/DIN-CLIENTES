// types.ts
export interface Articulo {
  codigo: string;
  descripcion: string;
  precio: number;
  rubro: string;
  marca: string;
  stock: "S" | "N" | "C" | null;
  lista?: string;
  equivalente?: string;
}

export interface OrderItem extends Articulo {
  cantidad: number;
}
