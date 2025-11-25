import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { importUserGmail } from "@/lib/gmail";

// Secure this endpoint with an environment secret (SYNC_SECRET)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = req.headers["x-sync-secret"] || req.query.syncSecret;
  if (!secret || secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const accounts = await prisma.account.findMany({
      where: { provider: "google", refresh_token: { not: null } },
      select: { id: true, userId: true, refresh_token: true },
    });

    const results: Array<any> = [];

    for (const acc of accounts) {
      try {
        const r = await importUserGmail(acc.refresh_token as string, acc.userId);
        results.push({ accountId: acc.id, userId: acc.userId, ok: true, ...r });
      } catch (err: any) {
        results.push({ accountId: acc.id, userId: acc.userId, ok: false, error: String(err?.message || err) });
      }
    }

    return res.status(200).json({ ok: true, results });
  } catch (error: any) {
    console.error("/api/emails/sync-all error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
