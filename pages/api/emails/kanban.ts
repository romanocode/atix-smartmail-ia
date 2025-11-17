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

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.email.update({
          where: { id },
          data: { userId: user.id, kanbanStatus: status, kanbanOrder: index },
        })
      )
    );

    return res.status(200).json({ ok: true, count: ids.length });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}