import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
    if (!session || !session.user) return res.status(401).json({ error: "Unauthorized" });

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id as string, provider: "google" },
    });

    const linked = !!(account && account.refresh_token);
    return res.status(200).json({ linked });
  } catch (error) {
    console.error("has-gmail error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
