import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Mail, Sparkles, BarChart3, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";
import featuresIllustration from "@/assets/features-illustration.png";
import kanbanIllustration from "@/assets/kanban-illustration.png";
import aiIllustration from "@/assets/ai-illustration.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-foreground">
                Una comisión baja,
                <br />
                <span className="text-primary">te hace volar alto</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Atix es la única plataforma que organiza tus emails con IA y convierte cada mensaje en oportunidades de negocio reales.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                    Únete ahora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="rounded-full px-8">
                    Ver demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroIllustration} 
                alt="Hero illustration" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Purple Background */}
      <section className="py-20 px-6 bg-gradient-purple">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src={featuresIllustration} 
                alt="Features illustration" 
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                La flexibilidad de pagos que tú y tus clientes necesitan
              </h2>
              <p className="text-white/90 text-lg">
                Procesa emails automáticamente con IA, detecta tareas importantes y mantén todo organizado en un tablero visual.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-white flex-shrink-0 mt-1" />
                  <span className="text-white/90">Sin costo de afiliación</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-white flex-shrink-0 mt-1" />
                  <span className="text-white/90">Sin costo de mantenimiento</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-white flex-shrink-0 mt-1" />
                  <span className="text-white/90">Sin costo de integración</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-cream">
        <div className="container mx-auto">
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12">
              ¡Solo te cobramos por transacción exitosa!
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white shadow-card border-0">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">• Sin costo de afiliación •</p>
                </div>
              </Card>
              <Card className="p-6 bg-white shadow-card border-0">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">• Sin costo de mantenimiento •</p>
                </div>
              </Card>
              <Card className="p-6 bg-white shadow-card border-0">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">• Sin costo de integración •</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Goals Section - Purple Background */}
      <section className="py-20 px-6 bg-gradient-purple">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tus metas en Atix se transforman en logros
            </h2>
            <p className="text-white/90 text-lg">
              Organiza, prioriza y completa más tareas en menos tiempo
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mx-auto w-32 h-32 flex items-center justify-center">
                <Mail className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg">Ahorra tu plata</h3>
              <p className="text-white/80 text-sm">Procesa cientos de emails en segundos</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mx-auto w-32 h-32 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg">Haz que tu dinero valga</h3>
              <p className="text-white/80 text-sm">IA detecta oportunidades automáticamente</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mx-auto w-32 h-32 flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg">Gana lo que más deseas</h3>
              <p className="text-white/80 text-sm">Visualiza tu progreso en tiempo real</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mx-auto w-32 h-32 flex items-center justify-center">
                <Users className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg">Crece más</h3>
              <p className="text-white/80 text-sm">Escala tu productividad sin límites</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            ¿Estás desaprovechando tu Atix?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de ejecutivos que ya transformaron su forma de trabajar con emails
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
              Únete ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-neutral-dark text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Atix</span>
              </div>
              <p className="text-sm text-white/70">
                La plataforma de gestión de emails con IA más poderosa del mercado
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/">Características</Link></li>
                <li><Link to="/">Precios</Link></li>
                <li><Link to="/">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/">Sobre nosotros</Link></li>
                <li><Link to="/">Blog</Link></li>
                <li><Link to="/">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/">Privacidad</Link></li>
                <li><Link to="/">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/70">
            © 2024 Atix. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
