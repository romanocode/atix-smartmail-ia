# Atix SmartMail IA — Email-to-Kanban

Sistema inteligente que procesa emails con IA, detecta tareas automáticamente y las organiza en un tablero Kanban visual.

## 🚀 Características

- ✅ **Autenticación Google OAuth** - Seguro y privado con NextAuth
- ✅ **Importación de Emails** - Desde JSON con validación Zod
- ✅ **Procesamiento con IA** - Categorización automática + detección de tareas
- ✅ **Dashboard Interactivo** - Estadísticas en tiempo real
- ✅ **Vista de Emails** - Búsqueda, filtros avanzados y ordenamiento
- ✅ **Tablero Kanban** - Drag & drop para gestionar tareas
- ✅ **Base de Datos PostgreSQL** - Neon cloud con Prisma ORM
- ✅ **Multi-usuario** - Datos completamente aislados por cuenta

## 🎯 MVP Completo (100%)

Este proyecto implementa completamente el Product Brief de Email-to-Kanban:

| User Story | Estado | Detalles |
|------------|--------|----------|
| **US-01** Importar y visualizar emails | ✅ 100% | Importación JSON, tabla, búsqueda, modal |
| **US-02** Procesar con IA | ✅ 100% | Categorización, prioridad, detección de tareas |
| **US-03** Kanban visual | ✅ 100% | Drag & drop, 3 columnas, filtrado automático |
| **US-04** Login seguro | ✅ 100% | Google OAuth, aislamiento de datos |

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (Pages Router + Turbopack)
- **UI**: React 18, Tailwind CSS, shadcn/ui (Radix)
- **Autenticación**: NextAuth.js v4 con Prisma Adapter
- **Base de Datos**: PostgreSQL (Neon) + Prisma ORM v6.19
- **IA**: OpenAI SDK (compatible con Groq, Together, OpenRouter)
- **Estado**: TanStack Query v5 (React Query)
- **Validación**: Zod v3.25
- **Notificaciones**: Sonner

## ⚡ Quick Start

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

**Copia `.env.example` a `.env` y configura**:

```env
# Ya configurado ✅
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# CONFIGURA ESTO (obligatorio para IA) ⚠️
OPENAI_API_KEY="tu-api-key-aqui"

# Opcional (para usar LLMs gratis como Groq)
# OPENAI_BASE_URL="https://api.groq.com/openai/v1"
# OPENAI_MODEL="llama-3.3-70b-versatile"
```

**👉 Ver `GUIA_IA.md` para obtener tu API key gratis**

### 3. Sincronizar base de datos

```bash
npx prisma db push
```

### 4. Iniciar el proyecto

```bash
npm run dev
```

Abre http://localhost:3000

## 📚 Documentación

### Guías de Inicio
- **`QUICK_START.md`** ⚡ - Configuración en 5 minutos
- **`GUIA_IA.md`** 🤖 - Configurar procesamiento con IA (Groq gratis o OpenAI)
- **`ESTADO_PROYECTO_FINAL.md`** 📊 - Estado completo del MVP

### Referencia Técnica
- **`GUIA_PRUEBA_COMPLETA.md`** - Testing exhaustivo del sistema
- **`ESTADO_SISTEMA.md`** - Resumen técnico y arquitectura
- **`.env.example`** - Variables de entorno documentadas

## 🎯 Flujo de Uso

1. **Login** con Google OAuth
2. **Importar** emails desde JSON (`public/assets/sample-emails.json`)
3. **Seleccionar** emails y **Procesar con IA**
4. Ver **categorización** automática (cliente/lead/interno/spam)
5. Ver **prioridad** detectada (alta/media/baja)
6. Ir a **Kanban** para gestionar tareas
7. **Drag & drop** para actualizar estado

## 🗂️ Estructura del Proyecto

