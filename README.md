# Atix SmartMail IA — Email-to-Kanban

Sistema inteligente que procesa emails con IA, detecta tareas automáticamente y las organiza en un tablero Kanban visual.

## 🚀 Características

- ✅ **Autenticación Google OAuth** (NextAuth.js v5)
- ✅ **Importación de Emails** desde JSON con validación
- ✅ **Dashboard Interactivo** con estadísticas en tiempo real
- ✅ **Vista de Emails** con búsqueda, filtros y ordenamiento
- ✅ **Tablero Kanban** con drag & drop para organizar tareas
- ✅ **Base de Datos PostgreSQL** (Neon) con Prisma ORM
- ⏳ **Procesamiento IA** (próximamente)

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (Pages Router + Turbopack)
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **Autenticación**: NextAuth.js v5 (Auth.js)
- **Base de Datos**: PostgreSQL (Neon) + Prisma ORM
- **Estado**: TanStack Query (React Query)
- **Validación**: Zod
- **Drag & Drop**: API nativa HTML5

## ⚙️ Configuración Rápida

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

La base de datos ya está configurada. Solo necesitas:

**a) Configurar Google OAuth** (ver `CHECKLIST.md` o `SETUP_OAUTH.md`)

**b) Editar `.env`** con tus credenciales de Google:

```env
# Ya configurado ✅
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# Configura estos ⏳
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
```

### 3. Iniciar el proyecto

```bash
npm run dev
```

Abre http://localhost:3000

## 📚 Documentación

- **`CHECKLIST.md`** - Guía rápida de configuración OAuth (⏱️ 5 min)
- **`SETUP_OAUTH.md`** - Tutorial completo paso a paso
- **`DATABASE_SETUP.md`** - Configuración de base de datos
- **`OAUTH_COMPLETADO.md`** - Estado actual del proyecto

## 🗂️ Estructura del Proyecto

```
├── pages/
│   ├── api/
│   │   ├── auth/[...nextauth].ts  # NextAuth handler
│   │   └── emails/                # APIs protegidas
│   ├── dashboard/                 # Rutas protegidas
│   ├── login.tsx                  # Página de login
│   └── index.tsx                  # Landing page
├── src/
│   ├── components/                # Componentes React
│   ├── pages/                     # Páginas principales
│   └── lib/                       # Utilidades y config
├── prisma/
│   └── schema.prisma              # Modelos de base de datos
└── middleware.ts                  # Protección de rutas
```

## 🔐 Seguridad

- Autenticación OAuth 2.0 con Google
- Sesiones almacenadas en base de datos
- Middleware de protección de rutas
- APIs validadas con sesión de usuario
- Validación de datos con Zod

## 📊 Modelos de Base de Datos

- **User** - Usuarios autenticados
- **Account** - Cuentas OAuth
- **Session** - Sesiones activas
- **Email** - Emails importados por usuario

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
