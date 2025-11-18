# 🚀 Quick Start - Atix SmartMail IA

## ⚡ Configuración Rápida (5 minutos)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Base de Datos
Ya está configurada en tu `.env` (Neon PostgreSQL).
Sincroniza el schema:
```bash
npx prisma db push
```

### 3. Configurar IA (OBLIGATORIO)

Agrega esto a tu `.env`:

#### Opción A: Groq (GRATIS - Recomendado para testing)
```bash
# 1. Ve a https://console.groq.com/keys
# 2. Crea una API key
# 3. Cópiala aquí:
OPENAI_API_KEY="gsk_tu-key-de-groq-aqui"
OPENAI_BASE_URL="https://api.groq.com/openai/v1"
OPENAI_MODEL="llama-3.3-70b-versatile"
```

#### Opción B: OpenAI (PAGO - Mejor para producción)
```bash
# 1. Ve a https://platform.openai.com/api-keys
# 2. Crea una API key
# 3. Agrega créditos ($5 mínimo)
# 4. Cópiala aquí:
OPENAI_API_KEY="sk-proj-tu-key-de-openai-aqui"
OPENAI_MODEL="gpt-4o-mini"
```

### 4. Iniciar Servidor
```bash
npm run dev
```

Abre http://localhost:3000

---

## 🎯 Prueba Rápida (2 minutos)

### 1. Login
- Click en "Continuar con Google"
- Autoriza la aplicación

### 2. Importar Emails de Prueba
- Ve a "Emails"
- Click en "Importar JSON"
- Selecciona: `public/assets/sample-emails.json`
- Confirma que se importaron 10 emails

### 3. Procesar con IA
- Selecciona todos los emails (checkbox arriba)
- Click en "Procesar con IA"
- Espera 5-10 segundos
- Verifica que aparezcan badges de categoría y prioridad

### 4. Ver Kanban
- Ve a "Tablero Kanban"
- Deberías ver tareas en "Por hacer"
- Arrastra una card a "En progreso"
- Confirma que se guardó el cambio

---

## 📝 Archivos Importantes

### Documentación
- `GUIA_IA.md` - Configuración detallada de IA
- `ESTADO_PROYECTO_FINAL.md` - Estado completo del proyecto
- `GUIA_PRUEBA_COMPLETA.md` - Testing exhaustivo

### Datos de Prueba
- `public/assets/sample-emails.json` - 10 emails de ejemplo

### Código Clave
- `src/lib/ia-processor.ts` - Cliente de IA + prompts
- `pages/api/emails/process.ts` - Endpoint de procesamiento
- `src/pages/EmailsView.tsx` - Vista principal
- `src/pages/KanbanView.tsx` - Tablero Kanban

---

## ❓ Troubleshooting

### "Error al procesar con IA"
✅ Verifica que `OPENAI_API_KEY` esté en `.env`
✅ Si usas Groq, verifica `OPENAI_BASE_URL`
✅ Reinicia el servidor: `Ctrl+C` y `npm run dev`

### El Kanban está vacío
✅ Primero procesa emails con IA
✅ Solo aparecen emails con tareas detectadas
✅ Verifica que `hasTask=true` en la base de datos

### No aparecen emails importados
✅ Verifica que iniciaste sesión con Google
✅ Cada usuario ve solo sus propios emails
✅ Revisa la consola del navegador (F12)

---

## 🎓 Recursos

### Obtener API Keys

**Groq (Gratis)**:
https://console.groq.com/keys

**OpenAI (Pago)**:
https://platform.openai.com/api-keys

### Proveedores Alternativos
- Together AI: https://api.together.xyz/
- OpenRouter: https://openrouter.ai/

---

## 🔥 Features Principales

✅ **Login con Google** - OAuth seguro con NextAuth
✅ **Importar JSON** - Validación con Zod
✅ **Procesamiento IA** - Categorización automática
✅ **Detección de Tareas** - Identificación inteligente
✅ **Kanban Board** - Drag & drop funcional
✅ **Multi-usuario** - Datos aislados por cuenta

---

## 📞 Siguiente Paso

1. ✅ Configura tu API key de IA en `.env`
2. ✅ Ejecuta `npm run dev`
3. ✅ Importa `sample-emails.json`
4. ✅ Procesa con IA
5. ✅ Prueba el Kanban

**¡Listo!** Tu sistema Email-to-Kanban está funcionando 🎉

Para más detalles, lee `GUIA_IA.md` y `ESTADO_PROYECTO_FINAL.md`.
