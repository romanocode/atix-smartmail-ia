import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    // Obtener todos los emails con hasTask=true para el usuario
    const emails = await prisma.email.findMany({
      where: {
        userId: user.id,
        hasTask: true,
      },
      orderBy: { receivedAt: "desc" },
    });

    return res.status(200).json({ ok: true, emails });
  } catch (err) {
    console.error("[API /emails/kanban-tasks] Error:", err);
    return res.status(500).json({ error: "Error al obtener tareas de kanban", details: err instanceof Error ? err.message : String(err) });
  }
}
