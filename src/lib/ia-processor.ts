import OpenAI from "openai";
import { z } from "zod";

// Esquema de respuesta esperada de la IA
const IAResponseSchema = z.object({
  categoria: z.enum(["cliente", "lead", "interno", "spam"]),
  prioridad: z.enum(["alta", "media", "baja"]),
  hasTask: z.boolean(),
  taskDescription: z.string().optional(),
});

export type IAResponse = z.infer<typeof IAResponseSchema>;

// Cliente OpenAI (compatible con cualquier API compatible con OpenAI)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // Opcional: para usar Groq, Together, etc.
});

/**
 * Procesa un email con IA para extraer metadata y detectar tareas
 * @param email Dirección del remitente
 * @param subject Asunto del email
 * @param body Cuerpo del mensaje
 * @returns Categoría, prioridad, si tiene tarea y descripción de la tarea
 */
export async function processEmailWithIA(
  email: string,
  subject: string,
  body: string
): Promise<IAResponse> {
  const prompt = buildPrompt(email, subject, body);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No se recibió respuesta de la IA");
    }

    const parsed = JSON.parse(content);
    const validated = IAResponseSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error("Error procesando email con IA:", error);
    
    // Fallback: categorización básica en caso de error
    return {
      categoria: "spam",
      prioridad: "baja",
      hasTask: false,
      taskDescription: undefined,
    };
  }
}

/**
 * Procesa múltiples emails en batch
 * @param emails Array de emails a procesar
 * @returns Array con las respuestas de la IA
 */
export async function processEmailsBatch(
  emails: Array<{ id: string; email: string; subject: string; body: string }>
): Promise<Array<{ id: string; result: IAResponse }>> {
  const results = await Promise.allSettled(
    emails.map(async (email) => ({
      id: email.id,
      result: await processEmailWithIA(email.email, email.subject, email.body),
    }))
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<{ id: string; result: IAResponse }>).value);
}

// ============================================================================
// PROMPTS
// ============================================================================

const SYSTEM_PROMPT = `Eres un asistente de categorización de emails para ejecutivos comerciales.

Tu tarea es analizar emails y extraer:
1. **Categoría** (cliente/lead/interno/spam)
2. **Prioridad** (alta/media/baja)
3. **Si contiene tarea** (true/false)
4. **Descripción de la tarea** (si existe)

**CATEGORÍAS:**
- **cliente**: Email de cliente existente con solicitud, consulta, problema o seguimiento
- **lead**: Email de prospecto nuevo interesado en servicios/productos
- **interno**: Comunicación del equipo, notificaciones internas, recordatorios administrativos
- **spam**: Marketing no solicitado, phishing, contenido irrelevante

**PRIORIDAD:**
- **alta**: Urgente, cliente molesto, oportunidad limitada, problema crítico
- **media**: Importante pero no urgente, seguimiento necesario
- **baja**: Informativo, sin urgencia, puede esperar

**DETECCIÓN DE TAREAS:**
Una tarea es una acción concreta que el destinatario debe realizar:
- Enviar propuesta/cotización
- Agendar reunión
- Responder consulta específica
- Revisar documento
- Hacer seguimiento

NO son tareas:
- Emails informativos
- Spam/marketing
- Confirmaciones automáticas

**FORMATO DE RESPUESTA (JSON):**
{
  "categoria": "cliente" | "lead" | "interno" | "spam",
  "prioridad": "alta" | "media" | "baja",
  "hasTask": boolean,
  "taskDescription": "string (opcional, solo si hasTask=true)"
}

**EJEMPLOS:**

Email: "Hola, soy de XYZ Corp. Me interesa cotizar sus servicios de consultoría"
→ { "categoria": "lead", "prioridad": "alta", "hasTask": true, "taskDescription": "Enviar cotización de servicios de consultoría a XYZ Corp" }

Email: "Necesito urgente la propuesta para mañana, mi jefe está molesto"
→ { "categoria": "cliente", "prioridad": "alta", "hasTask": true, "taskDescription": "Enviar propuesta urgente antes de mañana" }

Email: "Recordatorio: reunión de equipo viernes 3pm"
→ { "categoria": "interno", "prioridad": "media", "hasTask": false }

Email: "¡Compra ahora con 50% de descuento!"
→ { "categoria": "spam", "prioridad": "baja", "hasTask": false }

Analiza el siguiente email y responde SOLO con el JSON.`;

function buildPrompt(email: string, subject: string, body: string): string {
  return `**Remitente:** ${email}
**Asunto:** ${subject}
**Cuerpo:**
${body.substring(0, 2000)}`;
}
