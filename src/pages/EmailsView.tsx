import { useEffect, useMemo, useState } from "react";
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
      received_at: z.string(),
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
      toast.error("El JSON no cumple el formato requerido");
      return;
    }
    const res = await fetch("/api/emails/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe.data),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success(`Importados ${json.imported} emails`);
      refetch();
    } else {
      toast.error(json.error || "Error al importar");
    }
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

  const filteredEmails = useMemo(() => emails, [emails]);

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
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              Ordenar por fecha ({sortOrder})
            </Button>
            <label htmlFor="file-upload-emails">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Upload className="h-4 w-4" />
                Importar JSON
              </Button>
              <input
                id="file-upload-emails"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
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
            <Button className="gap-2 bg-purple text-white hover:bg-purple/90">
              <Sparkles className="h-4 w-4" />
              Procesar con IA
            </Button>
          </div>
        </div>
      </Card>

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
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default EmailsView;
