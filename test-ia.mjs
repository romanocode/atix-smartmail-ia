// Test de integración IA
// Ejecutar con: node test-ia.mjs

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Eres un asistente de categorización de emails para ejecutivos comerciales.

Tu tarea es analizar emails y extraer:
1. **Categoría** (cliente/lead/interno/spam)
2. **Prioridad** (alta/media/baja)
3. **Si contiene tarea** (true/false)
4. **Descripción de la tarea** (si existe)

**FORMATO DE RESPUESTA (JSON):**
{
  "categoria": "cliente" | "lead" | "interno" | "spam",
  "prioridad": "alta" | "media" | "baja",
  "hasTask": boolean,
  "taskDescription": "string (opcional, solo si hasTask=true)"
}`;

async function testIA() {
  console.log("🧪 Probando conexión con OpenAI...\n");

  const testEmail = {
    email: "cliente@empresa.com",
    subject: "URGENTE: Necesito cotización para mañana",
    body: "Hola, mi jefe está molesto porque no hemos recibido la propuesta. Necesito que me envíes una cotización antes de mañana a las 10am. Es muy urgente.",
  };

  console.log("📧 Email de prueba:");
  console.log(`   Remitente: ${testEmail.email}`);
  console.log(`   Asunto: ${testEmail.subject}`);
  console.log(`   Cuerpo: ${testEmail.body}\n`);

  try {
    const start = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `**Remitente:** ${testEmail.email}
**Asunto:** ${testEmail.subject}
**Cuerpo:**
${testEmail.body}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const elapsed = Date.now() - start;
    const content = completion.choices[0]?.message?.content;
    const result = JSON.parse(content);

    console.log("✅ Respuesta de la IA:");
    console.log(`   Modelo: ${process.env.OPENAI_MODEL || "gpt-4o-mini"}`);
    console.log(`   Tiempo: ${elapsed}ms`);
    console.log(`   Categoría: ${result.categoria}`);
    console.log(`   Prioridad: ${result.prioridad}`);
    console.log(`   Tiene tarea: ${result.hasTask}`);
    if (result.taskDescription) {
      console.log(`   Descripción: ${result.taskDescription}`);
    }

    console.log("\n✅ ¡Integración con IA funcionando correctamente!");
    console.log("\n📊 Estadísticas:");
    console.log(`   Tokens entrada: ${completion.usage.prompt_tokens}`);
    console.log(`   Tokens salida: ${completion.usage.completion_tokens}`);
    console.log(`   Tokens totales: ${completion.usage.total_tokens}`);
    
    const costInput = (completion.usage.prompt_tokens / 1000000) * 0.15;
    const costOutput = (completion.usage.completion_tokens / 1000000) * 0.6;
    const totalCost = costInput + costOutput;
    console.log(`   Costo estimado: $${totalCost.toFixed(6)} USD`);

  } catch (error) {
    console.error("❌ Error al conectar con OpenAI:");
    console.error(error.message);
    
    if (error.code === "invalid_api_key") {
      console.log("\n💡 Solución: Verifica que OPENAI_API_KEY en .env sea correcta");
    } else if (error.code === "insufficient_quota") {
      console.log("\n💡 Solución: Agrega créditos en https://platform.openai.com/settings/organization/billing");
    }
    
    process.exit(1);
  }
}

testIA();
