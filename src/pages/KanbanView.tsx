import React, { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertCircle, Sparkles, Mail, Calendar, User, TrendingUp } from "lucide-react";
import EmailDetailsDialog from "@/components/EmailDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";

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
      const [isLoading, setIsLoading] = useState(false);

      // Exponer setEmails y setIsLoading para el modal
      React.useEffect(() => {
        window.setEmails = setEmails;
        window.setKanbanLoading = setIsLoading;
        return () => {
          delete window.setEmails;
          delete window.setKanbanLoading;
        };
      }, []);
    // Exponer setEmails para actualización inmediata desde el modal
    React.useEffect(() => {
      window.setEmails = setEmails;
      return () => { delete window.setEmails; };
    }, []);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<"todo" | "in_progress" | "done" | null>(null);
  
  // Filtros de prioridad
  const [filterAlta, setFilterAlta] = useState(true);
  const [filterMedia, setFilterMedia] = useState(true);
  const [filterBaja, setFilterBaja] = useState(true);
  
  // Filtros de categoría por columna
  const [filtersTodo, setFiltersTodo] = useState({ cliente: true, lead: true, interno: true });
  const [filtersInProgress, setFiltersInProgress] = useState({ cliente: true, lead: true, interno: true });
  const [filtersDone, setFiltersDone] = useState({ cliente: true, lead: true, interno: true });

  // Usar endpoint dedicado para obtener todas las tareas procesadas por IA (hasTask=true)
  const { data, refetch } = useQuery({
    queryKey: ["emails", "kanban-tasks"],
    queryFn: async () => {
      const res = await fetch(`/api/emails/kanban-tasks`);
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
    const variants: Record<string, { bg: string; icon: React.ReactNode; dot: string }> = {
      alta: {
        bg: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-800",
        icon: <AlertCircle className="h-3 w-3" />,
        dot: "bg-red-500",
      },
      media: {
        bg: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
        icon: <Clock className="h-3 w-3" />,
        dot: "bg-amber-500",
      },
      baja: {
        bg: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
        icon: <CheckCircle2 className="h-3 w-3" />,
        dot: "bg-emerald-500",
      },
    };
    return variants[priority || "baja"];
  };

  const getCategoryBadge = (category?: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      cliente: { bg: "bg-blue-500/10 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
      lead: { bg: "bg-purple-500/10 border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-400" },
      interno: { bg: "bg-slate-500/10 border-slate-200 dark:border-slate-700", text: "text-slate-700 dark:text-slate-400" },
      spam: { bg: "bg-gray-500/10 border-gray-200 dark:border-gray-700", text: "text-gray-600 dark:text-gray-400" },
    };
    return variants[category || "spam"];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const handleCardClick = (email: Email) => {
    console.log('Card clicked:', email);
    setSelectedEmail(email);
    setDialogOpen(true);
  };

  // Filtrar emails solo por prioridad (categoría se filtra por columna)
  const filteredTaskEmails = useMemo(() => {
    return emails.filter((e) => {
      if (!e.hasTask) return false;
      
      // Filtro de prioridad
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
    
    // Aplicar filtros de categoría por columna
    const applyColumnCategoryFilter = (emails: Email[], filters: { cliente: boolean, lead: boolean, interno: boolean }) => {
      return emails.filter(e => {
        const category = e.category || "spam";
        // Si es spam, siempre lo mostramos (no hay filtro para spam)
        if (category === "spam") return true;
        return filters[category as keyof typeof filters];
      });
    };
    
    grouped.todo = applyColumnCategoryFilter(grouped.todo, filtersTodo);
    grouped.in_progress = applyColumnCategoryFilter(grouped.in_progress, filtersInProgress);
    grouped.done = applyColumnCategoryFilter(grouped.done, filtersDone);
    
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
  }, [filteredTaskEmails, filtersTodo, filtersInProgress, filtersDone]);

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
    count: number,
    icon: React.ReactNode,
    gradient: string,
    borderColor: string,
    emails: Email[],
    categoryFilters: { cliente: boolean, lead: boolean, interno: boolean },
    setCategoryFilters: React.Dispatch<React.SetStateAction<{ cliente: boolean, lead: boolean, interno: boolean }>>
  ) => {
    const isOver = dragOverColumn === status;
    
    return (
      <div className="flex flex-col h-full">
        {/* Header ejecutivo con contador */}
        <div className={`p-4 rounded-t-xl ${gradient} border-b-2 ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                {icon}
              </div>
              <h3 className="font-bold text-base text-white">
                {title}
              </h3>
            </div>
            <div className="text-2xl font-bold text-white/90">
              {count}
            </div>
          </div>
          
          {/* Filtros de categoría */}
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Toggle
                pressed={categoryFilters.cliente}
                onPressedChange={(pressed) => setCategoryFilters(prev => ({ ...prev, cliente: pressed }))}
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 bg-white/10 border-white/30 text-white hover:bg-white/20 data-[state=on]:bg-white data-[state=on]:text-blue-700 data-[state=on]:border-white"
              >
                <User className="h-3 w-3" />
                Cliente
              </Toggle>
              <Toggle
                pressed={categoryFilters.lead}
                onPressedChange={(pressed) => setCategoryFilters(prev => ({ ...prev, lead: pressed }))}
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 bg-white/10 border-white/30 text-white hover:bg-white/20 data-[state=on]:bg-white data-[state=on]:text-purple-700 data-[state=on]:border-white"
              >
                <TrendingUp className="h-3 w-3" />
                Lead
              </Toggle>
              <Toggle
                pressed={categoryFilters.interno}
                onPressedChange={(pressed) => setCategoryFilters(prev => ({ ...prev, interno: pressed }))}
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 bg-white/10 border-white/30 text-white hover:bg-white/20 data-[state=on]:bg-white data-[state=on]:text-slate-700 data-[state=on]:border-white"
              >
                <Mail className="h-3 w-3" />
                Interno
              </Toggle>
            </div>
          </div>
        </div>

        {/* Zona de drop con diseño premium */}
        <div
          className={`
            flex-1 min-h-[600px] p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950
            transition-all duration-300 rounded-b-xl border-x border-b
            ${isOver 
              ? `${borderColor} shadow-lg` 
              : 'border-gray-200 dark:border-gray-800'
            }
          `}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="space-y-3">{emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
                <Mail className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">Sin tareas</p>
                <p className="text-xs opacity-60 mt-1">Arrastra emails aquí</p>
              </div>
            ) : (
              emails.map((email) => {
                const priorityInfo = getPriorityBadge(email.priority);
                const categoryInfo = getCategoryBadge(email.category);
                const isDragging = draggingId === email.id;
                
                return (
                  <Card
                    key={email.id}
                    className={`
                      group relative p-4 bg-white dark:bg-gray-900 border shadow-sm overflow-hidden
                      transition-all duration-200 cursor-grab active:cursor-grabbing
                      hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
                      ${isDragging ? 'opacity-40 scale-95 rotate-1' : 'opacity-100'}
                    `}
                    draggable
                    onDragStart={(e) => handleDragStart(e, email.id, email.subject)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => handleCardClick(email)}
                  >
                    {/* Priority indicator bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityInfo.dot}`} />
                    <div className="space-y-3 pl-2">
                      {/* Header con prioridad */}
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight flex-1">
                          {email.subject}
                        </h4>
                        <Badge className={`${priorityInfo.bg} shrink-0 text-[10px] font-bold`}>
                          {priorityInfo.icon}
                          <span className="ml-1 uppercase">{email.priority || 'baja'}</span>
                        </Badge>
                      </div>
                      {/* Tarea IA */}
                      {email.taskDescription && (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/50 dark:to-blue-950/50 border border-violet-200/50 dark:border-violet-800/50">
                          <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed font-medium">
                            {email.taskDescription}
                          </p>
                        </div>
                      )}
                      {/* Footer metadata */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                            {email.email[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                              {email.email.split('@')[0]}
                            </span>
                            {email.category && (
                              <Badge variant="outline" className={`${categoryInfo.bg} ${categoryInfo.text} text-[9px] px-1 py-0 h-4 w-fit`}>
                                {email.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span className="text-[10px] font-medium">
                            {formatDate(email.received_at)}
                          </span>
                        </div>
                      </div>
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
    <div className="space-y-6 pb-8 relative">
      {isLoading && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <span className="text-lg font-semibold text-primary">Cargando...</span>
          </div>
        </div>
      )}
      {/* Header ejecutivo con filtros visibles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Tablero Kanban
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus emails por estado
          </p>
        </div>

        {/* Filtros de prioridad visibles */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filtrar Prioridad:</span>
          <Toggle
            pressed={filterAlta}
            onPressedChange={setFilterAlta}
            variant="outline"
            size="sm"
            className="gap-2 data-[state=on]:bg-red-500/10 data-[state=on]:text-red-700 data-[state=on]:border-red-300"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Alta
          </Toggle>
          <Toggle
            pressed={filterMedia}
            onPressedChange={setFilterMedia}
            variant="outline"
            size="sm"
            className="gap-2 data-[state=on]:bg-amber-500/10 data-[state=on]:text-amber-700 data-[state=on]:border-amber-300"
          >
            <Clock className="h-3.5 w-3.5" />
            Media
          </Toggle>
          <Toggle
            pressed={filterBaja}
            onPressedChange={setFilterBaja}
            variant="outline"
            size="sm"
            className="gap-2 data-[state=on]:bg-emerald-500/10 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Baja
          </Toggle>
        </div>
      </div>

      {/* Board Kanban - 3 columnas diferenciadas */}
      <div className="grid grid-cols-3 gap-6">
        {renderKanbanColumn(
          "todo",
          "Por Hacer",
          columns.todo.length,
          <Clock className="h-5 w-5 text-white" />,
          "bg-gradient-to-br from-slate-600 to-slate-700",
          "border-slate-600",
          columns.todo,
          filtersTodo,
          setFiltersTodo
        )}
        {renderKanbanColumn(
          "in_progress",
          "En Progreso",
          columns.in_progress.length,
          <TrendingUp className="h-5 w-5 text-white" />,
          "bg-gradient-to-br from-amber-500 to-amber-600",
          "border-amber-500",
          columns.in_progress,
          filtersInProgress,
          setFiltersInProgress
        )}
        {renderKanbanColumn(
          "done",
          "Completado",
          columns.done.length,
          <CheckCircle2 className="h-5 w-5 text-white" />,
          "bg-gradient-to-br from-emerald-500 to-emerald-600",
          "border-emerald-500",
          columns.done,
          filtersDone,
          setFiltersDone
        )}
      </div>

      <EmailDetailsDialog
        email={selectedEmail}
        open={dialogOpen && !!selectedEmail}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedEmail(null);
        }}
      />
    </div>
  );
};

export default KanbanView;
