import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const accounts = await prisma.account.findMany({
      where: { provider: "google" },
      select: {
        id: true,
        userId: true,
        providerAccountId: true,
        refresh_token: true,
        access_token: true,
        scope: true,
      },
    });
    return res.status(200).json({ accounts });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || String(error) });
  }
}
