import Navbar from "@/components/Navbar";
import { Keyword } from "@/components/Keyword";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Mail, LayoutGrid, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Clock, List, AlertCircle } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-16 px-6 bg-white">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 md:space-y-10">
            <h1 className="text-4xl md:text-5xl font-normal text-foreground flex flex-col gap-3 md:gap-4 lg:gap-6 leading-none">
              <span className="block">Atix‑SmartMail transforma</span>
              <span className="block">tu bandeja en</span>
              <span className="block"><Keyword tight>kanban inteligente</Keyword></span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Inicia sesión con <Keyword tight>Google</Keyword>, importa correos desde tu cuenta de <Keyword tight>Gmail</Keyword> o sube un archivo <Keyword tight>JSON</Keyword>. Nuestra IA filtra, clasifica y prioriza tus emails para convertirlos en tareas claras.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white px-8">
                  Iniciar con Google
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">Importa desde Gmail o JSON y procesa con IA.</span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md border rounded-2xl p-8 bg-white shadow-sm">
              <div className="flex items-center justify-center gap-4 mb-6 text-primary">
                <Mail className="h-8 w-8" />
                <ArrowRight className="h-6 w-6" />
                <LayoutGrid className="h-8 w-8" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-16 border border-primary/20 rounded-md bg-primary/5" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-primary">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-normal text-white mb-8">
            Tu bandeja te está costando tiempo y oportunidades
          </h2>
          <p className="text-white/90 mb-8">
            Entre spam, solicitudes urgentes y tareas ocultas, lo importante se pierde. Atix‑SmartMail utiliza IA para separar ruido de acción y enfocarte en lo que genera valor.
          </p>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-white mt-0.5" />
              <span className="text-white">Clasificar correos consume entre 1 y 2 horas al día</span>
            </li>
            <li className="flex items-start gap-3">
              <List className="h-5 w-5 text-white mt-0.5" />
              <span className="text-white">Las tareas implícitas se olvidan fácilmente</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-white mt-0.5" />
              <span className="text-white">No hay visibilidad clara sobre urgencias</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-white mt-0.5" />
              <span className="text-white">Se pierden oportunidades de negocio</span>
            </li>
          </ul>
          <p className="text-white mt-8">Email-to-Kanban transforma caos en organización real.</p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-8">IA que filtra, clasifica y prioriza</h2>
          <p className="text-muted-foreground mb-10">Conecta tu <Keyword>Gmail</Keyword> o sube un <Keyword>JSON</Keyword>. La IA identifica remitente, asunto y urgencia, detecta si hay tarea y la convierte en elementos accionables dentro de tu <Keyword>Kanban</Keyword>.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border shadow-sm">
              <div className="text-primary mb-3"><Sparkles className="h-6 w-6" /></div>
              <h3 className="font-medium mb-2">Procesamiento Inteligente</h3>
              <p className="text-sm text-muted-foreground">La IA identifica remitente, asunto, prioridad y si el correo contiene una tarea.</p>
            </Card>
            <Card className="p-6 border shadow-sm">
              <div className="text-primary mb-3"><Mail className="h-6 w-6" /></div>
              <h3 className="font-medium mb-2">Clasificación Automática</h3>
              <p className="text-sm text-muted-foreground">Detectamos la categoría: Cliente, Lead, Interno o Spam.</p>
            </Card>
            <Card className="p-6 border shadow-sm">
              <div className="text-primary mb-3"><LayoutGrid className="h-6 w-6" /></div>
              <h3 className="font-medium mb-2">Kanban Visual</h3>
              <p className="text-sm text-muted-foreground">Un tablero claro con columnas: Por hacer, En progreso y Completado.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-primary/5">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-10">Así funciona <Keyword>Atix‑SmartMail</Keyword></h2>
          <div className="grid md:grid-cols-2 gap-8">
            <ul className="space-y-3">
              <li>Inicia sesión con tu cuenta de Google</li>
              <li>Importa correos directamente desde Gmail o sube un JSON</li>
              <li>Procesa con IA para filtrar, clasificar y priorizar</li>
              <li>Convierte correos en tareas dentro del Kanban</li>
              <li>Arrastra, organiza y gestiona tu día</li>
            </ul>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm border rounded-xl p-6 bg-white shadow-sm">
                <div className="flex items-center justify-center gap-3 text-primary mb-4">
                  <Mail className="h-6 w-6" />
                  <ArrowRight className="h-5 w-5" />
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-12 border rounded-md bg-primary/5" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-8">Conexión directa a Gmail y procesamiento IA en minutos.</p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-12">Convierte correos en <Keyword>resultados</Keyword></h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 border border-border shadow-sm">
              <h3 className="font-medium mb-2">Productividad inmediata</h3>
              <p className="text-sm text-muted-foreground">Ahorra 1–2 horas diarias clasificando emails manualmente.</p>
            </Card>
            <Card className="p-6 border border-border shadow-sm">
              <h3 className="font-medium mb-2">Claridad total</h3>
              <p className="text-sm text-muted-foreground">Tareas detectadas automáticamente, con prioridad visible.</p>
            </Card>
            <Card className="p-6 border border-border shadow-sm">
              <h3 className="font-medium mb-2">Sin complicaciones</h3>
              <p className="text-sm text-muted-foreground">No requiere configuración compleja. Sube tu JSON y listo.</p>
            </Card>
            <Card className="p-6 border border-border shadow-sm">
              <h3 className="font-medium mb-2">Organización visual</h3>
              <p className="text-sm text-muted-foreground">Un Kanban moderno para mantener el control en segundos.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-8">Accede de forma segura con tu cuenta de <Keyword>Google</Keyword></h2>
          <p className="text-muted-foreground max-w-3xl">Atix‑SmartMail utiliza autenticación Google OAuth para garantizar seguridad y privacidad. Tu sesión es privada y solo tú puedes ver tus datos.</p>
        </div>
      </section>

      <section className="py-20 px-6 bg-foreground" id="docs">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-normal text-white mb-8">¿Estás desplegando <Keyword>Atix‑SmartMail</Keyword>? Descarga la documentación</h2>
          <p className="text-white/80 mb-6">Encuentra el formato JSON esperado, ejemplos de procesamiento, explicación del flujo y detalles del MVP.</p>
          <Link href="/dashboard">
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-white">Ver documentación</Button>
          </Link>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-8">Estamos más cerca de ti</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Tu nombre" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tucorreo@ejemplo.com" />
              </div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soporte">Soporte</SelectItem>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea id="message" placeholder="Cuéntanos cómo podemos ayudarte" className="min-h-[180px]" />
              <div>
                <Button className="mt-2 rounded-full bg-primary hover:bg-primary/90 text-white">Enviar</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-white">
        <div className="container mx-auto text-center space-y-2">
          <p className="text-sm text-muted-foreground">Proyecto académico desarrollado para fines educativos.</p>
          <p className="text-sm text-muted-foreground">Código bajo licencia MIT.</p>
          <p className="text-sm text-muted-foreground">Email-to-Kanban está inspirado en casos reales de gestión comercial.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
