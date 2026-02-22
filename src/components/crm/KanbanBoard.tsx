import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MessageSquare } from "lucide-react";

interface Client {
  id: number;
  nomewpp: string;
  telefone: string;
  ASSUNTO: string;
  STATUS: string;
  etapa_atendimento: string;
}

interface KanbanBoardProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
}

export const KanbanBoard = ({ clients, onClientClick }: KanbanBoardProps) => {
  const columns = [
    { id: 'PENDENTE', title: 'Novos Leads', color: 'bg-orange-500' },
    { id: 'EM ATENDIMENTO', title: 'Em Atendimento', color: 'bg-blue-500' },
    { id: 'CONCLUIDO', title: 'Concluídos', color: 'bg-green-500' },
  ];

  const getClientsByStatus = (status: string) => 
    clients.filter(c => (c.STATUS || 'PENDENTE').toUpperCase() === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col gap-4 bg-slate-100/50 p-4 rounded-2xl border border-slate-200/60">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${column.color}`} />
              <h3 className="font-bold text-slate-700">{column.title}</h3>
            </div>
            <Badge variant="secondary" className="bg-white text-slate-600 border-slate-200">
              {getClientsByStatus(column.id).length}
            </Badge>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 custom-scrollbar">
            {getClientsByStatus(column.id).map((client) => (
              <Card 
                key={client.id} 
                className="cursor-pointer hover:shadow-md transition-all border-none shadow-sm group"
                onClick={() => onClientClick(client)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <User size={16} />
                      </div>
                      <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                        {client.nomewpp || "Sem nome"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      Etapa {client.etapa_atendimento || "0"}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg">
                    {client.ASSUNTO || "Sem assunto definido"}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Phone size={12} />
                      <span className="text-[10px]">{client.telefone}</span>
                    </div>
                    <MessageSquare size={14} className="text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};