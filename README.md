# Atix SmartMail IA — Next.js

Proyecto elaborado en Next.js 16 (Turbopack), Tailwind CSS, shadcn-ui y Prisma con base de datos Neon PostgreSQL.

## Resumen

- Dashboard con vistas de Emails y Kanban.
- Conexión a Neon PostgreSQL mediante Prisma.
- US-01: importar JSON de emails, validarlos y visualizarlos con búsqueda, orden y detalle.

## Tecnologías

- Next.js 16 / React 18
- Tailwind CSS 3 / shadcn-ui
- Prisma Client / Neon PostgreSQL
- TanStack Query
- Zod

## Configuración

1) Instalar dependencias

```bash
npm i
```

2) Variables de entorno

Crear `.env.local` con `DATABASE_URL` apuntando a Neon (no usar credenciales reales en commits públicos):

```env
DATABASE_URL=postgresql://<usuario>:<password>@<host>/<db>?sslmode=require&channel_binding=require
```

3) Prisma

```bash
npx prisma generate
npx prisma db push
```

El esquema está en `prisma/schema.prisma` e incluye `User` y `Email` con índices y `@@unique([externalId, userId])`.

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: compilar producción.
- `npm run start`: servidor en producción.
- `npm run lint`: ejecutar ESLint.

## Endpoints

- `POST /api/emails/import`
  - Body: array `{ id, email, received_at, subject, body }`.
  - Valida con Zod y guarda en Prisma.

- `GET /api/emails`
  - Query: `q` (búsqueda remitente/asunto), `sort=asc|desc`.

- `POST /api/emails/process`
  - Body: `{ ids: string[], processed: boolean }`.

## Interfaz

- `Dashboard` con sidebar y layout.
- `EmailsView`: importar JSON, buscar, ordenar, selección por checkboxes, acciones batch y por fila, modal de detalles con acción de procesado.

## Desarrollo rápido

```bash
npm i
echo "DATABASE_URL=postgresql://..." > .env.local
npx prisma generate && npx prisma db push
npm run dev
```

Abrir `http://localhost:3001/dashboard/emails`, importar un JSON y verificar listado y modal.

## Notas

- Proyecto limpio de artefactos de Vite y configurado para Next.js.
- Usar `.env.local` para credenciales locales y evitar exponer secretos.
