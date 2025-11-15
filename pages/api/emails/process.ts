import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({
  ids: z.array(z.string()).min(1),
  processed: z.boolean(),
});

const DEMO_USER_EMAIL = "demo@local";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  try {
    const { ids, processed } = parsed.data;

    const user = await prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {},
      create: { email: DEMO_USER_EMAIL, name: "Demo User" },
    });

    const result = await prisma.email.updateMany({
      where: { userId: user.id, id: { in: ids } },
      data: { processed },
    });

    return res.status(200).json({ ok: true, count: result.count });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}