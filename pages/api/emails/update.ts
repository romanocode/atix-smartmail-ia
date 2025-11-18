import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";

const BodySchema = z.object({
  id: z.string().cuid(),
  hasTask: z.boolean().optional(),
  category: z.enum(["cliente", "lead", "interno", "spam"]).optional(),
  priority: z.enum(["alta", "media", "baja"]).optional(),
  taskDescription: z.string().max(1000).optional().nullable(),
  kanbanStatus: z.enum(["todo", "in_progress", "done"]).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const { id, hasTask, category, priority, taskDescription, kanbanStatus } = parsed.data;

    // Verificar que el email pertenece al usuario
    const existing = await prisma.email.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Email no encontrado" });
    }

    if (existing.userId !== user.id) {
      return res.status(403).json({ error: "No tienes permiso para editar este email" });
    }

    // Actualizar solo campos proporcionados
    const dataToUpdate: any = {};
    if (hasTask !== undefined) dataToUpdate.hasTask = hasTask;
    if (category !== undefined) dataToUpdate.category = category;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (taskDescription !== undefined) dataToUpdate.taskDescription = taskDescription;
    if (kanbanStatus !== undefined) dataToUpdate.kanbanStatus = kanbanStatus;

    const updated = await prisma.email.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.status(200).json({ ok: true, email: updated });
  } catch (err) {
    console.error("[API /emails/update] Error:", err);
    return res.status(500).json({ 
      error: "Error al actualizar email", 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
}