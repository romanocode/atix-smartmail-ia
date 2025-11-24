import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";
import { z } from "zod";

const QuerySchema = z.object({
  q: z.string().optional().default(""),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z.coerce.number().min(1).max(1000).optional().default(50),
  page: z.coerce.number().min(1).optional().default(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const parsed = QuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query params", details: parsed.error.flatten() });
    }

    const { q, sort, limit, page } = parsed.data;

    const where = q
      ? {
          userId: user.id,
          OR: [
            { sender: { contains: q, mode: "insensitive" as const } },
            { subject: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : { userId: user.id };

    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        orderBy: { receivedAt: sort },
        take: limit,
        skip,
      }),
      prisma.email.count({ where }),
    ]);

    return res.status(200).json({ 
      ok: true, 
      emails, 
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    console.error("[API /emails] Error:", err);
    return res.status(500).json({ 
      error: "Error al obtener emails", 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
}