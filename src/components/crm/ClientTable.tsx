import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Client {
  id: number;
  nomewpp: string;
  telefone: string;
  ASSUNTO: string;
  STATUS: string;
  created_at: string;
  etapa_atendimento: string;
}

export const ClientTable = ({ clients }: { clients: Client[] }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'concluido': return 'bg-green-100 text-green-700 border-green-200';
      case 'em atendimento': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pendente': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Telefone</TableHead>
            <TableHead className="font-semibold">Assunto</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Etapa</TableHead>
            <TableHead className="font-semibold">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell className="font-medium">{client.nomewpp || "Sem nome"}</TableCell>
              <TableCell className="text-muted-foreground">{client.telefone}</TableCell>
              <TableCell className="max-w-[200px] truncate">{client.ASSUNTO || "N/A"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(client.STATUS)}>
                  {client.STATUS || "Indefinido"}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {client.etapa_atendimento || "0"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {client.created_at ? format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR }) : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};