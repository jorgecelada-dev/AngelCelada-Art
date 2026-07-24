-- ============================================================
-- Esquema de base de datos para la web del artista
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Tabla: categorias (técnicas / colecciones de las obras)
-- ------------------------------------------------------------
create table if not exists categorias (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null unique,
  descripcion text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: obras (los cuadros)
-- ------------------------------------------------------------
create table if not exists obras (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  descripcion text,
  tecnica text,               -- ej: "óleo sobre lino", "acrílico y pigmentos naturales"
  medidas text,                -- ej: "80 x 100 cm"
  anio integer,
  precio numeric(10, 2) not null default 0,
  disponible boolean not null default true,   -- false = vendido / no disponible
  destacada boolean not null default false,   -- para mostrar en portada
  imagen_url text,             -- URL pública en Supabase Storage
  categoria_id uuid references categorias(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_obras_disponible on obras(disponible);
create index if not exists idx_obras_destacada on obras(destacada);

-- ------------------------------------------------------------
-- Tabla: mensajes_contacto (formulario de contacto)
-- ------------------------------------------------------------
create table if not exists mensajes_contacto (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  email text not null,
  telefono text,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: pedidos (compras realizadas vía Stripe)
-- ------------------------------------------------------------
create table if not exists pedidos (
  id uuid primary key default uuid_generate_v4(),
  obra_id uuid references obras(id) on delete set null,
  stripe_session_id text unique,
  comprador_email text,
  comprador_nombre text,
  direccion_envio jsonb,
  importe numeric(10, 2),
  estado text not null default 'pendiente', -- pendiente | pagado | cancelado
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------
alter table categorias enable row level security;
alter table obras enable row level security;
alter table mensajes_contacto enable row level security;
alter table pedidos enable row level security;

-- Lectura pública de categorías y obras disponibles (para la web pública)
create policy "categorias_lectura_publica" on categorias
  for select using (true);

create policy "obras_lectura_publica" on obras
  for select using (true);

-- Solo usuarios autenticados (el artista) pueden insertar/editar/borrar obras y categorías.
-- El panel admin usa la clave de servicio (service role) desde el servidor,
-- que se salta RLS, así que estas políticas son una capa extra de seguridad
-- por si en el futuro se usa el cliente autenticado directamente.
create policy "obras_escritura_autenticados" on obras
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "categorias_escritura_autenticados" on categorias
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Cualquiera puede enviar un mensaje de contacto, pero solo el artista
-- autenticado puede leerlos (esto se gestiona vía service role en el servidor).
create policy "mensajes_insertar_publico" on mensajes_contacto
  for insert with check (true);

create policy "mensajes_lectura_autenticados" on mensajes_contacto
  for select using (auth.role() = 'authenticated');

-- Los pedidos solo se crean/leen desde el servidor (service role), no hace
-- falta política pública.
create policy "pedidos_lectura_autenticados" on pedidos
  for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- Datos de ejemplo (opcional, bórralo cuando subas obras reales)
-- ------------------------------------------------------------
insert into categorias (nombre, descripcion) values
  ('Pigmentos naturales', 'Obras realizadas con tierras, óxidos y pigmentos de origen vegetal.'),
  ('Técnica mixta orgánica', 'Combinación de materiales naturales: arena, fibras, resinas vegetales.')
on conflict (nombre) do nothing;
