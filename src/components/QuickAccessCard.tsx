import { Card } from "@/components/ui/card";
import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const QuickAccessCard = ({ title, description, icon: Icon, href }: QuickAccessCardProps) => {
  return (
    <Link href={href}>
      <Card className="p-8 border-0 cursor-pointer group">
        <div className="space-y-3">
          <p className="text-xs font-normal text-muted-foreground">
            Acceso Rápido
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </Card>
    </Link>
  );
};

export default QuickAccessCard;
