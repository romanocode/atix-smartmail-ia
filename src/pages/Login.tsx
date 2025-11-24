import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
 
import { useState } from "react";
import { toast } from "sonner";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Error al iniciar sesión. Intenta de nuevo.");
      setIsLoading(false);
    }
  };

 

  return (
    <div className="min-h-screen bg-gradient-purple flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white mb-8 hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        <Card className="p-8 shadow-soft border-0">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bienvenido a Atix
            </h1>
            <p className="text-muted-foreground">
              Inicia sesión para acceder a tu panel de control
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-foreground border border-border shadow-sm"
              size="lg"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Conectando..." : "Continuar con Google"}
            </Button>

 
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Al continuar, aceptas nuestros{" "}
            <Link href="/" className="text-primary hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
