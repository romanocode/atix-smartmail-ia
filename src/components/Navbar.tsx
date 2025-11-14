import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Atix</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Nosotros
            </Link>
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Tarifas
            </Link>
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contacto
            </Link>
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Únete ahora
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hidden md:inline-flex">
                Conectar cuenta
              </Button>
            </Link>
            {isHome && (
              <Link to="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">
                  Ir al Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
