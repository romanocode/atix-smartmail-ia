import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  Upload,
  Search,
  Filter,
  Sparkles,
  LayoutGrid,
  List,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface Email {
  id: string;
  email: string;
  subject: string;
  received_at: string;
  category?: string;
  priority?: string;
  hasTask?: boolean;
  taskDescription?: string;
}

const Dashboard = () => {
  const [emails, setEmails] = useState<Email[]>([
    {
      id: "1",
      email: "cliente@empresa.com",
      subject: "Reunión urgente - Propuesta Q4",
      received_at: "2024-11-14T09:15:00Z",
      category: "cliente",
      priority: "alta",
      hasTask: true,
      taskDescription: "Preparar presentación para reunión Q4"
    },
    {
      id: "2",
      email: "lead@startup.com",
      subject: "Interesado en sus servicios",
      received_at: "2024-11-14T08:30:00Z",
      category: "lead",
      priority: "media",
      hasTask: true,
      taskDescription: "Enviar cotización y material comercial"
    },
    {
      id: "3",
      email: "equipo@interno.com",
      subject: "Actualización de proyecto",
      received_at: "2024-11-14T07:45:00Z",
      category: "interno",
      priority: "baja",
      hasTask: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement JSON file parsing
      console.log("File uploaded:", file.name);
    }
  };

  const getCategoryBadge = (category?: string) => {
    const variants: Record<string, string> = {
      cliente: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      lead: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      interno: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      spam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return variants[category || ""] || variants.spam;
  };

  const getPriorityBadge = (priority?: string) => {
    const variants: Record<string, { bg: string, icon: React.ReactNode }> = {
      alta: { 
        bg: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", 
        icon: <AlertCircle className="h-3 w-3" />
      },
      media: { 
        bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", 
        icon: <Clock className="h-3 w-3" />
      },
      baja: { 
        bg: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
        icon: <CheckCircle2 className="h-3 w-3" />
      }
    };
    return variants[priority || "baja"];
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Panel de Control
            </h1>
            <p className="text-muted-foreground">
              Gestiona tus emails y tareas con inteligencia artificial
            </p>
          </div>

          <Tabs defaultValue="emails" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="emails" className="gap-2">
                <Mail className="h-4 w-4" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </TabsTrigger>
            </TabsList>

            <TabsContent value="emails" className="space-y-6">
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
                    <label htmlFor="file-upload">
                      <Button className="gap-2 bg-primary hover:bg-primary/90">
                        <Upload className="h-4 w-4" />
                        Importar JSON
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
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
                        <input type="checkbox" className="rounded" />
                      </TableHead>
                      <TableHead>Remitente</TableHead>
                      <TableHead>Asunto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmails.map((email) => {
                      const priorityInfo = getPriorityBadge(email.priority);
                      return (
                        <TableRow key={email.id} className="hover:bg-muted/50 cursor-pointer">
                          <TableCell>
                            <input type="checkbox" className="rounded" />
                          </TableCell>
                          <TableCell className="font-medium">{email.email}</TableCell>
                          <TableCell className="max-w-md truncate">{email.subject}</TableCell>
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
                              <Badge className="bg-primary/10 text-primary">
                                Sí
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">No</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(email.received_at).toLocaleDateString('es-ES')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="kanban" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Por hacer */}
                <Card className="p-6 shadow-card border-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Por hacer</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {emails.filter(e => e.hasTask).length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {emails.filter(e => e.hasTask).map((email) => (
                      <Card key={email.id} className="p-4 bg-muted/30 border border-border hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="space-y-2">
                          <p className="font-medium text-sm">{email.subject}</p>
                          <p className="text-xs text-muted-foreground">{email.email}</p>
                          {email.priority && (
                            <Badge className={getPriorityBadge(email.priority).bg}>
                              {email.priority}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* En progreso */}
                <Card className="p-6 shadow-card border-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">En progreso</h3>
                    <Badge className="bg-yellow-100 text-yellow-800">0</Badge>
                  </div>
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Arrastra tareas aquí
                  </div>
                </Card>

                {/* Completado */}
                <Card className="p-6 shadow-card border-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Completado</h3>
                    <Badge className="bg-green-100 text-green-800">0</Badge>
                  </div>
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Las tareas completadas aparecerán aquí
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
