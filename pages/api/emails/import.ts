import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";

const EmailItemSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  received_at: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "received_at must be an ISO date",
  }),
  subject: z.string(),
  body: z.string(),
});

const ImportPayloadSchema = z.array(EmailItemSchema).min(1);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const parsed = ImportPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid JSON payload", details: parsed.error.flatten() });
    }

    const data = parsed.data.map((e, idx) => ({
      userId: user.id,
      externalId: e.id,
      sender: e.email,
      receivedAt: new Date(e.received_at),
      subject: e.subject,
      body: e.body,
      processed: false,
      category: null,
      priority: null,
      hasTask: false,
      taskDescription: null,
      kanbanStatus: "todo",
      kanbanOrder: idx,
    }));

    let created = 0;
    for (const item of data) {
      await prisma.email.upsert({
        where: { externalId_userId: { externalId: item.externalId, userId: item.userId } },
        update: item,
        create: item,
      });
      created += 1;
    }

    return res.status(200).json({ ok: true, imported: created });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}