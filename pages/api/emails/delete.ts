import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";

const BodySchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
  deleteAll: z.boolean().optional(),
}).refine(data => data.deleteAll || data.id || (data.ids && data.ids.length > 0), {
  message: "Debe proporcionar 'id', 'ids' o 'deleteAll'",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const { id, ids, deleteAll } = parsed.data;
    // Eliminar todos los correos del usuario
    if (deleteAll) {
      const result = await prisma.email.deleteMany({
        where: { userId: user.id },
      });
      return res.status(200).json({
        ok: true,
        message: `${result.count} email(s) eliminados correctamente`,
        deleted: result.count,
      });
    }

    // Eliminar un solo email
    if (id) {
      const email = await prisma.email.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!email) {
        return res.status(404).json({ error: "Email no encontrado" });
      }

      if (email.userId !== user.id) {
        return res.status(403).json({ error: "No tienes permiso para eliminar este email" });
      }

      await prisma.email.delete({ where: { id } });

      return res.status(200).json({ ok: true, message: "Email eliminado correctamente" });
    }

    // Eliminar múltiples emails
    if (ids && ids.length > 0) {
      // Verificar que todos los emails pertenecen al usuario
      const emailsToDelete = await prisma.email.findMany({
        where: {
          id: { in: ids },
        },
        select: { id: true, userId: true },
      });

      const unauthorizedEmails = emailsToDelete.filter(e => e.userId !== user.id);
      if (unauthorizedEmails.length > 0) {
        return res.status(403).json({ 
          error: "Algunos emails no te pertenecen",
          unauthorized: unauthorizedEmails.length 
        });
      }

      const result = await prisma.email.deleteMany({
        where: {
          id: { in: ids },
          userId: user.id,
        },
      });

      return res.status(200).json({ 
        ok: true, 
        message: `${result.count} email(s) eliminado(s) correctamente`,
        deleted: result.count 
      });
    }

    return res.status(400).json({ error: "No se proporcionaron IDs válidos" });
  } catch (err) {
    console.error("[API /emails/delete] Error:", err);
    return res.status(500).json({ 
      error: "Error al eliminar email(s)", 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
}
