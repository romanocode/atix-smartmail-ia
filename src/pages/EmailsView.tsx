import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Tag,
  Calendar,
  FileText,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EmailDetailsDialog from "@/components/EmailDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  processed?: boolean;
}

const EmailsView = () => {
  const [emails, setEmails] = useState<Email[]>([]);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isImportingGmail, setIsImportingGmail] = useState(false);
  const [gmailRange, setGmailRange] = useState<'all'|'week'|'month'|'custom'>('all');
  const [gmailCustomDate, setGmailCustomDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importTotal, setImportTotal] = useState(0);
  const [importDone, setImportDone] = useState(0);
  const [importFailed, setImportFailed] = useState(0);
  const [processedFilter, setProcessedFilter] = useState<"all" | "processed" | "unprocessed">("all");
  const [taskOnly, setTaskOnly] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [prioritySort, setPrioritySort] = useState<"none" | "priority" | "category_priority">("none");
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["emails", searchTerm, sortOrder, currentPage, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        q: searchTerm, 
        sort: sortOrder,
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/emails?${params.toString()}`);
      const json = await res.json();
      return json;
    },
  });

  // Importar correos reales desde Gmail
  const handleImportGmail = async () => {
    setIsImportingGmail(true);
    const controller = new AbortController();
    setAbortController(controller);
    try {
      let body: any = {};
      if (gmailRange !== 'all') {
        body.range = gmailRange;
        if (gmailRange === 'custom' && gmailCustomDate) {
          body.after = gmailCustomDate;
        }
      }
      const res = await fetch("/api/emails/import-gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(`Importados ${json.imported} correos de Gmail.`);
        refetch();
      } else {
        toast.error(json.error || "Error al importar correos de Gmail.");
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.info('Importación cancelada.');
      } else {
        toast.error("Error al importar correos de Gmail.");
      }
    }
    setIsImportingGmail(false);
    setAbortController(null);
  };

  const handleCancelImport = () => {
    if (abortController) {
      abortController.abort();
      setIsImportingGmail(false);
      setAbortController(null);
    }
  };

  useEffect(() => {
    if (data) {
      const mapped = (data.emails || []).map((e: any) => ({
        id: e.id,
        email: e.sender,
        subject: e.subject,
        received_at: e.receivedAt,
        body: e.body,
        category: e.category ?? undefined,
        priority: e.priority ?? undefined,
        hasTask: e.hasTask ?? false,
        taskDescription: e.taskDescription ?? undefined,
        processed: e.processed ?? false,
      }));
      setEmails(mapped);
      setSelectedIds(new Set());
      
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotal(data.pagination.total || 0);
      }
    }
  }, [data]);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("emails:refresh", handler as EventListener);
    return () => window.removeEventListener("emails:refresh", handler as EventListener);
  }, [refetch]);



  const ImportSchema = z.array(
    z.object({
      id: z.string(),
      email: z.string().email(),
      received_at: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
      subject: z.string(),
      body: z.string(),
    }),
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      toast.error("El archivo no es JSON válido");
      return;
    }
    const safe = ImportSchema.safeParse(parsed);
    if (!safe.success) {
      const issue = safe.error.issues?.[0];
      const path = issue?.path?.join(".") || "payload";
      const message = issue?.message || "Formato inválido";
      toast.error(`Error en ${path}: ${message}`);
      return;
    }
    const items = safe.data;
    const chunkSize = 100;
    setIsImporting(true);
    setImportTotal(items.length);
    setImportDone(0);

    let importedCount = 0;
    let failedCount = 0;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      let res = await fetch("/api/emails/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      });
      const json = await res.json();
      if (!res.ok) {
        res = await fetch("/api/emails/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chunk),
        });
        const retryJson = await res.json();
        if (!res.ok) {
          failedCount += chunk.length;
        } else {
          importedCount += retryJson.imported || chunk.length;
        }
      } else {
        importedCount += json.imported || chunk.length;
      }
      setImportDone(Math.min(i + chunk.length, items.length));
    }

    setImportFailed(failedCount);
    if (failedCount > 0) {
      toast.error(`Fallidos ${failedCount}. Importados ${importedCount}.`);
    } else {
      toast.success(`Importados ${importedCount} emails`);
    }
    setSelectedIds(new Set());
    await refetch();
    setIsImporting(false);
  };



  const getCategoryBadge = (category?: string) => {
    const variants: Record<string, string> = {
      cliente: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      lead: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      interno: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      spam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return variants[category || ""] || variants.spam;
  };

  const getPriorityBadge = (priority?: string) => {
    const variants: Record<
      string,
      { bg: string; icon: React.ReactNode }
    > = {
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

  const filteredEmails = useMemo(() => {
    const pRank: Record<string, number> = { alta: 3, media: 2, baja: 1 };
    const cRank: Record<string, number> = { cliente: 4, lead: 3, interno: 2, spam: 1 };
    let list = [...emails];
    if (processedFilter !== "all") list = list.filter((e) => processedFilter === "processed" ? e.processed : !e.processed);
    if (taskOnly) list = list.filter((e) => e.hasTask);
    if (categoryFilter !== "all") list = list.filter((e) => (e.category || "") === categoryFilter);
    if (prioritySort !== "none") {
      list.sort((a, b) => {
        if (prioritySort === "category_priority") {
          const ca = cRank[a.category || "spam"], cb = cRank[b.category || "spam"]; if (ca !== cb) return cb - ca;
        }
        const pa = pRank[a.priority || "baja"], pb = pRank[b.priority || "baja"]; if (pa !== pb) return pb - pa;
        const ra = new Date(a.received_at).getTime(), rb = new Date(b.received_at).getTime(); return rb - ra;
      });
    }
    return list;
  }, [emails, processedFilter, taskOnly, categoryFilter, prioritySort]);

  const handleRowClick = (email: Email) => {
    setSelectedEmail(email);
    setDialogOpen(true);
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(emails.map((e) => e.id)));
    else setSelectedIds(new Set());
  };

  const markProcessed = async (processed: boolean) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const res = await fetch("/api/emails/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, processed }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success(json.message || `Actualizado ${json.count} email(s)`);
      setSelectedIds(new Set());
      refetch();
    } else {
      toast.error(json.error || "Error al actualizar");
    }
  };

  const markOneProcessed = async (id: string, processed: boolean) => {
    const res = await fetch("/api/emails/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id], processed }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success(processed ? "Procesado" : "Desmarcado");
      refetch();
    } else {
      toast.error(json.error || "Error al actualizar");
    }
  };

  const processWithIA = async () => {
    if (selectedIds.size === 0) {
      toast.error("Selecciona al menos un email para procesar");
      return;
    }

    const ids = Array.from(selectedIds);
    setIsProcessingIA(true);

    try {
      const res = await fetch("/api/emails/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success(`✨ Procesados ${json.processed} de ${json.total} emails con IA`);
        setSelectedIds(new Set());
        refetch();
      } else {
        toast.error(json.error || "Error al procesar con IA");
      }
    } catch (error) {
      toast.error("Error de conexión al procesar con IA");
      console.error(error);
    } finally {
      setIsProcessingIA(false);
    }
  };

  const deleteEmails = async () => {
    if (selectedIds.size === 0) {
      toast.error("Selecciona al menos un email para eliminar");
      return;
    }

    if (!confirm(`¿Eliminar ${selectedIds.size} email(s)? Esta acción no se puede deshacer.`)) {
      return;
    }

    const ids = Array.from(selectedIds);

    setIsDeleting(true);
    try {
      const res = await fetch("/api/emails/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success(json.message || `${json.deleted} email(s) eliminado(s)`);
        setSelectedIds(new Set());
        await refetch();
      } else {
        toast.error(json.error || "Error al eliminar emails");
      }
    } catch (error) {
      toast.error("Error de conexión al eliminar emails");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Eliminar todos los correos del usuario
  const deleteAllEmails = async () => {
    if (!confirm("¿Eliminar TODOS los correos? Esta acción no se puede deshacer.")) {
      return;
    }
    setIsDeletingAll(true);
    try {
      const res = await fetch("/api/emails/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || `${json.deleted} email(s) eliminados`);
        setSelectedIds(new Set());
        await refetch();
      } else {
        toast.error(json.error || "Error al eliminar todos los emails");
      }
    } catch (error) {
      toast.error("Error de conexión al eliminar todos los emails");
      console.error(error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const showLoading = isImporting || isDeleting;

  return (
    <div className="space-y-6 relative">
      {/* Botón importar Gmail */}
      <div className="mb-4 flex gap-2 items-center">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Rango:</label>
          <select
            value={gmailRange}
            onChange={e => setGmailRange(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-800"
            disabled={isImportingGmail}
          >
            <option value="all">Todos</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="custom">Personalizado</option>
          </select>
          {gmailRange === 'custom' && (
            <input
              type="date"
              value={gmailCustomDate}
              onChange={e => setGmailCustomDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-800"
              disabled={isImportingGmail}
            />
          )}
        </div>
        <button
          onClick={handleImportGmail}
          disabled={isImportingGmail}
          className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          {isImportingGmail ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Importar correos reales de Gmail
        </button>
        {isImportingGmail && (
          <button
            onClick={handleCancelImport}
            className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800 transition"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={deleteAllEmails}
          disabled={isDeletingAll}
          className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800 transition"
        >
          {isDeletingAll ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Borrar todos los correos
        </button>
      </div>
      {showLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <span className="text-lg font-semibold text-primary">Procesando...</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Emails</h1>
        <p className="text-muted-foreground">
          Gestiona y procesa tus emails con inteligencia artificial
        </p>
      </div>

      {/* Actions Bar */}
      <Card className="p-6 shadow-card border-0">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por remitente o asunto..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Procesado</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={processedFilter} onValueChange={(v) => setProcessedFilter(v as any)}>
                  <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="processed">Solo procesados</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unprocessed">Sin procesar</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={taskOnly} onCheckedChange={(v) => setTaskOnly(!!v)}>
                  Solo tareas
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Categoría</DropdownMenuLabel>
                <div className="px-2 py-1.5">
                  <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="cliente">cliente</SelectItem>
                      <SelectItem value="lead">lead</SelectItem>
                      <SelectItem value="interno">interno</SelectItem>
                      <SelectItem value="spam">spam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Orden</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={prioritySort} onValueChange={(v) => setPrioritySort(v as any)}>
                  <DropdownMenuRadioItem value="none">Por fecha</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="priority">Prioridad</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="category_priority">Categoría + Prioridad</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? `Importando (${importDone}/${importTotal})` : "Importar JSON"}
            </Button>

            <input
              ref={fileInputRef}
              id="file-upload-emails"
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={handleFileUpload}
            />
            <Button 
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              disabled={selectedIds.size === 0 || isProcessingIA}
              onClick={processWithIA}
            >
              <Sparkles className="h-4 w-4" />
              {isProcessingIA ? `Procesando... (${selectedIds.size})` : `Procesar con IA (${selectedIds.size})`}
            </Button>
            <Button 
              variant="destructive"
              className="gap-2"
              disabled={selectedIds.size === 0}
              onClick={deleteEmails}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar ({selectedIds.size})
            </Button>
          </div>
        </div>
      </Card>
      {isImporting && (
        <Card className="p-4 border-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Importando</span>
              <span>{importDone}/{importTotal}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded">
              <div
                className="h-2 bg-primary rounded"
                style={{ width: `${importTotal ? Math.round((importDone / importTotal) * 100) : 0}%` }}
              />
            </div>
            {importFailed > 0 && (
              <div className="text-xs text-red-600">Fallidos: {importFailed}</div>
            )}
          </div>
        </Card>
      )}

      {/* Eliminada la segunda barra de acciones redundante */}

      {/* Email Table */}
      <Card className="shadow-card border-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-b-2 border-slate-200 dark:border-slate-700">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded border-2 border-slate-300 dark:border-slate-600"
                  onChange={(e) => selectAll(e.currentTarget.checked)}
                />
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Remitente
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Asunto
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Procesado
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categoría
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Prioridad
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Tarea IA
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmails.map((email, index) => {
              const priorityInfo = getPriorityBadge(email.priority);
              // Determinar el color del borde según prioridad
              let borderColor = '#94a3b8'; // slate-400 default
              if (email.priority === 'alta') {
                borderColor = '#ef4444'; // red-500
              } else if (email.priority === 'media') {
                borderColor = '#f59e0b'; // amber-500
              } else if (email.priority === 'baja') {
                borderColor = '#10b981'; // emerald-500
              }
              
              return (
                <TableRow
                  key={email.id}
                  style={{ borderLeft: `4px solid ${borderColor}` }}
                  className={`
                    relative transition-all duration-200 cursor-pointer
                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-slate-50/50 dark:bg-slate-900/50'}
                    ${email.processed ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''}
                    hover:bg-slate-100 dark:hover:bg-slate-800
                    hover:shadow-md hover:scale-[1.01]
                  `}
                  onClick={() => handleRowClick(email)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-2 border-slate-300 dark:border-slate-600"
                      checked={selectedIds.has(email.id)}
                      onChange={(e) => toggleSelect(email.id, e.currentTarget.checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {email.email[0].toUpperCase()}
                      </div>
                      <span className="truncate max-w-[200px]">{email.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate font-medium text-slate-800 dark:text-slate-200" title={email.subject}>
                      {email.subject}
                    </div>
                  </TableCell>
                  <TableCell>
                    {email.processed ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">Procesado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">Pendiente</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {email.category ? (
                      <Badge variant="outline" className={`${getCategoryBadge(email.category)} font-semibold text-xs px-2.5 py-1`}>
                        {email.category}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {email.priority ? (
                      <Badge className={`${priorityInfo.bg} font-semibold text-xs px-2.5 py-1`}>
                        <span className="flex items-center gap-1.5">
                          {priorityInfo.icon}
                          <span className="uppercase">{email.priority}</span>
                        </span>
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {email.hasTask && email.taskDescription ? (
                      <div 
                        className="flex items-center gap-2 cursor-help" 
                        title={email.taskDescription}
                      >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-violet-700 dark:text-violet-400 font-medium text-sm">Tarea IA</span>
                      </div>
                    ) : email.hasTask ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center shadow-sm">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-violet-600 dark:text-violet-400 font-medium text-sm">Sí</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {new Date(email.received_at).toLocaleDateString("es-ES", {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="p-4 shadow-card border-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {emails.length} de {total} emails
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="text-sm font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

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

export default EmailsView;
