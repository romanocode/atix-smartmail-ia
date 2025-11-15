import Sidebar from "@/components/Sidebar";
import { User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 bg-background">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Usuario Demo
            </Button>
          </div>
        </header>

        <main className="p-6">{children}</main>
        </div>
      </div>
  );
};

export default DashboardLayout;
