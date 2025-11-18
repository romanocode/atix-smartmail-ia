import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertCircle, Sparkles, Filter } from "lucide-react";
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

  const renderKanbanColumn = (
    status: "todo" | "in_progress" | "done",
    title: string,
    badgeColor: string,
    emails: Email[]
  ) => {
    const isOver = dragOverColumn === status;
    
    return (
      <div className="flex flex-col h-full">
        {/* Header de columna */}
        <Card className="p-4 shadow-sm border-0 bg-gradient-to-br from-muted/50 to-muted/30 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              {title}
            </h3>
            <Badge className={`${badgeColor} font-mono text-sm px-2.5 py-0.5`}>
              {emails.length}
            </Badge>
          </div>
        </Card>

        {/* Zona de drop */}
        <div
          className={`
            flex-1 min-h-[400px] p-3 rounded-lg border-2 border-dashed transition-all duration-200
            ${isOver 
              ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 shadow-inner' 
              : 'border-border bg-muted/20'
            }
          `}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="space-y-3">
            {emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">Sin tareas</p>
              </div>
            ) : (
              emails.map((email) => {
                const priorityInfo = getPriorityBadge(email.priority);
                const isDragging = draggingId === email.id;
                
                return (
                  <Card
                    key={email.id}
                    className={`
                      group p-4 bg-card border transition-all duration-200 cursor-grab active:cursor-grabbing
                      hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5
                      ${isDragging ? 'opacity-40 scale-95 rotate-2' : 'opacity-100'}
                    `}
                    draggable
                    onDragStart={(e) => handleDragStart(e, email.id, email.subject)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => handleCardClick(email)}
                  >
                    <div className="space-y-3">
                      {/* Header de card */}
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-snug flex-1">
                          {email.subject}
                        </h4>
                        <Badge className={`${priorityInfo.bg} shrink-0`}>
                          <span className="flex items-center gap-1">
                            {priorityInfo.icon}
                            <span className="text-xs font-medium capitalize">
                              {email.priority || 'baja'}
                            </span>
                          </span>
                        </Badge>
                      </div>

                      {/* Info del remitente */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                          {email.email[0].toUpperCase()}
                        </div>
                        <p className="text-xs text-muted-foreground truncate flex-1">
                          {email.email}
                        </p>
                      </div>

                      {/* Descripción de tarea */}
                      {email.taskDescription && (
                        <div className="flex items-start gap-2 bg-muted/50 p-2.5 rounded-md">
                          <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {email.taskDescription}
                          </p>
                        </div>
                      )}

                      {/* Categoría badge */}
                      {email.category && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {email.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tablero Kanban
          </h1>
          <p className="text-muted-foreground text-sm">
            Arrastra las tareas entre columnas para cambiar su estado
          </p>
        </div>

        {/* Filtro de prioridad */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar por prioridad
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center justify-between">
              Prioridades
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => {
                    setFilterAlta(true);
                    setFilterMedia(true);
                    setFilterBaja(true);
                  }}
                >
                  Limpiar
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filterAlta}
              onCheckedChange={setFilterAlta}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                <span>Alta</span>
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterMedia}
              onCheckedChange={setFilterMedia}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-yellow-600" />
                <span>Media</span>
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterBaja}
              onCheckedChange={setFilterBaja}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span>Baja</span>
              </div>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total tareas</div>
          <div className="text-2xl font-bold">{filteredTaskEmails.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">En progreso</div>
          <div className="text-2xl font-bold text-yellow-600">{columns.in_progress.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Completadas</div>
          <div className="text-2xl font-bold text-green-600">{columns.done.length}</div>
        </Card>
      </div>

      {/* Board Kanban */}
      <div className="grid md:grid-cols-3 gap-6">
        {renderKanbanColumn(
          "todo",
          "📋 Por hacer",
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          columns.todo
        )}
        {renderKanbanColumn(
          "in_progress",
          "⏳ En progreso",
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          columns.in_progress
        )}
        {renderKanbanColumn(
          "done",
          "✅ Completado",
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          columns.done
        )}
      </div>

      <EmailDetailsDialog
        email={selectedEmail}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default KanbanView;
