import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, CheckCircle2, Clock } from "lucide-react";

interface CRMStatsProps {
  totalLeads: number;
  activeChats: number;
  completed: number;
  pending: number;
}

export const CRMStats = ({ totalLeads, activeChats, completed, pending }: CRMStatsProps) => {
  const stats = [
    { title: "Total de Leads", value: totalLeads, icon: Users, color: "text-blue-600" },
    { title: "Atendimentos Ativos", value: activeChats, icon: MessageSquare, color: "text-purple-600" },
    { title: "Concluídos", value: completed, icon: CheckCircle2, color: "text-green-600" },
    { title: "Aguardando", value: pending, icon: Clock, color: "text-orange-600" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};