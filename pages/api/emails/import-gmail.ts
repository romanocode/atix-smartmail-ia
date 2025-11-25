import type { NextApiRequest, NextApiResponse } from "next";
import { importUserGmail } from "@/lib/gmail";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    const account = await prisma.account.findFirst({
      where: { userId: user.id, provider: "google" },
      select: { refresh_token: true },
    });

    if (!account || !account.refresh_token) {
      return res.status(400).json({ error: 'No linked Google account with refresh token. Please click "Vincular Bandeja" to re-authorize.' });
    }

    // Leer parámetros de fecha
    let after: string | undefined = undefined;
    if (req.body?.range) {
      const now = new Date();
      if (req.body.range === "week") {
        after = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (req.body.range === "month") {
        after = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (req.body.range === "custom" && req.body.after) {
        after = new Date(req.body.after).toISOString();
      }
    }
    try {
      const result = await importUserGmail(account.refresh_token, user.id, { pageSize: 200, after });
      return res.status(200).json({ ok: true, ...result });
    } catch (err: any) {
      console.error('[API /emails/import-gmail] gmail API error:', err);
      const message = err?.message || String(err || '');
      const status = err?.response?.status || err?.status || (message?.toString().includes('403') ? 403 : 400);

      // Handle invalid_grant specifically: typically means refresh_token revoked/invalid
      if (message.toLowerCase().includes('invalid_grant') || (err?.response?.data && String(err.response.data).toLowerCase().includes('invalid_grant'))) {
        return res.status(400).json({ error: 'invalid_grant', message: 'Refresh token inválido o revocado. Revoca el acceso en tu cuenta Google y vuelve a usar "Vincular Bandeja" para reautorizar (prompt=consent).', details: process.env.NODE_ENV !== 'production' ? message : undefined });
      }

      if (status === 403 || message.toLowerCase().includes('access_denied') || message.toLowerCase().includes('not authorized')) {
        return res.status(403).json({ error: 'access_denied', message: 'Acceso denegado por Google. Reautoriza la app con "Vincular Bandeja" (prompt=consent) y asegúrate de ser Test User.', details: process.env.NODE_ENV !== 'production' ? message : undefined });
      }

      // Unknown error: return details in dev
      if (process.env.NODE_ENV !== 'production') {
        return res.status(500).json({ error: 'Error importing from Gmail', details: message });
      }
      return res.status(500).json({ error: 'Error importing from Gmail' });
    }
  } catch (error: any) {
    console.error("[API /emails/import-gmail] Error:", error);
    // In development return details to help debugging; in production keep generic
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ error: "Error importing from Gmail", details: error.message || String(error) });
    }
    return res.status(500).json({ error: "Error importing from Gmail" });
  }
}
