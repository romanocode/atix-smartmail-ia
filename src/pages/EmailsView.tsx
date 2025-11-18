import { useEffect, useMemo, useRef, useState } from "react";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importTotal, setImportTotal] = useState(0);
  const [importDone, setImportDone] = useState(0);
  const [importFailed, setImportFailed] = useState(0);
  const [processedFilter, setProcessedFilter] = useState<"all" | "processed" | "unprocessed">("all");
  const [taskOnly, setTaskOnly] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [prioritySort, setPrioritySort] = useState<"none" | "priority" | "category_priority">("none");
  const [isProcessingIA, setIsProcessingIA] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["emails", searchTerm, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({ q: searchTerm, sort: sortOrder });
      const res = await fetch(`/api/emails?${params.toString()}`);
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
        processed: e.processed ?? false,
      }));
      setEmails(mapped);
      setSelectedIds(new Set());
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

    setIsImporting(false);
    setImportFailed(failedCount);
    if (failedCount > 0) {
      toast.error(`Fallidos ${failedCount}. Importados ${importedCount}.`);
    } else {
      toast.success(`Importados ${importedCount} emails`);
    }
    setSelectedIds(new Set());
    refetch();
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
    const res = await fetch("/api/emails/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, processed }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success(
        processed
          ? `Marcados como procesados (${json.count})`
          : `Desmarcados (${json.count})`
      );
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

  return (
    <div className="space-y-6">
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
            <Button variant="ghost" className="gap-2" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              Ordenar por fecha ({sortOrder})
            </Button>
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
              variant="outline"
              className="gap-2"
              disabled={selectedIds.size === 0}
              onClick={() => {
                const selected = emails.filter((e) => selectedIds.has(e.id));
                const blob = new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `emails-seleccion-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success(`Exportados ${selected.length} emails`);
              }}
            >
              Exportar selección
            </Button>
            <Button
              variant="default"
              className="gap-2"
              disabled={selectedIds.size === 0}
              onClick={() => markProcessed(true)}
            >
              Marcar procesados ({selectedIds.size})
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              disabled={selectedIds.size === 0}
              onClick={() => markProcessed(false)}
            >
              Desmarcar
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              disabled={selectedIds.size === 0 || isProcessingIA}
              onClick={processWithIA}
            >
              <Sparkles className="h-4 w-4" />
              {isProcessingIA ? `Procesando... (${selectedIds.size})` : `Procesar con IA (${selectedIds.size})`}
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

      {/* Email Table */}
      <Card className="shadow-card border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded"
                  onChange={(e) => selectAll(e.currentTarget.checked)}
                />
              </TableHead>
              <TableHead>Remitente</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Procesado</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Tarea</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmails.map((email) => {
              const priorityInfo = getPriorityBadge(email.priority);
              return (
                <TableRow
                  key={email.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleRowClick(email)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedIds.has(email.id)}
                      onChange={(e) => toggleSelect(email.id, e.currentTarget.checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{email.email}</TableCell>
                  <TableCell className="max-w-md truncate">{email.subject}</TableCell>
                  <TableCell>
                    {email.processed ? (
                      <Badge className="bg-green-100 text-green-800">Sí</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {email.category && (
                      <Badge className={getCategoryBadge(email.category)}>
                        {email.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {email.priority && (
                      <Badge className={priorityInfo.bg}>
                        <span className="flex items-center gap-1">
                          {priorityInfo.icon}
                          {email.priority}
                        </span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {email.hasTask ? (
                      <Badge className="bg-primary/10 text-primary">Sí</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(email.received_at).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {email.processed ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markOneProcessed(email.id, false)}
                      >
                        Desmarcar
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => markOneProcessed(email.id, true)}
                      >
                        Marcar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={async () => {
                        const res = await fetch("/api/emails/update", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: email.id, hasTask: true }),
                        });
                        const json = await res.json();
                        if (res.ok) {
                          toast.success("Convertido en tarea");
                          window.dispatchEvent(new CustomEvent("emails:refresh"));
                          refetch();
                        } else {
                          toast.error(json.error || "Error al convertir");
                        }
                      }}
                    >
                      Convertir en tarea
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

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
