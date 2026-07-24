export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
};

export type Obra = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tecnica: string | null;
  medidas: string | null;
  anio: number | null;
  precio: number;
  disponible: boolean;
  destacada: boolean;
  imagen_url: string | null;
  categoria_id: string | null;
  created_at: string;
  updated_at: string;
  categorias?: Categoria | null;
};

export type MensajeContacto = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string;
  leido: boolean;
  created_at: string;
};

export type Pedido = {
  id: string;
  obra_id: string | null;
  stripe_session_id: string | null;
  comprador_email: string | null;
  comprador_nombre: string | null;
  direccion_envio: unknown;
  importe: number | null;
  estado: "pendiente" | "pagado" | "cancelado";
  created_at: string;
};
