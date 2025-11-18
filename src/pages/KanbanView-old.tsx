import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertCircle, Sparkles, Filter, X } from "lucide-react";
import EmailDetailsDialog from "@/components/EmailDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Email {
  id: string;
  email: string;
  subject: string;
  received_at: string;
  body?: string;
  category?: string;
  priority?: string;
  hasTask?: boolean;
  taskDescription?: string;
  kanbanStatus?: "todo" | "in_progress" | "done";
  kanbanOrder?: number;
}

const KanbanView = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<"todo" | "in_progress" | "done" | null>(null);
  
  // Filtros de prioridad
  const [filterAlta, setFilterAlta] = useState(true);
  const [filterMedia, setFilterMedia] = useState(true);
  const [filterBaja, setFilterBaja] = useState(true);

  const { data, refetch } = useQuery({
    queryKey: ["emails", "kanban"],
    queryFn: async () => {
      const res = await fetch(`/api/emails`);
      const json = await res.json();
      return json.emails as any[];
    },
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      const mapped = data.map((e: any) => ({
        id: e.id,
        email: e.sender,
        subject: e.subject,
        received_at: e.receivedAt,
        body: e.body,
        category: e.category ?? undefined,
        priority: e.priority ?? undefined,
        hasTask: e.hasTask ?? false,
        taskDescription: e.taskDescription ?? undefined,
        kanbanStatus: e.kanbanStatus ?? "todo",
        kanbanOrder: e.kanbanOrder ?? 0,
      }));
      setEmails(mapped);
    }
  }, [data]);

  const getPriorityBadge = (priority?: string) => {
    const variants: Record<string, { bg: string; icon: React.ReactNode }> = {
      alta: {
        bg: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: <AlertCircle className="h-3 w-3" />,
      },
      media: {
        bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        icon: <Clock className="h-3 w-3" />,
      },
      baja: {
        bg: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
    };
    return variants[priority || "baja"];
  };

  const handleCardClick = (email: Email) => {
    setSelectedEmail(email);
    setDialogOpen(true);
  };

  // Filtrar emails por prioridad seleccionada
  const filteredTaskEmails = useMemo(() => {
    return emails.filter((e) => {
      if (!e.hasTask) return false;
      const priority = e.priority || "baja";
      if (priority === "alta" && !filterAlta) return false;
      if (priority === "media" && !filterMedia) return false;
      if (priority === "baja" && !filterBaja) return false;
      return true;
    });
  }, [emails, filterAlta, filterMedia, filterBaja]);

  const columns = useMemo(() => {
    const grouped: Record<string, Email[]> = { todo: [], in_progress: [], done: [] };
    filteredTaskEmails.forEach((e) => {
      const s = e.kanbanStatus || "todo";
      grouped[s].push(e);
    });
    const pRank: Record<string, number> = { alta: 3, media: 2, baja: 1 };
    const cRank: Record<string, number> = { cliente: 4, lead: 3, interno: 2, spam: 1 };
    const cmp = (a: Email, b: Email) => {
      const pa = pRank[a.priority || "baja"]; const pb = pRank[b.priority || "baja"]; if (pa !== pb) return pb - pa;
      const ca = cRank[a.category || "spam"]; const cb = cRank[b.category || "spam"]; if (ca !== cb) return cb - ca;
      const ra = new Date(a.received_at).getTime(); const rb = new Date(b.received_at).getTime(); if (ra !== rb) return rb - ra;
      return (a.kanbanOrder || 0) - (b.kanbanOrder || 0);
    };
    (grouped.todo as Email[]).sort(cmp);
    (grouped.in_progress as Email[]).sort(cmp);
    (grouped.done as Email[]).sort(cmp);
    return grouped;
  }, [filteredTaskEmails]);

  const persistColumn = async (status: "todo" | "in_progress" | "done", ids: string[]) => {
    const res = await fetch("/api/emails/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ids }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success("✓ Actualizado");
      refetch();
    } else {
      toast.error(json.error || "Error al actualizar");
    }
  };

  const handleDragStart = (e: React.DragEvent, emailId: string, subject: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", emailId);
    setDraggingId(emailId);
    
    // Crear preview minimalista
    const dragPreview = document.createElement("div");
    dragPreview.style.cssText = `
      position: absolute;
      top: -1000px;
      padding: 12px 16px;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      font-size: 13px;
      font-weight: 500;
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    dragPreview.textContent = subject;
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);
    setTimeout(() => dragPreview.remove(), 0);
  };

  const handleDragOver = (e: React.DragEvent, status: "todo" | "in_progress" | "done") => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: "todo" | "in_progress" | "done") => {
    e.preventDefault();
    const emailId = e.dataTransfer.getData("text/plain");
    
    if (!emailId) return;

    const email = filteredTaskEmails.find(em => em.id === emailId);
    if (!email) return;

    // Si ya está en la columna, no hacer nada
    if (email.kanbanStatus === targetStatus) {
      setDraggingId(null);
      setDragOverColumn(null);
      return;
    }

    // Optimistic update
    setEmails(prev => prev.map(e => 
      e.id === emailId ? { ...e, kanbanStatus: targetStatus } : e
    ));

    setDraggingId(null);
    setDragOverColumn(null);

    // Actualizar orden de la columna destino
    const targetEmails = columns[targetStatus] || [];
    const newOrder = [...targetEmails.filter(e => e.id !== emailId), email];
    await persistColumn(targetStatus, newOrder.map(e => e.id));
  };

  const activeFiltersCount = [filterAlta, filterMedia, filterBaja].filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount < 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Tablero Kanban
        </h1>
        <p className="text-muted-foreground">
          Organiza tus tareas visualmente por estado de progreso
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Por hacer */}
        <div className="space-y-4">
          <Card className="p-4 shadow-card border-0 bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">
                Por hacer
              </h3>
              <Badge className="bg-blue-100 text-blue-800">
                {(columns.todo || []).length}
              </Badge>
            </div>
          </Card>
          <div
            className={`space-y-3 ${overStatus === "todo" ? "border-2 border-dashed border-primary/40 bg-primary/5" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus("todo");
            }}
            onDragLeave={() => setOverStatus((prev) => (prev === "todo" ? null : prev))}
            onDrop={(e) => onDropTo(e, "todo")}
          >
            {(columns.todo || []).map((email, index) => {
              const priorityInfo = getPriorityBadge(email.priority);
              const isDragging = draggingId === email.id;
              return (
                <>
                  {hoverIndex.todo === index && (
                    <div className="h-2 rounded border-2 border-dashed border-primary/40" />
                  )}
                <Card
                  key={email.id}
                  className={`p-4 bg-card border border-border hover:shadow-sm hover:border-primary/20 transition-all duration-200 cursor-pointer ${isDragging ? "opacity-70 ring-2 ring-primary/40" : ""}`}
                  draggable
                  onDragStart={(ev) => {
                    ev.dataTransfer.setData("text/plain", email.id);
                    setDraggingId(email.id);
                    const img = createDragImage(email.subject);
                    ev.dataTransfer.setDragImage(img, 0, 0);
                  }}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    setHoverIndex((prev) => ({ ...prev, todo: index }));
                  }}
                  onDragEnd={() => {
                    if (dragGhost) {
                      dragGhost.remove();
                      setDragGhost(null);
                    }
                  }}
                  onClick={() => handleCardClick(email)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-foreground line-clamp-2">
                        {email.subject}
                      </p>
                      <Badge className={priorityInfo.bg}>
                        <span className="flex items-center gap-1">
                          {priorityInfo.icon}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {email.email}
                    </p>
                    {email.taskDescription && (
                      <div className="flex items-start gap-2 bg-muted/50 p-2 rounded text-xs">
                        <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                        <p className="text-muted-foreground line-clamp-2">
                          {email.taskDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
                </>
              );
            })}
          </div>
        </div>

        {/* En progreso */}
        <div className="space-y-4">
          <Card className="p-4 shadow-card border-0 bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">
                En progreso
              </h3>
              <Badge className="bg-yellow-100 text-yellow-800">{(columns.in_progress || []).length}</Badge>
            </div>
          </Card>
          <div
            className={`space-y-3 min-h-24 p-2 border-2 border-dashed bg-muted/20 ${overStatus === "in_progress" ? "border-primary/40 bg-primary/5" : "border-border"}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus("in_progress");
            }}
            onDragLeave={() => setOverStatus((prev) => (prev === "in_progress" ? null : prev))}
            onDrop={(e) => onDropTo(e, "in_progress")}
          >
            {(columns.in_progress || []).map((email, index) => {
              const priorityInfo = getPriorityBadge(email.priority);
              const isDragging = draggingId === email.id;
              return (
                <>
                  {hoverIndex.in_progress === index && (
                    <div className="h-2 rounded border-2 border-dashed border-primary/40" />
                  )}
                  <Card
                    key={email.id}
                  className={`p-4 bg-card border border-border hover:shadow-sm hover:border-primary/20 transition-all duration-200 cursor-pointer ${isDragging ? "opacity-70 ring-2 ring-primary/40" : ""}`}
                  draggable
                  onDragStart={(ev) => {
                    ev.dataTransfer.setData("text/plain", email.id);
                    setDraggingId(email.id);
                    const img = createDragImage(email.subject);
                    ev.dataTransfer.setDragImage(img, 0, 0);
                  }}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    setHoverIndex((prev) => ({ ...prev, in_progress: index }));
                  }}
                  onDragEnd={() => {
                    if (dragGhost) {
                      dragGhost.remove();
                      setDragGhost(null);
                    }
                  }}
                  onClick={() => handleCardClick(email)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-foreground line-clamp-2">
                        {email.subject}
                      </p>
                      <Badge className={priorityInfo.bg}>
                        <span className="flex items-center gap-1">
                          {priorityInfo.icon}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email.email}</p>
                  </div>
                  </Card>
                </>
              );
            })}
          </div>
        </div>

        {/* Completado */}
        <div className="space-y-4">
          <Card className="p-4 shadow-card border-0 bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">
                Completado
              </h3>
              <Badge className="bg-green-100 text-green-800">{(columns.done || []).length}</Badge>
            </div>
          </Card>
          <div
            className={`space-y-3 min-h-24 p-2 border-2 border-dashed bg-muted/20 ${overStatus === "done" ? "border-primary/40 bg-primary/5" : "border-border"}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus("done");
            }}
            onDragLeave={() => setOverStatus((prev) => (prev === "done" ? null : prev))}
            onDrop={(e) => onDropTo(e, "done")}
          >
            {(columns.done || []).map((email, index) => {
              const priorityInfo = getPriorityBadge(email.priority);
              const isDragging = draggingId === email.id;
              return (
                <>
                  {hoverIndex.done === index && (
                    <div className="h-2 rounded border-2 border-dashed border-primary/40" />
                  )}
                  <Card
                    key={email.id}
                  className={`p-4 bg-card border border-border hover:shadow-sm hover:border-primary/20 transition-all duration-200 cursor-pointer ${isDragging ? "opacity-70 ring-2 ring-primary/40" : ""}`}
                  draggable
                  onDragStart={(ev) => {
                    ev.dataTransfer.setData("text/plain", email.id);
                    setDraggingId(email.id);
                    const img = createDragImage(email.subject);
                    ev.dataTransfer.setDragImage(img, 0, 0);
                  }}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    setHoverIndex((prev) => ({ ...prev, done: index }));
                  }}
                  onDragEnd={() => {
                    if (dragGhost) {
                      dragGhost.remove();
                      setDragGhost(null);
                    }
                  }}
                  onClick={() => handleCardClick(email)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-foreground line-clamp-2">
                        {email.subject}
                      </p>
                      <Badge className={priorityInfo.bg}>
                        <span className="flex items-center gap-1">
                          {priorityInfo.icon}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email.email}</p>
                  </div>
                  </Card>
                </>
              );
            })}
            {((columns.todo || []).length === 0 && overStatus === "todo") && (
              <div className="h-10 rounded border-2 border-dashed border-primary/40 bg-primary/10" />
            )}
            {((columns.in_progress || []).length === 0 && overStatus === "in_progress") && (
              <div className="h-10 rounded border-2 border-dashed border-primary/40 bg-primary/10" />
            )}
            {((columns.done || []).length === 0 && overStatus === "done") && (
              <div className="h-10 rounded border-2 border-dashed border-primary/40 bg-primary/10" />
            )}
          </div>
        </div>
      </div>

      {/* Email Details Dialog */}
      <EmailDetailsDialog
        email={selectedEmail}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedEmail(null);
        }}
      />
    </div>
  );
};

export default KanbanView;
