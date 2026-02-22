import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CRMStats } from "@/components/crm/CRMStats";
import { ClientTable } from "@/components/crm/ClientTable";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { ClientDetailModal } from "@/components/crm/ClientDetailModal";
import { LeadCharts } from "@/components/crm/LeadCharts";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, LayoutGrid, List, LogOut, Database, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

const CRM = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("kanban");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dados_cliente')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error("Erro Supabase:", error);
      showError("Erro ao carregar: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();

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
  }, [fetchClients]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

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

  const handleClientClick = (client: any) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard de Leads</h1>
            <p className="text-slate-500 font-medium">Gestão inteligente do seu funil de vendas.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar lead..." 
                className="pl-10 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleLogout}
              className="bg-white rounded-xl border-slate-200 text-red-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchClients}
              disabled={loading}
              className="bg-white rounded-xl border-slate-200"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <CRMStats {...stats} />

        {/* Main Content Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {activeTab === 'kanban' ? 'Fluxo de Atendimento' : activeTab === 'table' ? 'Base de Clientes' : 'Análise de Dados'}
              <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredClients.length}
              </span>
            </h2>
            
            <TabsList className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <TabsTrigger value="kanban" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-blue-600">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="table" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-blue-600">
                <List className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="charts" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-blue-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Gráficos
              </TabsTrigger>
            </TabsList>
          </div>

          {loading ? (
            <div className="h-[400px] flex items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-slate-500 font-medium">Carregando seus dados...</p>
              </div>
            </div>
          ) : clients.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="flex flex-col items-center gap-4 text-center max-w-xs">
                <div className="p-4 bg-slate-50 rounded-full">
                  <Database className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Nenhum dado encontrado</h3>
                <p className="text-slate-500 text-sm">
                  Sua tabela <code className="bg-slate-100 px-1 rounded">dados_cliente</code> parece estar vazia ou as políticas de RLS estão bloqueando o acesso.
                </p>
                <Button onClick={fetchClients} variant="outline" className="rounded-xl">
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="kanban" className="mt-0">
                <KanbanBoard clients={filteredClients} onClientClick={handleClientClick} />
              </TabsContent>
              <TabsContent value="table" className="mt-0">
                <ClientTable clients={filteredClients} />
              </TabsContent>
              <TabsContent value="charts" className="mt-0">
                <LeadCharts data={clients} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <ClientDetailModal 
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={fetchClients}
      />
    </div>
  );
};

export default CRM;