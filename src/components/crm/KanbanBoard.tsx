import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MessageSquare, Clock, PlayCircle, CheckCircle, AlertCircle, Send, FileText, UserCheck, XCircle } from "lucide-react";

interface Client {
  id: number;
  nomewpp: string;
  telefone: string;
  ASSUNTO: string;
  STATUS: string;
  etapa_atendimento: string;
  ORIGEM: string;
}

interface KanbanBoardProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
}

const KANBAN_COLUMNS = [
  { id: 'PENDENTE', title: 'Novos Leads', color: '#FCD34D', icon: Clock },
  { id: 'EM ATENDIMENTO', title: 'Em Atendimento', color: '#6EE7FA', icon: PlayCircle },
  { id: 'followup', title: 'Follow-up', color: '#FCD34D', icon: MessageSquare },
  { id: 'proposta_enviada', title: 'Proposta', color: '#A78BFA', icon: Send },
  { id: 'contrato_enviado', title: 'Contrato', color: '#6EE7FA', icon: FileText },
  { id: 'cliente', title: 'Clientes', color: '#00E5A0', icon: UserCheck },
  { id: 'CONCLUIDO', title: 'Concluídos', color: '#00E5A0', icon: CheckCircle },
  { id: 'desqualificado', title: 'Desqualificado', color: '#F87171', icon: AlertCircle },
  { id: 'perdido', title: 'Perdido', color: '#6B7280', icon: XCircle },
];

export const KanbanBoard = ({ clients, onClientClick }: KanbanBoardProps) => {
  const getClientsByStatus = (status: string) => 
    clients.filter(c => (c.STATUS || 'PENDENTE').toUpperCase() === status.toUpperCase());

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] custom-scrollbar">
      {KANBAN_COLUMNS.map((column) => {
        const columnClients = getClientsByStatus(column.id);
        const Icon = column.icon;

        return (
          <div key={column.id} className="flex flex-col gap-4 min-w-[320px] max-w-[320px] bg-white/5 p-4 rounded-3xl border border-white/10 shadow-sm">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${column.color}22`, color: column.color }}>
                  <Icon size={16} />
                </div>
                <h3 className="font-bold text-white text-sm tracking-tight">{column.title}</h3>
              </div>
              <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10">
                {columnClients.length}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-350px)] pr-2 custom-scrollbar">
              {columnClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-2xl text-white/20">
                  <p className="text-[10px] font-medium uppercase tracking-widest">Vazio</p>
                </div>
              ) : (
                columnClients.map((client) => (
                  <Card 
                    key={client.id} 
                    className="cursor-pointer hover:bg-white/[0.08] transition-all duration-200 border-white/5 bg-white/5 group"
                    onClick={() => onClientClick(client)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 transition-colors">
                            <User size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs truncate max-w-[150px]">
                              {client.nomewpp || "Sem nome"}
                            </span>
                            <span className="text-[9px] text-white/40 font-mono">
                              ID: #{client.id}
                            </span>
                          </div>
                        </div>
                        {client.ORIGEM && (
                          <Badge variant="outline" className="text-[9px] bg-blue-500/10 border-blue-500/20 text-blue-400 uppercase">
                            {client.ORIGEM}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                        <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                          {client.ASSUNTO || "Sem descrição..."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-white/40">
                          <Phone size={10} className="text-blue-400" />
                          <span className="text-[10px] font-mono">{client.telefone}</span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                          <MessageSquare size={10} className="text-white/40" />
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