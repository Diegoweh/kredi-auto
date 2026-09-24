# Kredi Auto

Sitio de autos seminuevos. Next.js 16 (App Router, Cache Components) + Tailwind v4 + Appwrite.

## Primera configuración

1. Crea un proyecto en [Appwrite Cloud](https://cloud.appwrite.io).
2. En **Overview → API keys** crea una llave con los scopes `databases`, `tables`, `rows`, `buckets`, `files`, `users` y `sessions` (lectura y escritura).
3. Copia `.env.example` a `.env.local` y llena los valores (incluye `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
4. Crea la base de datos, tablas, buckets y el usuario administrador:

   ```bash
   npm run appwrite:setup
   ```

5. Importa los autos y fotos de `public/krediauto-carros-datos.csv` y `public/images/`:

   ```bash
   npm run seed -- --dry-run   # revisa los datos sin subir nada
   npm run seed
   ```

   Ambos scripts se pueden volver a correr: lo que ya existe se omite.

6. `npm run dev` y entra a `/admin` para administrar.

## Deploy en Vercel

Agrega las mismas variables de `.env.local` en **Project → Settings → Environment Variables**
(`ADMIN_EMAIL` / `ADMIN_PASSWORD` no son necesarias en producción).

## Estructura

- `app/(site)` — páginas públicas (inicio, autos, detalle, vende tu auto, contacto)
- `app/admin` — panel (login con Appwrite; solo usuarios con la etiqueta `admin`)
- `app/actions` — server actions (formularios, CRUD de autos, sesiones)
- `lib/cars.ts` — consultas a Appwrite; el inventario público se cachea con la etiqueta `cars`
- `scripts/` — configuración de Appwrite e importación del CSV
