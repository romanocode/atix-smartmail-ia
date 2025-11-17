# 🚀 Setup de Google OAuth - Atix SmartMail IA

## 📋 Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL en ejecución
- Cuenta de Google para configurar OAuth

## 🔧 Configuración Paso a Paso

### 1. Configurar Base de Datos

```bash
# 1. Copia el archivo .env.example a .env
cp .env.example .env

# 2. Edita .env y configura tu DATABASE_URL
# Ejemplo: DATABASE_URL="postgresql://postgres:password@localhost:5432/atix_smartmail"

# 3. Ejecuta las migraciones de Prisma
npx prisma migrate dev

# 4. Genera el cliente de Prisma
npx prisma generate
```

### 2. Configurar Google OAuth

#### a) Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: "Atix SmartMail"

#### b) Habilitar APIs necesarias

1. En el menú lateral, ve a **APIs & Services > Library**
2. Busca y habilita: **Google+ API** (o Google People API)

#### c) Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services > Credentials**
2. Click en **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Si es necesario, configura la pantalla de consentimiento:
   - User Type: **External**
   - App name: **Atix SmartMail**
   - User support email: tu email
   - Developer contact: tu email
   - Click **Save and Continue**
4. En **Scopes**, click **Save and Continue** (usaremos scopes default)
5. En **Test users**, agrega tu email de prueba
6. Vuelve a **Credentials** y crea el OAuth client ID:
   - Application type: **Web application**
   - Name: **Atix SmartMail Web Client**
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
7. Click **CREATE**
8. Copia el **Client ID** y **Client Secret**

#### d) Configurar Variables de Entorno

Edita tu archivo `.env` y agrega las credenciales:

```env
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
```

### 3. Generar NEXTAUTH_SECRET

Ejecuta uno de estos comandos:

```bash
# Opción 1: Con OpenSSL
openssl rand -base64 32

# Opción 2: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado y pégalo en `.env`:

```env
NEXTAUTH_SECRET="el-secret-generado-aqui"
```

### 4. Instalar Dependencias y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### 5. Probar la Autenticación

1. Abre http://localhost:3000
2. Click en "Comenzar ahora" o ve a http://localhost:3000/login
3. Click en "Continuar con Google"
4. Selecciona tu cuenta de Google
5. Serás redirigido al dashboard autenticado

## 🔒 Seguridad

- **Nunca** subas el archivo `.env` a Git (ya está en `.gitignore`)
- En producción, usa variables de entorno del hosting (Vercel, Railway, etc.)
- Cambia `NEXTAUTH_URL` a tu dominio en producción

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

- Verifica que la URL en Google Console sea exactamente: `http://localhost:3000/api/auth/callback/google`
- No debe tener `/` al final
- Debe coincidir con tu `NEXTAUTH_URL`

### Error: "Access blocked: This app's request is invalid"

- Verifica que hayas configurado la pantalla de consentimiento OAuth
- Agrega tu email como usuario de prueba

### No puedo ver mis datos después de login

- Verifica que la migración de Prisma se haya ejecutado correctamente
- Revisa que el usuario se haya creado en la tabla `users`

## 📚 Documentación

- [Next.js](https://nextjs.org/docs)
- [NextAuth.js v5 (Auth.js)](https://authjs.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
