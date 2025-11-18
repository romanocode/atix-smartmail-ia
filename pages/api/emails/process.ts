import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";
import { processEmailsBatch } from "@/lib/ia-processor";

const BodySchema = z.object({
  ids: z.array(z.string()).min(1).max(50), // Límite de 50 emails por batch
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const { ids } = parsed.data;

    // 1. Obtener emails del usuario que no han sido procesados
    const emails = await prisma.email.findMany({
      where: {
        userId: user.id,
        id: { in: ids },
        processed: false, // Solo procesar emails no procesados
      },
      select: {
        id: true,
        sender: true,
        subject: true,
        body: true,
      },
    });

    if (emails.length === 0) {
      return res.status(400).json({ 
        error: "No se encontraron emails válidos para procesar",
        hint: "Los emails pueden estar ya procesados o no pertenecer a tu cuenta"
      });
    }

    // 2. Procesar con IA en batch
    const iaResults = await processEmailsBatch(
      emails.map((e) => ({
        id: e.id,
        email: e.sender,
        subject: e.subject,
        body: e.body,
      }))
    );

    // 3. Actualizar emails en base de datos
    const updates = await Promise.all(
      iaResults.map(({ id, result }) =>
        prisma.email.update({
          where: { id },
          data: {
            processed: true,
            category: result.categoria,
            priority: result.prioridad,
            hasTask: result.hasTask,
            taskDescription: result.taskDescription || null,
          },
        })
      )
    );

    return res.status(200).json({
      ok: true,
      processed: updates.length,
      total: ids.length,
      results: updates.map((email) => ({
        id: email.id,
        subject: email.subject,
        category: email.category,
        priority: email.priority,
        hasTask: email.hasTask,
        taskDescription: email.taskDescription,
      })),
    });
  } catch (err) {
    console.error("[API /emails/process] Error:", err);
    return res.status(500).json({ 
      error: "Error al procesar emails con IA", 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
}