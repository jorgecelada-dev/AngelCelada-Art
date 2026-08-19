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
  ancho_cm numeric(10, 2),
  alto_cm numeric(10, 2),
  anio integer,
  fecha_creacion date,
  precio numeric(10, 2) not null default 0,
  estado text not null default 'en venta', -- en venta | no se vende | vendido | oferta
  disponible boolean not null default true,   -- false = vendido / no disponible
  destacada boolean not null default false,   -- para mostrar en portada
  imagen_url text,             -- URL pública en Supabase Storage
  categoria_id uuid references categorias(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_obras_disponible on obras(disponible);
create index if not exists idx_obras_destacada on obras(destacada);

-- Migración para instalaciones existentes: si la tabla "obras" ya existía
-- de una versión anterior del esquema, el CREATE TABLE IF NOT EXISTS de
-- arriba no le añade las columnas nuevas por sí solo.
alter table obras add column if not exists estado text not null default 'en venta';
alter table obras add column if not exists ancho_cm numeric(10, 2);
alter table obras add column if not exists alto_cm numeric(10, 2);
alter table obras add column if not exists fecha_creacion date;
-- Dimensiones reales en píxeles del archivo de imagen subido, para poder
-- mostrarlo a ancho completo sin recortar ni deformar, adaptando el alto
-- según sea una obra vertical u horizontal.
alter table obras add column if not exists imagen_ancho_px integer;
alter table obras add column if not exists imagen_alto_px integer;
-- Orientación real del cuadro, para forzarla a mano cuando la foto no la
-- refleje bien (si no se indica, se deduce de imagen_ancho_px/alto_px).
alter table obras add column if not exists orientacion text check (orientacion in ('horizontal', 'vertical'));
-- Porcentaje de descuento cuando estado = 'oferta' (solo estos valores).
alter table obras add column if not exists descuento_porcentaje integer check (descuento_porcentaje in (5, 10, 15, 20, 30));
-- Precio de la lámina (copia impresa) de la obra. Si es NULL, no se vende
-- lámina de esa obra. Sigue disponible aunque el original ya esté vendido.
alter table obras add column if not exists lamina_precio numeric(10, 2);
-- IDs de "entornos" que NO deben mostrarse para esta obra en "Visualiza
-- esta obra en tu espacio" (por defecto, vacío = se ven todos).
alter table obras add column if not exists entornos_ocultos uuid[] not null default '{}';
-- Color predominante de la obra, para el filtro de búsqueda en /obras.
alter table obras add column if not exists color_principal text;

-- ------------------------------------------------------------
-- Tabla: obra_detalles (fotos de detalle/proceso de cada obra,
-- mostradas en la ficha pública bajo "Detalles de la obra")
-- ------------------------------------------------------------
create table if not exists obra_detalles (
  id uuid primary key default uuid_generate_v4(),
  obra_id uuid not null references obras(id) on delete cascade,
  imagen_url text not null,
  orden integer not null default 0,
  tamano text not null default '1x1' check (tamano in ('1x1', '1x2')),
  created_at timestamptz not null default now()
);

create index if not exists idx_obra_detalles_obra_id on obra_detalles(obra_id);
create index if not exists idx_obra_detalles_orden on obra_detalles(orden);

-- ------------------------------------------------------------
-- Tabla: entornos (fondos para previsualizar la obra en espacios)
-- ------------------------------------------------------------
create table if not exists entornos (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('salon', 'comedor', 'oficina', 'despacho')),
  imagen_url text,
  pared_x numeric(5, 2) not null default 20,
  pared_y numeric(5, 2) not null default 20,
  pared_ancho numeric(5, 2) not null default 60,
  pared_alto numeric(5, 2) not null default 60,
  escala_cm_por_px numeric(10, 4) not null default 0.1,
  overlay_luz_url text,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_entornos_tipo on entornos(tipo);
create index if not exists idx_entornos_orden on entornos(orden);

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

-- Distingue un mensaje normal de una solicitud de presupuesto (cuadro
-- personalizado o pack de varias obras).
alter table mensajes_contacto add column if not exists tipo text not null default 'general' check (tipo in ('general', 'presupuesto'));
alter table mensajes_contacto add column if not exists encargo_tipo text check (encargo_tipo in ('personalizado', 'pack'));

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

-- Tipo de pedido: original (el cuadro) o lámina (copia impresa). Solo un
-- pedido de tipo "original" marca la obra como vendida al pagarse.
alter table pedidos add column if not exists tipo text not null default 'original' check (tipo in ('original', 'lamina'));

-- ------------------------------------------------------------
-- Tabla: contenido_sobre_mi (textos editables de la página "Sobre mí",
-- fila única de contenido con id fijo para poder hacer upsert siempre)
-- ------------------------------------------------------------
create table if not exists contenido_sobre_mi (
  id uuid primary key default '00000000-0000-0000-0000-000000000001',
  historia text,
  background text,
  tecnicas text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------
alter table categorias enable row level security;
alter table obras enable row level security;
alter table obra_detalles enable row level security;
alter table entornos enable row level security;
alter table mensajes_contacto enable row level security;
alter table pedidos enable row level security;
alter table contenido_sobre_mi enable row level security;

-- Lectura pública de categorías y obras disponibles (para la web pública)
drop policy if exists "categorias_lectura_publica" on categorias;
create policy "categorias_lectura_publica" on categorias
  for select using (true);

drop policy if exists "obras_lectura_publica" on obras;
create policy "obras_lectura_publica" on obras
  for select using (true);

drop policy if exists "entornos_lectura_publica" on entornos;
create policy "entornos_lectura_publica" on entornos
  for select using (true);

drop policy if exists "obra_detalles_lectura_publica" on obra_detalles;
create policy "obra_detalles_lectura_publica" on obra_detalles
  for select using (true);

-- Solo usuarios autenticados (el artista) pueden insertar/editar/borrar obras, categorías y entornos.
-- El panel admin usa la clave de servicio (service role) desde el servidor,
-- que se salta RLS, así que estas políticas son una capa extra de seguridad
-- por si en el futuro se usa el cliente autenticado directamente.
drop policy if exists "obras_escritura_autenticados" on obras;
create policy "obras_escritura_autenticados" on obras
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "categorias_escritura_autenticados" on categorias;
create policy "categorias_escritura_autenticados" on categorias
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "entornos_escritura_autenticados" on entornos;
create policy "entornos_escritura_autenticados" on entornos
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "obra_detalles_escritura_autenticados" on obra_detalles;
create policy "obra_detalles_escritura_autenticados" on obra_detalles
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Cualquiera puede enviar un mensaje de contacto, pero solo el artista
-- autenticado puede leerlos (esto se gestiona vía service role en el servidor).
drop policy if exists "mensajes_insertar_publico" on mensajes_contacto;
create policy "mensajes_insertar_publico" on mensajes_contacto
  for insert with check (true);

drop policy if exists "mensajes_lectura_autenticados" on mensajes_contacto;
create policy "mensajes_lectura_autenticados" on mensajes_contacto
  for select using (auth.role() = 'authenticated');

-- Los pedidos solo se crean/leen desde el servidor (service role), no hace
-- falta política pública.
drop policy if exists "pedidos_lectura_autenticados" on pedidos;
create policy "pedidos_lectura_autenticados" on pedidos
  for select using (auth.role() = 'authenticated');

-- El texto de "Sobre mí" lo lee cualquiera (página pública) pero solo el
-- artista autenticado puede editarlo.
drop policy if exists "sobre_mi_lectura_publica" on contenido_sobre_mi;
create policy "sobre_mi_lectura_publica" on contenido_sobre_mi
  for select using (true);

drop policy if exists "sobre_mi_escritura_autenticados" on contenido_sobre_mi;
create policy "sobre_mi_escritura_autenticados" on contenido_sobre_mi
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- Datos de ejemplo (opcional, bórralo cuando subas obras reales)
-- ------------------------------------------------------------
insert into categorias (nombre, descripcion) values
  ('Pigmentos naturales', 'Obras realizadas con tierras, óxidos y pigmentos de origen vegetal.'),
  ('Técnica mixta orgánica', 'Combinación de materiales naturales: arena, fibras, resinas vegetales.')
on conflict (nombre) do nothing;
