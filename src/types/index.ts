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
  ancho_cm: number | null;
  alto_cm: number | null;
  anio: number | null;
  fecha_creacion: string | null;
  precio: number;
  estado: string | null;
  descuento_porcentaje: number | null;
  lamina_precio: number | null;
  disponible: boolean;
  destacada: boolean;
  imagen_url: string | null;
  imagen_ancho_px: number | null;
  imagen_alto_px: number | null;
  orientacion: "horizontal" | "vertical" | null;
  categoria_id: string | null;
  created_at: string;
  updated_at: string;
  categorias?: Categoria | null;
};

export type ObraDetalle = {
  id: string;
  obra_id: string;
  imagen_url: string;
  orden: number;
  tamano: "1x1" | "1x2";
  created_at: string;
};

export type Entorno = {
  id: string;
  tipo: "salon" | "comedor" | "oficina" | "despacho";
  imagen_url: string | null;
  pared_x: number | null;
  pared_y: number | null;
  pared_ancho: number | null;
  pared_alto: number | null;
  escala_cm_por_px: number | null;
  overlay_luz_url: string | null;
  orden: number | null;
  created_at: string;
  updated_at: string;
};

export type MensajeContacto = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string;
  tipo: "general" | "presupuesto";
  encargo_tipo: "personalizado" | "pack" | null;
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
  tipo: "original" | "lamina";
  created_at: string;
  obras?: Pick<Obra, "titulo" | "imagen_url"> | null;
};
