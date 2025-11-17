import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const q = (req.query.q as string) || "";
    const sort = (req.query.sort as string) || "desc";

    const where = q
      ? {
          userId: user.id,
          OR: [
            { sender: { contains: q, mode: "insensitive" as const } },
            { subject: { contains: q, mode: "insensitive" as const } },
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