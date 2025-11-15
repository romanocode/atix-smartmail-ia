import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
}

const StatsCard = ({ title, value, description, icon: Icon, iconColor = "text-muted-foreground" }: StatsCardProps) => {
  return (
    <Card className="p-8 border-0">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-normal text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-normal text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={`p-3 rounded-lg bg-muted ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
