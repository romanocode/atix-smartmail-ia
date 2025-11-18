import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";

const BodySchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]),
  ids: z.array(z.string()).min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const { status, ids } = parsed.data;

    // Validar que los emails pertenecen al usuario
    const emailsToUpdate = await prisma.email.findMany({
      where: {
        userId: user.id,
        id: { in: ids },
      },
      select: { id: true },
    });

    if (emailsToUpdate.length !== ids.length) {
      return res.status(403).json({ 
        error: "Algunos emails no pertenecen a tu cuenta",
        found: emailsToUpdate.length,
        requested: ids.length,
      });
    }

    // Actualizar en transacción
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.email.update({
          where: { id },
          data: { 
            kanbanStatus: status, 
            kanbanOrder: index,
            updatedAt: new Date(),
          },
        })
      )
    );

    return res.status(200).json({ ok: true, count: ids.length });
  } catch (err) {
    console.error("[API /emails/kanban] Error:", err);
    return res.status(500).json({ 
      error: "Error al actualizar Kanban", 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
}