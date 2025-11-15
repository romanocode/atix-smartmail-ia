import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@local";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {},
      create: { email: DEMO_USER_EMAIL, name: "Demo User" },
    });

    const [totalEmails, unprocessedEmails, pendingTasks, completedTasks] = await Promise.all([
      prisma.email.count({ where: { userId: user.id } }),
      prisma.email.count({ where: { userId: user.id, processed: false } }),
      prisma.email.count({ where: { userId: user.id, hasTask: true, kanbanStatus: { in: ["todo", "in_progress"] } } }),
      prisma.email.count({ where: { userId: user.id, hasTask: true, kanbanStatus: "done" } }),
    ]);

    return res.status(200).json({ ok: true, stats: { totalEmails, unprocessedEmails, pendingTasks, completedTasks } });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}