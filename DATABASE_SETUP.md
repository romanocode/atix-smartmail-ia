# 🗄️ Configuración de Base de Datos PostgreSQL

## Opción 1: PostgreSQL Local (Recomendado para desarrollo)

### Windows

#### Con Docker (Más fácil)
```powershell
# 1. Instalar Docker Desktop desde https://www.docker.com/products/docker-desktop

# 2. Ejecutar PostgreSQL en contenedor
docker run --name atix-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=atix_smartmail `
  -p 5432:5432 `
  -d postgres:16-alpine

# 3. Verificar que esté corriendo
docker ps

# 4. Tu DATABASE_URL será:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/atix_smartmail?schema=public"
```

#### Sin Docker (Instalación directa)
1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Instala siguiendo el wizard (anota usuario y contraseña)
3. Crea la base de datos:
```sql
CREATE DATABASE atix_smartmail;
```

### Después de configurar PostgreSQL

```powershell
# 1. Edita .env con tus credenciales reales
# DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/atix_smartmail?schema=public"

# 2. Sincroniza el schema
npx prisma db push

# 3. Genera el cliente Prisma
npx prisma generate

# 4. (Opcional) Abre Prisma Studio para ver los datos
npx prisma studio
```

## Opción 2: Base de Datos en la Nube (Gratis)

### Supabase (Recomendado - Incluye PostgreSQL gratis)

1. Ve a https://supabase.com
2. Crea una cuenta y nuevo proyecto
3. Anota la contraseña que configures
4. Ve a **Settings > Database**
5. Copia la **Connection String** en modo "URI"
6. Pégala en tu `.env`:

```env
DATABASE_URL="postgresql://postgres.[proyecto]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### Neon (Alternativa - PostgreSQL serverless)

1. Ve a https://neon.tech
2. Crea cuenta y proyecto
3. Copia el connection string
4. Pégalo en `.env`

### Railway (Alternativa)

1. Ve a https://railway.app
2. Crea proyecto > Add PostgreSQL
3. Copia el DATABASE_URL de las variables
4. Pégalo en `.env`

## Verificar Conexión

```powershell
# Prueba la conexión
npx prisma db push

# Si todo está bien, verás:
# ✔ Your database is now in sync with your Prisma schema.
```

## Comandos Útiles

```powershell
# Ver datos en interfaz visual
npx prisma studio

# Resetear base de datos (CUIDADO: borra todos los datos)
npx prisma db push --force-reset

# Ver logs de SQL ejecutado
npx prisma db push --preview-feature
```
