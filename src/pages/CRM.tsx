import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { RefreshCw, Trophy, ExternalLink, LayoutGrid, List, LogOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { ClientDetailModal } from "@/components/crm/ClientDetailModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

// ─── CONFIGURAÇÃO DE STATUS / ORIGEM ───────────────────────────────────────────
export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  novo:              { label: "Novo",              color: "#FCD34D" },
  followup:          { label: "Follow-up",         color: "#A78BFA" },
  proposta_enviada:  { label: "Proposta Enviada",  color: "#6EE7FA" },
  contrato_enviado:  { label: "Contrato Enviado",  color: "#3B82F6" },
  cliente:           { label: "Cliente",           color: "#00E5A0" },
  desqualificado:    { label: "Desqualificado",    color: "#F87171" },
  perdido:           { label: "Perdido",           color: "#6B7280" },
  PENDENTE:          { label: "Novo",              color: "#FCD34D" },
  "EM ATENDIMENTO":  { label: "Follow-up",         color: "#A78BFA" },
  CONCLUIDO:         { label: "Cliente",           color: "#00E5A0" },
};

const fmtFull = (v: string) =>
  v ? new Date(v).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }) : "—";

function StatCard({ label, value, sub, accent, icon: Icon, href }: { label: string; value: string | number; sub?: string; accent: string; icon?: any; href?: string }) {
  const CardContent = (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "24px 28px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      position: "relative",
      overflow: "hidden",
      cursor: href ? "pointer" : "default",
      transition: "all 0.2s ease",
    }}
    className={href ? "hover:bg-white/[0.08] hover:-translate-y-1" : ""}
    >
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${accent}22, transparent 70%)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Icon && <Icon size={14} style={{ color: accent }} />}
          <span style={{ fontSize: 12, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" }}>
            {label}
          </span>
        </div>
        {href && <ExternalLink size={12} style={{ color: accent, opacity: 0.6 }} />}
      </div>
      <span style={{ fontSize: 38, fontWeight: 700, color: "#F9FAFB", fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif", lineHeight: 1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 12, color: accent, fontFamily: "'DM Mono', monospace", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</span>}
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
        {CardContent}
      </a>
    );
  }

  return CardContent;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1A1D27", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10, padding: "10px 16px", fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{ color: "#9CA3AF", fontSize: 11, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || "#F9FAFB", fontSize: 13 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function CRM() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dados_cliente')
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setLeads(data || []);
    } catch (e: any) {
      showError("Erro ao conectar: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dados_cliente' }, () => fetchLeads())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLeads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const d = new Date(l.created_at);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      const status = (l.STATUS || "").toLowerCase();
      if (filterStatus !== "todos" && status !== filterStatus.toLowerCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!l.nomewpp?.toLowerCase().includes(q) && !l.telefone?.includes(q) && !l.ASSUNTO?.toLowerCase().includes(q) && !l.ORIGEM?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [leads, search, filterStatus, dateFrom, dateTo]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const clientes = filtered.filter(l => (l.STATUS || "").toLowerCase() === "cliente").length;
    const novos = filtered.filter(l => (l.STATUS || "").toLowerCase() === "novo" || (l.STATUS || "").toUpperCase() === "PENDENTE").length;
    const txConversao = total > 0 ? ((clientes / total) * 100).toFixed(1) : "0";
    
    const originCounts: Record<string, number> = {};
    filtered.forEach(l => { 
      const o = l.ORIGEM || "Orgânico";
      originCounts[o] = (originCounts[o] || 0) + 1; 
    });
    
    const creativeCounts: Record<string, number> = {};
    filtered.forEach(l => { if (l.eventId) creativeCounts[l.eventId] = (creativeCounts[l.eventId] || 0) + 1; });
    const sortedCreatives = Object.entries(creativeCounts).sort((a, b) => b[1] - a[1]);
    const topCreative = sortedCreatives[0] ? { id: sortedCreatives[0][0], count: sortedCreatives[0][1] } : null;
    
    return { total, clientes, novos, txConversao, topCreative, creativeCounts, originCounts };
  }, [filtered]);

  const originData = useMemo(() => {
    const COLORS = ["#6EE7FA", "#A78BFA", "#F472B6", "#00E5A0", "#FCD34D", "#F87171"];
    return Object.entries(kpis.originCounts).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [kpis.originCounts]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(l => { 
      const s = l.STATUS || "novo"; 
      counts[s] = (counts[s] || 0) + 1; 
    });
    return Object.entries(counts).map(([k, v]) => ({
      name: STATUS_CONFIG[k]?.label || k,
      value: v,
      color: STATUS_CONFIG[k]?.color || "#6B7280",
    })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const creativeData = useMemo(() => {
    return Object.entries(kpis.creativeCounts)
      .map(([id, count]) => ({ name: id.length > 15 ? id.substring(0, 15) + "..." : id, fullName: id, leads: count }))
      .sort((a, b) => b.leads - a.leads).slice(0, 5);
  }, [kpis.creativeCounts]);

  const timelineData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(l => {
      const key = new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
      map[key] = (map[key] || 0) + 1;
    });
    const uniqueDates = Array.from(new Set(filtered.map(l => new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })))).reverse();
    return uniqueDates.map(k => ({ data: k, leads: map[k] })).slice(-30);
  }, [filtered]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  if (loading && leads.length === 0) return (
    <div style={{ minHeight: "100vh", background: "#0E1018", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6EE7FA", fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: 2 }}>CONECTANDO AO SUPABASE...</div>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#F9FAFB", padding: "9px 14px", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0E1018", fontFamily: "'DM Sans', sans-serif", color: "#F9FAFB" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        input[type='date']::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
        select option { background: #1A1D27; }
        .row-hover:hover { background: rgba(255,255,255,0.04) !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease both; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6EE7FA", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 6 }}>CRM · PAINEL DE LEADS</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Dashboard de Leads</h1>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="bg-white/5 p-1 rounded-xl border border-white/10">
              <TabsList className="bg-transparent border-none h-9">
                <TabsTrigger value="kanban" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40">
                  <LayoutGrid size={14} className="mr-2" /> Kanban
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40">
                  <List size={14} className="mr-2" /> Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={fetchLeads} disabled={loading} className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-11 rounded-xl">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-white/40 hover:text-red-400 hover:bg-red-400/10 h-11 rounded-xl px-3">
              <LogOut size={18} />
            </Button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
          <StatCard label="Total de Leads" value={kpis.total} sub={`com filtros aplicados`} accent="#6EE7FA" />
          <StatCard label="Clientes" value={kpis.clientes} sub="status = cliente" accent="#00E5A0" />
          <StatCard label="Melhor Criativo" value={kpis.topCreative ? kpis.topCreative.count : 0} sub={kpis.topCreative ? `ID: ${kpis.topCreative.id}` : "Nenhum detectado"} accent="#F472B6" icon={Trophy} href={kpis.topCreative?.id} />
          <StatCard label="Tx. Conversão" value={`${kpis.txConversao}%`} sub="leads → clientes" accent="#A78BFA" />
          <StatCard label="Novos Leads" value={kpis.novos} sub="aguardando atendimento" accent="#FCD34D" />
        </div>

        {/* CHARTS ROW */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>Leads por Período</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={timelineData}>
                <XAxis dataKey="data" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="leads" stroke="#6EE7FA" strokeWidth={2} dot={false} name="Leads" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>Origem dos Leads</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={originData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {originData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
              {originData.slice(0, 3).map(o => (
                <div key={o.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: o.color }} />
                  <span style={{ fontSize: 10, color: "#9CA3AF" }}>{o.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>Funil de Status</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {statusData.map(s => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#D1D5DB" }}>{s.name}</span>
                    <span style={{ color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 5 }}>
                    <div style={{ background: s.color, borderRadius: 99, height: "100%", width: `${filtered.length > 0 ? (s.value / filtered.length * 100).toFixed(0) : 0}%`, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="fade-in" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <input placeholder="Buscar nome, telefone, assunto, origem..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: "1 1 220px" }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 150 }} />
            <span style={{ color: "#6B7280", fontSize: 12 }}>até</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, width: 150 }} />
          </div>
          {(search || filterStatus !== "todos" || dateFrom || dateTo) && (
            <button onClick={() => { setSearch(""); setFilterStatus("todos"); setDateFrom(""); setDateTo(""); }} style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, color: "#F87171", padding: "9px 16px", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Limpar filtros</button>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="fade-in">
          {viewMode === 'kanban' ? (
            <KanbanBoard clients={filtered} onClientClick={handleLeadClick} />
          ) : (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["Data","Nome","Telefone","Origem","Assunto","Status Funil"].map(h => (
                        <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 10, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'DM Mono', monospace", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((lead) => {
                      const sc = STATUS_CONFIG[lead.STATUS] || { label: lead.STATUS, color: "#6B7280" };
                      return (
                        <tr key={lead.id} className="row-hover" onClick={() => handleLeadClick(lead)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", cursor: "pointer" }}>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#9CA3AF", fontFamily: "'DM Mono', monospace" }}>{fmtFull(lead.created_at)}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500 }}>{lead.nomewpp || "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#9CA3AF", fontFamily: "'DM Mono', monospace" }}>{lead.telefone || "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#6EE7FA", background: "rgba(110,231,250,0.1)", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                              {lead.ORIGEM || "Orgânico"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#D1D5DB", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.ASSUNTO || "—"}</td>
                          <td style={{ padding: "12px 16px" }}><span style={{ background: `${sc.color}18`, color: sc.color, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{sc.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "'DM Mono', monospace" }}>{filtered.length} leads · página {page} de {totalPages || 1}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 8, background: p === page ? "rgba(110,231,250,0.15)" : "rgba(255,255,255,0.04)", border: p === page ? "1px solid rgba(110,231,250,0.4)" : "1px solid rgba(255,255,255,0.06)", color: p === page ? "#6EE7FA" : "#9CA3AF", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ClientDetailModal 
        client={selectedLead} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpdate={fetchLeads} 
      />
    </div>
  );
}