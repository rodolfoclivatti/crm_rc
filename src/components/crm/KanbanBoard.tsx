import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MessageSquare, Clock, PlayCircle, CheckCircle } from "lucide-react";

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
  // Mapeamento das fases do funil baseadas na coluna STATUS
  const columns = [
    { id: 'PENDENTE', title: 'Novos Leads', color: 'bg-amber-500', icon: Clock },
    { id: 'EM ATENDIMENTO', title: 'Em Atendimento', color: 'bg-blue-500', icon: PlayCircle },
    { id: 'CONCLUIDO', title: 'Concluídos', color: 'bg-emerald-500', icon: CheckCircle },
  ];

  const getClientsByStatus = (status: string) => 
    clients.filter(c => (c.STATUS || 'PENDENTE').toUpperCase() === status.toUpperCase());

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
      {columns.map((column) => {
        const columnClients = getClientsByStatus(column.id);
        const Icon = column.icon;

        return (
          <div key={column.id} className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${column.color} text-white`}>
                  <Icon size={16} />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">{column.title}</h3>
              </div>
              <Badge variant="secondary" className="bg-white text-slate-600 border-slate-100 shadow-sm">
                {columnClients.length}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 custom-scrollbar">
              {columnClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <p className="text-xs font-medium">Nenhum lead aqui</p>
                </div>
              ) : (
                columnClients.map((client) => (
                  <Card 
                    key={client.id} 
                    className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-none shadow-sm group bg-white"
                    onClick={() => onClientClick(client)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <User size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm truncate max-w-[130px]">
                              {client.nomewpp || "Sem nome"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ID: #{client.id}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 border-slate-100 text-slate-600">
                          Etapa {client.etapa_atendimento || "0"}
                        </Badge>
                      </div>
                      
                      <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {client.ASSUNTO || "Sem descrição do interesse..."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone size={12} className="text-blue-500" />
                          <span className="text-[11px] font-semibold">{client.telefone}</span>
                        </div>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                            <MessageSquare size={10} className="text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};