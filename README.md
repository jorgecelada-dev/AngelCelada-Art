# Arte Orgánico — Web del artista

Web completa para un artista de arte orgánico: página pública (colección,
historia, técnicas, contacto, compra online) + panel privado para que el
artista suba y gestione sus obras.

**Stack:** Next.js 14 (App Router + TypeScript) · Tailwind CSS · Supabase
(base de datos, autenticación y almacenamiento de imágenes) · Stripe
(pagos, con soporte de tarjeta y Bizum en España).

> Este proyecto se generó en un sandbox en la nube sin acceso a npm, así
> que **nunca se ha ejecutado `npm install`, `next dev` ni `next build`
> aquí**. El código sigue las convenciones oficiales de Next.js/Supabase/
> Stripe, pero la primera vez que lo instales en tu ordenador revisa la
> consola por si aparece algún error menor de dependencias.

## 1. Requisitos

- Node.js 18.18 o superior (recomendado 20+)
- Una cuenta gratuita en [supabase.com](https://supabase.com)
- Una cuenta gratuita en [stripe.com](https://stripe.com) (modo test para empezar)

## 2. Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3000

## 3. Configurar Supabase

1. Crea un proyecto nuevo en supabase.com.
2. Ve a **SQL Editor** → pega y ejecuta el contenido de `supabase/schema.sql`.
3. Ve a **Storage** → crea un bucket llamado `obras`, márcalo como **público**.
4. Vuelve a **SQL Editor** y ejecuta `supabase/storage.sql` (políticas de acceso a las imágenes).
5. Ve a **Authentication → Users → Add user** y crea **un único usuario**
   con el email y contraseña que usará el artista para entrar en `/admin`.
   No hay registro público: solo se puede entrar con una cuenta creada
   manualmente aquí, así el panel queda privado.
6. Ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (¡mantenla secreta, solo se usa en el servidor!)

Pégalos en tu `.env.local`.

## 4. Configurar Stripe

1. En el [Dashboard de Stripe](https://dashboard.stripe.com), activa el **modo test** (interruptor arriba a la derecha).
2. Ve a **Developers → API keys** y copia la clave secreta (`sk_test_...`) y la publicable (`pk_test_...`) a tu `.env.local`.
3. (Opcional, para cobrar en producción) En **Settings → Payment methods**, activa **Bizum** además de tarjeta, si tu cuenta de Stripe España lo permite.
4. Para probar el webhook en local, instala la [Stripe CLI](https://stripe.com/docs/stripe-cli) y ejecuta:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```
   Copia el `whsec_...` que te da y pégalo en `STRIPE_WEBHOOK_SECRET`.
5. En producción, crea el webhook desde **Developers → Webhooks** apuntando a `https://tu-dominio.com/api/webhook/stripe`, evento `checkout.session.completed`.

## 5. Estructura del proyecto

```
src/app/
  page.tsx                  → Home
  obras/                    → Galería/tienda + ficha de cada obra (con botón de compra)
  sobre-mi/                 → Historia, background y técnicas del artista
  contacto/                 → Formulario de contacto (guarda en Supabase)
  admin/
    login/                  → Login privado (Supabase Auth)
    (protected)/            → Panel: listado, añadir, editar y borrar obras + ver mensajes
  api/
    contacto/               → Guarda mensajes del formulario
    checkout/               → Crea la sesión de pago de Stripe
    webhook/stripe/         → Marca el pedido como pagado y la obra como vendida
supabase/
  schema.sql                → Tablas + seguridad (RLS)
  storage.sql                → Políticas del bucket de imágenes
```

## 6. Antes de publicar: personaliza el contenido

- `src/components/Navbar.tsx` y `src/components/Footer.tsx`: cambia "Nombre del Artista" por el nombre real.
- `src/app/layout.tsx`: título y descripción SEO.
- `src/app/sobre-mi/page.tsx`: sustituye los textos de ejemplo por la historia, background y técnicas reales.
- Sube las obras reales desde `/admin` (no lo hagas editando la base de datos a mano, usa el panel).

## 7. Subir a git / GitHub (repo nuevo e independiente)

Este proyecto ya tiene su propio repositorio git local, separado de
cualquier otro proyecto tuyo — no hay conflicto posible porque cada
proyecto vive en su propia carpeta con su propio `.git`. Para subirlo a
GitHub:

```bash
gh repo create arte-organico --private --source=. --remote=origin
git push -u origin main
```

(o crea el repo manualmente en github.com y luego `git remote add origin <url>` + `git push -u origin main`)

## 8. Desplegar (Vercel, recomendado)

1. Entra en [vercel.com](https://vercel.com) → **New Project** → importa el repo de GitHub.
2. En **Environment Variables**, añade las mismas variables que tienes en `.env.local` (con las claves de Stripe en modo **live** cuando quieras cobrar de verdad).
3. Cambia `NEXT_PUBLIC_SITE_URL` por tu dominio real de producción.
4. Despliega. Vercel instalará dependencias y construirá el proyecto en sus servidores (allí sí hay acceso completo a npm).

## 9. Próximos pasos sugeridos

- Dominio propio conectado en Vercel.
- Mover los textos de "Sobre mí" a una tabla de Supabase editable desde `/admin`, si quieres poder cambiarlos sin tocar código.
- Emails automáticos de confirmación de compra (Resend, Postmark…).
- Analítica (Plausible, Vercel Analytics).
