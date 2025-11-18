import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromSession, unauthorizedResponse } from "@/lib/api-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await getUserFromSession(req, res);
    if (!user) return unauthorizedResponse(res);

    // Fechas para comparación semanal
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const [
      totalEmails,
      unprocessedEmails,
      pendingTasks,
      completedTasks,
      byCategory,
      byPriority,
      highPriorityUnprocessed,
      processedThisWeek,
      processedLastWeek,
      tasksCompletedThisWeek,
      tasksCompletedLastWeek,
      todoTasks,
      inProgressTasks,
    ] = await Promise.all([
      prisma.email.count({ where: { userId: user.id } }),
      prisma.email.count({ where: { userId: user.id, processed: false } }),
      prisma.email.count({ 
        where: { 
          userId: user.id, 
          hasTask: true, 
          kanbanStatus: { in: ["todo", "in_progress"] } 
        } 
      }),
      prisma.email.count({ 
        where: { 
          userId: user.id, 
          hasTask: true, 
          kanbanStatus: "done" 
        } 
      }),
      prisma.email.groupBy({
        by: ["category"],
        where: { userId: user.id, processed: true },
        _count: true,
      }),
      prisma.email.groupBy({
        by: ["priority"],
        where: { userId: user.id, processed: true },
        _count: true,
      }),
      // Emails de ALTA prioridad sin procesar
      prisma.email.findMany({
        where: {
          userId: user.id,
          processed: false,
          priority: "alta",
        },
        select: {
          id: true,
          sender: true,
          subject: true,
          receivedAt: true,
          category: true,
        },
        orderBy: { receivedAt: "desc" },
        take: 5,
      }),
      // Procesados esta semana
      prisma.email.count({
        where: {
          userId: user.id,
          processed: true,
          updatedAt: { gte: startOfThisWeek },
        },
      }),
      // Procesados semana pasada
      prisma.email.count({
        where: {
          userId: user.id,
          processed: true,
          updatedAt: { gte: startOfLastWeek, lt: startOfThisWeek },
        },
      }),
      // Tareas completadas esta semana
      prisma.email.count({
        where: {
          userId: user.id,
          hasTask: true,
          kanbanStatus: "done",
          updatedAt: { gte: startOfThisWeek },
        },
      }),
      // Tareas completadas semana pasada
      prisma.email.count({
        where: {
          userId: user.id,
          hasTask: true,
          kanbanStatus: "done",
          updatedAt: { gte: startOfLastWeek, lt: startOfThisWeek },
        },
      }),
      // Tareas por hacer
      prisma.email.count({
        where: {
          userId: user.id,
          hasTask: true,
          kanbanStatus: "todo",
        },
      }),
      // Tareas en progreso
      prisma.email.count({
        where: {
          userId: user.id,
          hasTask: true,
          kanbanStatus: "in_progress",
        },
      }),
    ]);

    const categoryStats = {
      cliente: 0,
      lead: 0,
      interno: 0,
      spam: 0,
    };
    byCategory.forEach((item) => {
      if (item.category) categoryStats[item.category as keyof typeof categoryStats] = item._count;
    });

    const priorityStats = {
      alta: 0,
      media: 0,
      baja: 0,
    };
    byPriority.forEach((item) => {
      if (item.priority) priorityStats[item.priority as keyof typeof priorityStats] = item._count;
    });

    return res.status(200).json({ 
      ok: true, 
      stats: { 
        totalEmails, 
        unprocessedEmails, 
        pendingTasks, 
        completedTasks,
        byCategory: categoryStats,
        byPriority: priorityStats,
        highPriorityUnprocessed,
        processedThisWeek,
        processedLastWeek,
        tasksCompletedThisWeek,
        tasksCompletedLastWeek,
        todoTasks,
        inProgressTasks,
      } 
    });
  } catch (err) {
    console.error("[API /emails/stats] Error:", err);
    return res.status(500).json({ 
      error: "Error al obtener estadísticas", 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
}