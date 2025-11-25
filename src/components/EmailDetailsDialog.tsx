import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, User, Tag, Flag, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";

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

interface EmailDetailsDialogProps {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmailDetailsDialog = ({ email, open, onOpenChange }: EmailDetailsDialogProps) => {
  console.log('EmailDetailsDialog render', { open, email });
    // Bloquear scroll del body y forzar scroll al tope cuando el modal está abierto
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [open]);
  const [category, setCategory] = useState<string>(email?.category || "cliente");
  const [priority, setPriority] = useState<string>(email?.priority || "baja");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [hasTask, setHasTask] = useState<boolean>(false);

  useEffect(() => {
    if (email) {
      setCategory(email.category || "cliente");
      setPriority(email.priority || "baja");
      setTaskDescription(email.taskDescription || "");
      setHasTask(!!email.hasTask);
    }
  }, [email]);

  if (!email) return null;

  const markOneProcessed = async (processed: boolean) => {
    const res = await fetch("/api/emails/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [email.id], processed }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success(processed ? "Procesado" : "Desmarcado");
      window.dispatchEvent(new CustomEvent("emails:refresh"));
      onOpenChange(false);
    } else {
      toast.error(json.error || "Error al actualizar");
    }
  };

  const saveMetadata = async () => {
    const res = await fetch("/api/emails/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: email.id, hasTask, category, priority, taskDescription }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success("Cambios guardados");
      window.dispatchEvent(new CustomEvent("emails:refresh"));
      onOpenChange(false);
    } else {
      toast.error(json.error || "Error al guardar");
    }
  };

  const deleteEmail = async () => {
    if (!confirm("¿Eliminar este email? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      const res = await fetch("/api/emails/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email.id }),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success(json.message || "Email eliminado correctamente");
        window.dispatchEvent(new CustomEvent("emails:refresh"));
        onOpenChange(false);
      } else {
        toast.error(json.error || "Error al eliminar email");
      }
    } catch (error) {
      toast.error("Error de conexión al eliminar email");
      console.error(error);
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
    const variants: Record<string, string> = {
      alta: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      baja: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
    return variants[priority || "baja"];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-full w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 z-[9999] p-0 flex flex-col items-center justify-center"
        style={{ maxHeight: '90vh', overflow: 'auto', margin: '0 auto' }}
      >
        <div className="w-full max-w-2xl mx-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl break-words">{email.subject}</DialogTitle>
            <DialogDescription>Detalles completos del email</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">De:</span>
                <span className="font-medium break-all">{email.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">
                  {new Date(email.received_at).toLocaleString("es-ES")}
                </span>
              </div>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {email.category && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Badge className={getCategoryBadge(email.category)}>
                    {email.category}
                  </Badge>
                </div>
              )}
              {email.priority && (
                <div className="flex items-center gap-1.5">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <Badge className={getPriorityBadge(email.priority)}>
                    Prioridad {email.priority}
                  </Badge>
                </div>
              )}
              {email.hasTask && (
                <Badge className="bg-primary/10 text-primary">Tiene tarea</Badge>
              )}
              <Badge className={email.processed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {email.processed ? "Procesado" : "No procesado"}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Categoría</label>
                  <select
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="cliente">cliente</option>
                    <option value="lead">lead</option>
                    <option value="interno">interno</option>
                    <option value="spam">spam</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Prioridad</label>
                  <select
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                  >
                    <option value="alta">alta</option>
                    <option value="media">media</option>
                    <option value="baja">baja</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Input type="checkbox" checked={hasTask} onChange={(e) => setHasTask(e.currentTarget.checked)} />
                  <span className="text-xs text-muted-foreground">Convertir en tarea</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Descripción de tarea</label>
                <Textarea className="mt-1" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button onClick={saveMetadata}>Guardar cambios</Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="destructive" onClick={deleteEmail} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar email
              </Button>
            </div>

            {/* Email Body */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground">Contenido</h4>
              <div className="bg-muted/30 p-4 rounded-lg border border-border max-h-64 overflow-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {email.body ||
                    "Este es el contenido del email. En la versión completa, aquí se mostrará el cuerpo completo del mensaje con formato preservado."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDetailsDialog;
