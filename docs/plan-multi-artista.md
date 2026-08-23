# Plan: convertir ArteCelada en plataforma multi-artista

> Documento de referencia para cuando se retome este trabajo (probablemente
> la semana del 2026-08-24 en adelante, según lo hablado). Escrito para que
> una sesión de Claude nueva, sin memoria de la conversación en que se
> decidió esto, pueda construirlo sin tener que redescubrir las decisiones.
> Si algo de lo que describe este documento ya no coincide con el código
> real al leerlo, el código manda — verificar antes de asumir que sigue así.

## Contexto y decisión

Hoy ArteCelada es la web de un solo artista (Ángel Celada). La idea es
añadir una capa por encima donde cualquier artista pueda registrarse,
publicar su propio catálogo y tener su propio "mini-espacio" (obras,
colecciones, "Tu espacio" con AR, "Sobre mí"...) — básicamente lo que ya
existe para Ángel, pero repetido por artista, más una experiencia de
descubrimiento global (explorar artistas, tipos de arte) por encima.

Decisiones ya tomadas con el usuario (no volver a preguntar esto):

- **Rutas, no subdominios ni dominios propios por artista** — al menos
  para el lanzamiento. `tuweb.com/artistas/<slug>/...`. Subdominios o
  dominio propio por artista quedan como mejora futura opcional, no
  bloquean nada de lo que hay que construir ahora.
- **Prototipar en un proyecto de Vercel y Supabase aparte** mientras se
  construye, no directamente sobre la producción de Ángel. Decidir más
  adelante si se fusiona (Ángel pasa a ser "artista #1" del sistema
  nuevo) o se quedan separados.
- **Personalización del admin por temas cerrados, no color libre** — cada
  artista elige un tema visual predefinido (fondo animado + cabeceras +
  color de botón, todo coherente), no un selector de color libre pieza a
  pieza.
- Esto es una **evolución del código actual, no una reescritura**. El
  mosaico, los favoritos, el pipeline de AR, los fondos animados... todo
  eso se reutiliza casi tal cual, solo cambia a estar filtrado por
  `artista_id` en vez de ser global.

## 1. Modelo de datos

Nueva tabla `artistas`:

