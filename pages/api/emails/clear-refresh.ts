import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Dev-only helper to clear stored refresh_token for the current user's Google account.
// This forces the next sign-in to request a new refresh_token.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === "production") return res.status(404).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const updated = await prisma.account.updateMany({
      where: { userId: user.id, provider: "google", refresh_token: { not: null } },
      data: { refresh_token: null },
    });

    return res.status(200).json({ ok: true, cleared: updated.count });
  } catch (err: any) {
    console.error("/api/emails/clear-refresh error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
