import DashboardLayout from "@/pages/DashboardLayout";
import KanbanView from "@/pages/KanbanView";

export default function Page() {
  return (
    <DashboardLayout>
      <KanbanView />
    </DashboardLayout>
  );
}