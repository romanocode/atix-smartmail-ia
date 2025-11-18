import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import QuickAccessCard from "@/components/QuickAccessCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle2, AlertCircle, RefreshCw, Upload, ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EmailDetailsDialog from "@/components/EmailDetailsDialog";
import { useSession } from "next-auth/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DashboardHome = () => {
  const { data: session } = useSession();
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

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, direction: 'neutral' as const };
    const percentage = Math.round(((current - previous) / previous) * 100);
    if (percentage > 0) return { percentage, direction: 'up' as const };
    if (percentage < 0) return { percentage: Math.abs(percentage), direction: 'down' as const };
    return { percentage: 0, direction: 'neutral' as const };
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div>
          <h1 className="text-3xl font-normal text-foreground">
            {getGreeting()}, {session?.user?.name?.split(" ")[0] || "Usuario"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{formatDate()}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className="h-4 w-4" />
            {isFetching ? "Actualizando" : "Refrescar"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatsCard
          title="Total de Emails"
          value={data?.totalEmails ?? 0}
          description="Todos los emails en el sistema"
          icon={Mail}
        />
        <StatsCard
          title="Tareas Pendientes"
          value={data?.pendingTasks ?? 0}
          description="Por hacer / En progreso"
          icon={AlertCircle}
          iconColor="text-orange-500"
        />
      </div>

      {/* Panel de Alertas - Emails Alta Prioridad Sin Procesar */}
      {data?.highPriorityUnprocessed && data.highPriorityUnprocessed.length > 0 && (
        <Card className="p-6 border-2 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Alertas de Alta Prioridad</h2>
              <p className="text-sm text-red-700 dark:text-red-300">{data.highPriorityUnprocessed.length} email{data.highPriorityUnprocessed.length > 1 ? 's' : ''} sin procesar</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.highPriorityUnprocessed.map((email: any) => (
              <div
                key={email.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedEmail({
                    id: email.id,
                    email: email.sender,
                    subject: email.subject,
                    received_at: email.receivedAt,
                    category: email.category,
                    priority: 'alta',
                  });
                  setDialogOpen(true);
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-red-500 text-white text-[10px] px-2 py-0.5">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      ALTA
                    </Badge>
                    {email.category && (
                      <Badge variant="outline" className="text-[10px]">{email.category}</Badge>
                    )}
                  </div>
                  <div className="text-sm font-medium text-foreground truncate">{email.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">{email.sender}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(email.receivedAt).toLocaleDateString("es-ES")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grid: Gráfico Kanban (70%) + Quick Access (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Gráfico de Barras - Estado del Kanban - 70% */}
        <div className="lg:col-span-7">
          <Card className="p-6 border-0 h-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">Estado del Tablero Kanban</h2>
              <p className="text-sm text-muted-foreground">Distribución de tareas por columna</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { 
                    name: 'Por Hacer', 
                    cantidad: data?.todoTasks ?? 0,
                    color: '#64748b'
                  },
                  { 
                    name: 'En Progreso', 
                    cantidad: data?.inProgressTasks ?? 0,
                    color: '#f59e0b'
                  },
                  { 
                    name: 'Completadas', 
                    cantidad: data?.completedTasks ?? 0,
                    color: '#10b981'
                  },
                ]}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  stroke="#6b7280"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="cantidad" 
                  radius={[0, 8, 8, 0]}
                  label={{ position: 'right', fill: '#374151', fontWeight: 600 }}
                >
                  {[
                    { name: 'Por Hacer', color: '#64748b' },
                    { name: 'En Progreso', color: '#f59e0b' },
                    { name: 'Completadas', color: '#10b981' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Access Cards - 30% apilados verticalmente */}
        <div className="lg:col-span-3 flex flex-col gap-8">
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
      </div>

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
