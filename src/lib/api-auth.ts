import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserFromSession(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

export function unauthorizedResponse(res: NextApiResponse) {
  return res.status(401).json({ error: "No autorizado. Debes iniciar sesión." });
}
