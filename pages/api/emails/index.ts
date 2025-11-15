import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@local";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const q = (req.query.q as string) || "";
    const sort = (req.query.sort as string) || "desc"; // by receivedAt

    const user = await prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {},
      create: { email: DEMO_USER_EMAIL, name: "Demo User" },
    });

    const where = q
      ? {
          userId: user.id,
          OR: [
            { sender: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
          ],
        }
      : { userId: user.id };

    const emails = await prisma.email.findMany({
      where,
      orderBy: { receivedAt: sort === "asc" ? "asc" : "desc" },
      take: 500,
    });

    return res.status(200).json({ ok: true, emails });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}