```sql
create table artistas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  slug text not null unique,           -- "angel-celada", para la URL
  nombre text not null,
  bio text,
  tema text not null default 'arcilla', -- ver sección 4
  logo_url text,
  activo boolean not null default true, -- aprobado/visible en el directorio
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Añadir `artista_id uuid references artistas(id)` (not null tras la
migración de datos) a: `obras`, `categorias`, `entornos`,
`obra_detalles`, `contenido_sobre_mi`. Índice en cada `artista_id`.

Migración de los datos existentes de Ángel: crear su fila en `artistas`
primero (con su `user_id` de Supabase Auth ya existente), luego rellenar
`artista_id` en todas las tablas de arriba con ese id.

RLS: cada política de escritura pasa de "cualquier usuario autenticado"
(como está ahora, ver `supabase/schema.sql`) a "el usuario autenticado
solo puede escribir filas cuyo `artista_id` coincide con su propia fila
en `artistas`" — patrón estándar:

```sql
using ( artista_id in (select id from artistas where user_id = auth.uid()) )
```

## 2. Autenticación y admin

Hoy: un solo email autorizado por variable de entorno
(`ADMIN_ALLOWED_EMAILS`, ver `src/lib/admin.ts` y
`src/app/admin/(protected)/layout.tsx`). Eso deja de valer.

Nuevo: cualquier usuario de Supabase Auth con una fila en `artistas`
puede entrar a su propio panel. Flujo de alta: registro (email o
magic-link, ya hay precedente de auth por email/password en
`src/app/admin/login/page.tsx`) → crear fila en `artistas` con `activo =
false` → aprobación manual (o automática, a decidir) antes de aparecer en
el directorio público.

El panel admin actual (`src/app/admin/(protected)/*`) se reutiliza casi
entero — solo hay que asegurarse de que cada query de obras/categorías/
etc. se filtra por el `artista_id` del usuario logueado, nunca por todas
las obras de todos los artistas.

## 3. Rutas

Reestructurar `src/app/(site)/*` para anidar bajo el artista. Patrón:

- Hoy: `src/app/(site)/obras/page.tsx` → sirve `/obras` (solo Ángel)
- Después: `src/app/(site)/artistas/[slug]/obras/page.tsx` → sirve
  `/artistas/angel-celada/obras`

Mover así: `obras`, `obras/[id]`, `laminas`, `mi-espacio`, `sobre-mi`,
`contacto` (¿contacto es por artista o global? decidir — probablemente
por artista, cada uno con su propio formulario). Cada page.tsx server
component añade `.eq("artista_id", artista.id)` a sus queries de
Supabase, resolviendo primero `artista` a partir del `slug` de la URL
(`params.slug`).

Rutas nuevas, globales (no dentro de `[slug]`):
- `/` — inicio nuevo: artistas destacados, explorar por tipo de arte,
  buscador. Sustituye al inicio actual centrado en Ángel.
- `/artistas` — directorio, todos los artistas activos.
- `/artistas/[slug]` — perfil público del artista (lo que hoy sería
  "Sobre mí" + acceso a sus obras/colecciones).

Todo el código de componentes (`ObraCard`, `MosaicoObras`,
`FiltrosObras`, `CabeceraPagina`, `FondoCabecera`, el pipeline de AR
completo en `src/lib/ar/`...) no necesita cambios de fondo — reciben las
obras ya filtradas por artista desde el server component, igual que
ahora reciben "todas las obras de Ángel".

## 4. Personalización visual por artista (temas cerrados)

En vez de que cada artista elija colores sueltos, un catálogo fijo de
temas (4-5 para empezar), cada uno agrupando:
- las 2 capas de color del fondo animado ambiental (mismo sistema que
  `src/components/FondoOndas.tsx` / `FondoParallax.tsx`, pero
  parametrizado por tema en vez de fijo)
- el color de las cabeceras de sección (mismo sistema que
  `src/components/FondoCabecera.tsx`, ya parametrizado por "sección" —
  aquí pasaría a parametrizarse por "tema" en vez de por sección fija)
- el color del botón principal (hoy fijo en `terracota`, en
  `tailwind.config.ts` / `globals.css` `.btn-primary`)

Los SVG de las capas de cada tema se generan una vez (mismo generador
usado para las cabeceras de sección, ver el historial de commits sobre
`capa-cabecera-*.svg` para la técnica exacta: bordes ondulados por
bezier, `preserveAspectRatio="none"` obligatorio si se usan como fondo
CSS — ver la nota de ese bug en el commit correspondiente) y se
guardan en `public/img/`, uno por tema, no generados en caliente.

La tabla `artistas` guarda solo el nombre del tema elegido (columna
`tema`); el resto es código + assets ya preparados de antemano.

"Sobre mí" ya tiene su propia tabla (`contenido_sobre_mi`) — solo hace
falta añadirle `artista_id` como el resto.

## 5. Pagos (Stripe Connect) — pendiente de decisión, no trivial

Hoy todo el dinero de una venta va a la cuenta de Stripe de Ángel
(`src/app/api/checkout/route.ts`, `src/app/api/webhook/stripe/route.ts`,
`BuyButton.tsx`). Con varios artistas vendiendo, hace falta repartir el
dinero — eso es **Stripe Connect** (producto aparte de Stripe, no una
opción de configuración): cada artista conecta su propia cuenta de
Stripe (onboarding de Connect), y la plataforma puede quedarse una
comisión automáticamente en cada cobro.

Esto es un cambio real en el flujo de checkout, no un ajuste menor —
dejarlo para una fase aparte, después de que el resto (catálogo,
navegación, temas) ya funcione con artistas de prueba sin venta real.

## 6. Orden de construcción sugerido

1. Modelo de datos (tabla `artistas`, columnas `artista_id`, RLS) sobre
   el proyecto de Supabase de pruebas.
2. Reestructurar rutas bajo `/artistas/[slug]/...`, migrando a Ángel
   como primer artista de prueba — comprobar que toda la web actual
   sigue funcionando igual, solo que ahora colgada de una ruta con slug.
3. Registro + alta de artista + panel admin filtrado por `artista_id`.
4. Directorio (`/artistas`) y perfil público (`/artistas/[slug]`).
5. Inicio nuevo (descubrimiento global).
6. Temas visuales cerrados (mínimo 2-3 para probar el sistema, ampliar
   después).
7. Stripe Connect — última fase, cuando el resto ya esté validado.

## Notas para quien construya esto

- Todo el pipeline de AR (`src/lib/ar/generarModelos.ts`,
  `generarYSubirVistaAr.ts`, `GenerarVistaArButton.tsx`,
  `GenerarTodasVistaArButton.tsx`) no necesita cambios de lógica, solo
  que las obras que recibe ya vengan filtradas por artista.
- Antes de tocar nada, revisar si en el ínterin se ha hecho ya algo de
  esto — este documento describe una intención, no necesariamente el
  estado actual del código en el momento de leerlo.
- El bucket de Supabase Storage (`obras`) es único y compartido — no
  hace falta un bucket por artista, basta con que las rutas de fichero
  sigan siendo únicas (ya lo son, por timestamp).
