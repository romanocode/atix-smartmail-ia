import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === "production") return res.status(404).end();

  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session || !session.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const account = await prisma.account.findFirst({ where: { userId: session.user.id as string, provider: "google" } });
    if (!account) return res.status(404).json({ error: "No google account linked" });

    // Mask sensitive tokens except show presence
    const safe = {
      id: account.id,
      userId: account.userId,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
      expires_at: account.expires_at,
      scope: account.scope,
      token_type: account.token_type,
    };

    return res.status(200).json({ ok: true, account: safe });
  } catch (err: any) {
    console.error("/api/emails/account-debug error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
