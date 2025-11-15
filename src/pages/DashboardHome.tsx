import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import QuickAccessCard from "@/components/QuickAccessCard";
import { Card } from "@/components/ui/card";
import { Mail, Clock, CheckCircle2, AlertCircle, RefreshCw, Upload, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EmailDetailsDialog from "@/components/EmailDetailsDialog";

const DashboardHome = () => {
  const [currentTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["emails", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/emails/stats");
      const json = await res.json();
      return json.stats as { totalEmails: number; unprocessedEmails: number; pendingTasks: number; completedTasks: number };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["emails", "recent"],
    queryFn: async () => {
      const res = await fetch(`/api/emails?sort=desc`);
      const json = await res.json();
      return (json.emails as any[]).slice(0, 5);
    },
  });

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("emails:refresh", handler as EventListener);
    return () => window.removeEventListener("emails:refresh", handler as EventListener);
  }, [refetch]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("es-ES", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return;
    }
    const res = await fetch("/api/emails/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    if (res.ok) {
      window.dispatchEvent(new CustomEvent("emails:refresh"));
      refetch();
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div>
          <h1 className="text-3xl font-normal text-foreground">
            {getGreeting()}, Usuario
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{formatDate()}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className="h-4 w-4" />
            {isFetching ? "Actualizando" : "Refrescar"}
          </Button>
          <label htmlFor="file-upload-home">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              Importar Emails
            </Button>
            <input
              id="file-upload-home"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard
          title="Total de Emails"
          value={data?.totalEmails ?? 0}
          description="Todos los emails en el sistema"
          icon={Mail}
        />
        <StatsCard
          title="Emails sin Procesar"
          value={data?.unprocessedEmails ?? 0}
          description="Pendientes de IA"
          icon={Clock}
          iconColor="text-yellow-500"
        />
        <StatsCard
          title="Tareas Pendientes"
          value={data?.pendingTasks ?? 0}
          description="Por hacer / En progreso"
          icon={AlertCircle}
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Tareas Completadas"
          value={data?.completedTasks ?? 0}
          description="Cerradas"
          icon={CheckCircle2}
          iconColor="text-green-500"
        />
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickAccessCard
          title="Ver Todos los Emails"
          description="Tabla interactiva con búsqueda y filtros"
          icon={Mail}
          href="/dashboard/emails"
        />
        <QuickAccessCard
          title="Ir al Kanban"
          description="Tareas por estado (visual)"
          icon={CheckCircle2}
          href="/dashboard/kanban"
        />
      </div>

      {/* Recent Emails Section */}
      <Card className="p-8 border-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-foreground">Emails Recientes</h2>
          <Button variant="link" className="text-primary" asChild>
            <a href="/dashboard/emails" className="flex items-center gap-1">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {Array.isArray(recent) && recent.length > 0 ? (
          <div className="space-y-3">
            {recent.map((e: any) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-4 border rounded-md cursor-pointer hover:bg-muted/40"
                onClick={() => {
                  setSelectedEmail({
                    id: e.id,
                    email: e.sender,
                    subject: e.subject,
                    received_at: e.receivedAt,
                    body: e.body,
                    processed: e.processed,
                    category: e.category ?? undefined,
                    priority: e.priority ?? undefined,
                    hasTask: e.hasTask ?? false,
                    taskDescription: e.taskDescription ?? undefined,
                  });
                  setDialogOpen(true);
                }}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground truncate">{e.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.sender}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.receivedAt).toLocaleDateString("es-ES")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-normal text-foreground mb-2">Sin emails recientes</h3>
            <p className="text-sm text-muted-foreground mb-6">Aún no hay datos disponibles. Importa un archivo JSON para comenzar.</p>
            <Button className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Importar Archivo JSON
            </Button>
            <input
              ref={fileInputRef}
              id="file-upload-empty"
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </div>
        )}
      </Card>

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

export default DashboardHome;
