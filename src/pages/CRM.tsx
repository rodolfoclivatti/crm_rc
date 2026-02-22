import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CRMStats } from "@/components/crm/CRMStats";
import { ClientTable } from "@/components/crm/ClientTable";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";

const CRM = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dados_cliente')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      showError("Erro ao carregar clientes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dados_cliente' },
        () => fetchClients()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredClients = clients.filter(client => 
    client.nomewpp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefone?.includes(searchTerm) ||
    client.ASSUNTO?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalLeads: clients.length,
    activeChats: clients.filter(c => c.STATUS === 'EM ATENDIMENTO').length,
    completed: clients.filter(c => c.STATUS === 'CONCLUIDO').length,
    pending: clients.filter(c => c.STATUS === 'PENDENTE').length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">CRM de Atendimento</h1>
            <p className="text-slate-500">Gerencie seus leads e atendimentos em tempo real.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchClients}
              disabled={loading}
              className="bg-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar cliente ou assunto..." 
                className="pl-10 bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <CRMStats {...stats} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Lista de Clientes</h2>
            <span className="text-sm text-slate-500">{filteredClients.length} registros encontrados</span>
          </div>
          <ClientTable clients={filteredClients} />
        </div>
      </div>
    </div>
  );
};

export default CRM;