```
├── pages/
│   ├── api/
│   │   ├── auth/[...nextauth].ts      # NextAuth handler
│   │   └── emails/
│   │       ├── import.ts              # Importar JSON
│   │       ├── process.ts             # Procesar con IA
│   │       ├── kanban.ts              # Actualizar estado Kanban
│   │       ├── stats.ts               # Estadísticas
│   │       ├── update.ts              # Actualizar email
│   │       └── index.ts               # Listar emails
│   ├── dashboard/                     # Rutas protegidas
│   │   ├── index.tsx                  # Dashboard home
│   │   ├── emails.tsx                 # Vista de emails
│   │   └── kanban.tsx                 # Tablero Kanban
│   ├── login.tsx                      # Página de login
│   └── index.tsx                      # Landing page
├── src/
│   ├── components/                    # Componentes React
│   │   ├── EmailDetailsDialog.tsx    # Modal de detalles
│   │   ├── Navbar.tsx                 # Barra superior
│   │   └── ui/                        # shadcn/ui components
│   ├── pages/                         # Páginas principales
│   │   ├── EmailsView.tsx             # Vista de emails
│   │   ├── KanbanView.tsx             # Tablero Kanban
│   │   ├── DashboardHome.tsx          # Dashboard home
│   │   └── DashboardLayout.tsx        # Layout wrapper
│   └── lib/                           # Utilidades y config
│       ├── ia-processor.ts            # Cliente IA + prompts
│       ├── auth.ts                    # Config NextAuth
│       ├── api-auth.ts                # Helpers autenticación
│       ├── prisma.ts                  # Cliente Prisma
│       └── utils.ts                   # Utilidades
├── prisma/
│   └── schema.prisma                  # Modelos de base de datos
├── public/
│   └── assets/
│       └── sample-emails.json         # Datos de prueba
└── middleware.ts                      # Protección de rutas
```

## 🔐 Seguridad

- ✅ Autenticación OAuth 2.0 con Google
- ✅ Sesiones persistentes en base de datos (30 días)
- ✅ Middleware de protección de rutas
- ✅ Validación de permisos en todos los endpoints
- ✅ Aislamiento total de datos por usuario (userId)
- ✅ Validación de entrada con Zod
- ✅ API keys de IA en variables de entorno

## 📊 Modelos de Base de Datos

### User
- Usuarios autenticados con Google OAuth
- Relaciones: emails, accounts, sessions

### Email
- Emails importados por usuario
- Campos: sender, subject, body, receivedAt
- IA: category, priority, hasTask, taskDescription
- Kanban: kanbanStatus, kanbanOrder
- Índices: userId+processed, userId+hasTask, userId+kanbanStatus

### Account & Session
- NextAuth adapter models
- Gestión de OAuth y sesiones

## 🔌 API Endpoints

### Autenticación
- `GET/POST /api/auth/*` - NextAuth endpoints

### Emails
- `GET /api/emails` - Listar emails del usuario
  - Query: `q` (búsqueda), `sort` (asc/desc), `limit`
  
- `POST /api/emails/import` - Importar desde JSON
  - Body: `[{ id, email, received_at, subject, body }]`
  
- `POST /api/emails/process` - Procesar con IA
  - Body: `{ ids: string[] }`
  - Retorna: categoría, prioridad, hasTask, taskDescription
  
- `POST /api/emails/update` - Actualizar email
  - Body: `{ id, hasTask?, category?, priority?, taskDescription?, kanbanStatus? }`
  
- `POST /api/emails/kanban` - Actualizar estado Kanban
  - Body: `{ status: "todo"|"in_progress"|"done", ids: string[] }`
  
- `GET /api/emails/stats` - Estadísticas
  - Retorna: total, sin procesar, tareas pendientes/completadas, por categoría/prioridad

## 🤖 Procesamiento con IA

### Categorías Detectadas
- **cliente** - Solicitud/consulta de cliente existente
- **lead** - Prospecto nuevo interesado
- **interno** - Comunicación del equipo
- **spam** - Sin valor comercial

### Prioridades Detectadas
- **alta** - Urgente, cliente molesto, oportunidad limitada
- **media** - Importante pero no urgente
- **baja** - Informativo, puede esperar

### Detección de Tareas
La IA identifica automáticamente:
- Enviar propuesta/cotización
- Agendar reunión
- Responder consulta
- Revisar documento
- Hacer seguimiento

### Proveedores Soportados
- **OpenAI** (gpt-4o-mini, gpt-4o)
- **Groq** (llama-3.3-70b, mixtral-8x7b) - GRATIS
- **Together AI** (Llama-3.3-70B)
- **OpenRouter** (múltiples modelos)

## 🧪 Testing

### Datos de Prueba
Incluye `public/assets/sample-emails.json` con 10 emails variados:
- 3 clientes
- 2 leads
- 2 internos
- 3 spam

### Flujo de Prueba Completo
Ver `GUIA_PRUEBA_COMPLETA.md` para testing exhaustivo.

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
