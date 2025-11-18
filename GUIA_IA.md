# Guía de Configuración de IA

## Resumen
El sistema utiliza cualquier LLM compatible con la API de OpenAI para clasificar emails automáticamente.

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```bash
# Opción 1: OpenAI (Recomendado para producción)
OPENAI_API_KEY="sk-proj-..."
# OPENAI_MODEL="gpt-4o-mini"  # Opcional, por defecto usa gpt-4o-mini

# Opción 2: Groq (GRATIS y RÁPIDO)
OPENAI_API_KEY="gsk_..."
OPENAI_BASE_URL="https://api.groq.com/openai/v1"
OPENAI_MODEL="llama-3.3-70b-versatile"

# Opción 3: Together AI
OPENAI_API_KEY="..."
OPENAI_BASE_URL="https://api.together.xyz/v1"
OPENAI_MODEL="meta-llama/Llama-3.3-70B-Instruct-Turbo"
```

---

## Opción 1: OpenAI (Recomendado)

### Ventajas
- ✅ Mejor calidad de categorización
- ✅ Muy confiable y rápido
- ✅ Excelente comprensión del español

### Desventajas
- ❌ De pago ($0.15 por cada 1M tokens con gpt-4o-mini)

### Configuración

1. **Crear cuenta en OpenAI**
   - Ve a https://platform.openai.com/signup
   - Verifica tu email

2. **Obtener API Key**
   - Ve a https://platform.openai.com/api-keys
   - Click en "Create new secret key"
   - Copia la key (empieza con `sk-proj-...`)

3. **Agregar créditos**
   - Ve a https://platform.openai.com/settings/organization/billing
   - Agrega mínimo $5 USD

4. **Configurar en .env**
   ```bash
   OPENAI_API_KEY="sk-proj-tu-key-aqui"
   OPENAI_MODEL="gpt-4o-mini"  # Más económico
   ```

### Costos Estimados
- **10 emails procesados**: ~$0.0001 USD (prácticamente gratis)
- **1000 emails/mes**: ~$0.01 USD
- **100,000 emails/mes**: ~$1 USD

---

## Opción 2: Groq (GRATIS y Rápido) ⭐ RECOMENDADO PARA TESTING

### Ventajas
- ✅ **100% GRATIS** (límite: 30 req/min, 14,400 req/día)
- ✅ Extremadamente rápido (tokens/segundo altísimos)
- ✅ Modelos potentes (Llama 3.3 70B)
- ✅ Sin tarjeta de crédito

### Desventajas
- ⚠️ Límites de rate (30 req/min)
- ⚠️ No ideal para producción a gran escala

### Configuración

1. **Crear cuenta en Groq**
   - Ve a https://console.groq.com/
   - Click en "Sign up" (puedes usar Google)

2. **Obtener API Key**
   - Ve a https://console.groq.com/keys
   - Click en "Create API Key"
   - Dale un nombre: "Atix SmartMail"
   - Copia la key (empieza con `gsk_...`)

3. **Configurar en .env**
   ```bash
   OPENAI_API_KEY="gsk_tu-key-aqui"
   OPENAI_BASE_URL="https://api.groq.com/openai/v1"
   OPENAI_MODEL="llama-3.3-70b-versatile"
   ```

### Modelos Disponibles en Groq
```bash
# Más rápido y preciso (recomendado)
OPENAI_MODEL="llama-3.3-70b-versatile"

# Alternativas
OPENAI_MODEL="mixtral-8x7b-32768"      # Bueno para español
OPENAI_MODEL="gemma2-9b-it"            # Más rápido pero menos preciso
```

---

## Opción 3: Together AI

### Ventajas
- ✅ $1 USD gratis de crédito inicial
- ✅ Muchos modelos open source
- ✅ Buen balance precio/calidad

### Configuración

1. **Crear cuenta**
   - Ve a https://api.together.xyz/
   - Sign up con email o Google

2. **Obtener API Key**
   - Ve a https://api.together.xyz/settings/api-keys
   - Click en "Create API key"
   - Copia la key

3. **Configurar en .env**
   ```bash
   OPENAI_API_KEY="tu-key-aqui"
   OPENAI_BASE_URL="https://api.together.xyz/v1"
   OPENAI_MODEL="meta-llama/Llama-3.3-70B-Instruct-Turbo"
   ```

---

## Cómo Usar el Sistema

### 1. Importar emails
- Ve a la vista "Emails"
- Click en "Importar JSON"
- Selecciona tu archivo con emails

### 2. Procesar con IA
- Selecciona los emails (checkboxes)
- Click en "Procesar con IA"
- Espera a que termine (10-15 segundos por cada 10 emails)

### 3. Ver resultados
- Los emails procesados mostrarán:
  - **Categoría**: Cliente / Lead / Interno / Spam
  - **Prioridad**: Alta / Media / Baja
  - **Tarea detectada**: Sí/No
  - **Descripción de tarea**: Qué hacer

### 4. Usar Kanban
- Ve a "Tablero Kanban"
- Solo aparecen emails con tareas detectadas
- Arrastra cards entre: Por hacer / En progreso / Completado

---

## Formato de Respuesta de la IA

El sistema envía cada email a la IA con este prompt:

```
Remitente: cliente@empresa.com
Asunto: Necesito cotización urgente
Cuerpo: Hola, necesito una propuesta para mañana...
```

La IA responde con JSON:

```json
{
  "categoria": "cliente",
  "prioridad": "alta",
  "hasTask": true,
  "taskDescription": "Enviar cotización urgente antes de mañana"
}
```

---

## Troubleshooting

### Error: "No se recibió respuesta de la IA"
- ✅ Verifica que `OPENAI_API_KEY` esté en `.env`
- ✅ Si usas Groq/Together, verifica `OPENAI_BASE_URL`
- ✅ Revisa que la API key sea válida

### Error: "Rate limit exceeded"
- ⚠️ Estás procesando demasiado rápido
- 💡 Solución: Procesa en lotes más pequeños (10-20 emails)
- 💡 Groq: Máximo 30 requests/minuto

### Error: "Insufficient quota"
- 💳 OpenAI: Agrega créditos en https://platform.openai.com/settings/organization/billing
- 💡 Alternativa: Usa Groq (gratis)

### La categorización no es precisa
- 🔧 Prueba con otro modelo:
  - OpenAI: `gpt-4o` (mejor pero más caro)
  - Groq: `llama-3.3-70b-versatile`
- 🔧 Los prompts están optimizados, pero puedes editarlos en `src/lib/ia-processor.ts`

---

## Próximos Pasos

### Implementado ✅
- [x] Procesamiento batch de emails
- [x] Detección automática de tareas
- [x] Categorización (cliente/lead/interno/spam)
- [x] Priorización (alta/media/baja)
- [x] Integración con Kanban

### Futuro 🚀
- [ ] Procesamiento automático al importar
- [ ] Resúmenes de emails largos
- [ ] Sugerencias de respuestas
- [ ] Detección de sentimiento (cliente molesto/feliz)

---

## Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador (F12)
2. Verifica el terminal del servidor Next.js
3. Confirma que todas las variables de entorno estén configuradas

**Recomendación**: Empieza con **Groq** (gratis) para testing, luego migra a **OpenAI** para producción.
