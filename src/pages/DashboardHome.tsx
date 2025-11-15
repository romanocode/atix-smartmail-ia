import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import QuickAccessCard from "@/components/QuickAccessCard";
import { Card } from "@/components/ui/card";
import { Mail, Clock, CheckCircle2, AlertCircle, RefreshCw, Upload, ArrowRight } from "lucide-react";
import { useState } from "react";

const DashboardHome = () => {
  const [currentTime] = useState(new Date());

  const stats = {
    totalEmails: 0,
    unprocessedEmails: 0,
    pendingTasks: 0,
    completedTasks: 0,
  };

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File uploaded:", file.name);
      // TODO: Implement JSON parsing
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
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refrescar
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
          value={stats.totalEmails}
          description="Todos los emails en el sistema"
          icon={Mail}
        />
        <StatsCard
          title="Emails sin Procesar"
          value={stats.unprocessedEmails}
          description="Pendientes de IA"
          icon={Clock}
          iconColor="text-yellow-500"
        />
        <StatsCard
          title="Tareas Pendientes"
          value={stats.pendingTasks}
          description="Por hacer / En progreso"
          icon={AlertCircle}
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Tareas Completadas"
          value={stats.completedTasks}
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

        <div className="text-center py-16">
          <div className="mb-4">
            <Mail className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-normal text-foreground mb-2">
            Sin emails recientes
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Aún no hay datos disponibles. Importa un archivo JSON para comenzar.
          </p>
          <label htmlFor="file-upload-empty">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Importar Archivo JSON
            </Button>
            <input
              id="file-upload-empty"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </Card>
    </div>
  );
};

export default DashboardHome;
