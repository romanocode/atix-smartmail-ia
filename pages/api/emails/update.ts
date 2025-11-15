import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({
  id: z.string(),
  hasTask: z.boolean().optional(),
  category: z.enum(["cliente", "lead", "interno", "spam"]).optional(),
  priority: z.enum(["alta", "media", "baja"]).optional(),
  taskDescription: z.string().optional(),
});

const DEMO_USER_EMAIL = "demo@local";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  try {
    const { id, hasTask, category, priority, taskDescription } = parsed.data;

    const user = await prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {},
      create: { email: DEMO_USER_EMAIL, name: "Demo User" },
    });

    const updated = await prisma.email.update({
      where: { id },
      data: {
        userId: user.id,
        hasTask: hasTask ?? undefined,
        category: category ?? undefined,
        priority: priority ?? undefined,
        taskDescription: taskDescription ?? undefined,
      },
    });

    return res.status(200).json({ ok: true, email: updated });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}