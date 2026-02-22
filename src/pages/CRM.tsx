import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── CONFIGURAÇÃO DE STATUS / ORIGEM ───────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  cliente:           { label: "Cliente",           color: "#00E5A0" },
  contrato_enviado:  { label: "Contrato Enviado",  color: "#6EE7FA" },
  proposta_enviada:  { label: "Proposta Enviada",  color: "#A78BFA" },
  followup:          { label: "Follow-up",         color: "#FCD34D" },
  desqualificado:    { label: "Desqualificado",    color: "#F87171" },
  perdido:           { label: "Perdido",           color: "#6B7280" },
  PENDENTE:          { label: "Pendente",          color: "#FCD34D" },
  "EM ATENDIMENTO":  { label: "Em Atendimento",    color: "#6EE7FA" },
  CONCLUIDO:         { label: "Concluído",         color: "#00E5A0" },
};

const ORIGEM_CONFIG: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "#34D399" },
  meta:   { label: "Meta",   color: "#818CF8" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtFull = (v: string) =>
  v ? new Date(v).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }) : "—";

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent: string }) {
  return (
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
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${accent}22, transparent 70%)`,
      }} />
      <span style={{ fontSize: 12, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" }}>
        {label}
      </span>
      <span style={{ fontSize: 38, fontWeight: 700, color: "#F9FAFB", fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif", lineHeight: 1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 12, color: accent, fontFamily: "'DM Mono', monospace" }}>{sub}</span>}
    </div>
  );
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
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

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function CRM() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterOrigem, setFilterOrigem] = useState("todos");
  const [filterAtendimento, setFilterAtendimento] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Tabela
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      console.log("[CRM] Buscando dados da tabela 'dados_cliente'...");
      
      const { data, error } = await supabase
        .from('dados_cliente')
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("[CRM] Erro Supabase:", error);
        throw error;
      }
      
      console.log("[CRM] Dados recebidos:", data?.length || 0, "registros");
      setLeads(data || []);
      
      if (data && data.length > 0) {
        showSuccess(`${data.length} leads carregados.`);
      }
    } catch (e: any) {
      const msg = e.message || "Erro desconhecido";
      setErrorMsg(msg);
      showError("Erro ao conectar: " + msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dados_cliente' },
        () => {
          console.log("[CRM] Mudança detectada no banco, atualizando...");
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  // ── Filtered leads ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const d = new Date(l.created_at);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      
      const status = (l.STATUS || "").toUpperCase();
      if (filterStatus !== "todos" && status !== filterStatus.toUpperCase()) return false;
      
      const origem = (l.ORIGEM || "").toLowerCase();
      if (filterOrigem !== "todos" && origem !== filterOrigem) return false;
      
      const atendimento = (l.ATENDIMENTO || "").toLowerCase();
      if (filterAtendimento !== "todos" && atendimento !== filterAtendimento) return false;
      
      if (search) {
        const q = search.toLowerCase();
        if (!l.nomewpp?.toLowerCase().includes(q) && 
            !l.telefone?.includes(q) && 
            !l.ASSUNTO?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [leads, search, filterStatus, filterOrigem, filterAtendimento, dateFrom, dateTo]);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = filtered.length;
    const clientes = filtered.filter(l => (l.STATUS || "").toLowerCase() === "cliente" || l.STATUS === "CONCLUIDO").length;
    const abertos = filtered.filter(l => (l.ATENDIMENTO || "").toLowerCase() === "aberto" || l.STATUS === "PENDENTE").length;
    const txConversao = total > 0 ? ((clientes / total) * 100).toFixed(1) : "0";
    return { total, clientes, abertos, txConversao };
  }, [filtered]);

  // ── Status chart ─────────────────────────────────────────────────────────
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(l => {
      const s = l.STATUS || "SEM STATUS";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => ({
      name: STATUS_CONFIG[k]?.label || k,
      value: v,
      color: STATUS_CONFIG[k]?.color || "#6B7280",
    })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // ── Origem chart ─────────────────────────────────────────────────────────
  const origemData = useMemo(() => {
    const g = filtered.filter(l => (l.ORIGEM || "").toLowerCase() === "google").length;
    const m = filtered.filter(l => (l.ORIGEM || "").toLowerCase() === "meta").length;
    const outro = filtered.length - g - m;
    const arr = [];
    if (g) arr.push({ name: "Google", value: g, color: "#34D399" });
    if (m) arr.push({ name: "Meta", value: m, color: "#818CF8" });
    if (outro && outro > 0) arr.push({ name: "Outro", value: outro, color: "#6B7280" });
    return arr;
  }, [filtered]);

  // ── Timeline chart ────────────────────────────────────────────────────────
  const timelineData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(l => {
      const key = new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
      map[key] = (map[key] || 0) + 1;
    });
    
    const uniqueDates = Array.from(new Set(filtered.map(l => 
      new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    ))).reverse();

    return uniqueDates.map(k => ({ data: k, leads: map[k] })).slice(-30);
  }, [filtered]);

  // ── Paginated table ───────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, filterStatus, filterOrigem, filterAtendimento, dateFrom, dateTo]);

  if (loading && leads.length === 0) return (
    <div style={{ minHeight: "100vh", background: "#0E1018", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6EE7FA", fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: 2 }}>
        CONECTANDO AO SUPABASE...
      </div>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#F9FAFB",
    padding: "9px 14px",
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    paddingRight: 32,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0E1018",
      fontFamily: "'DM Sans', sans-serif",
      color: "#F9FAFB",
    }}>
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
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6EE7FA", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 6 }}>
              CRM · PAINEL DE LEADS
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
              Dashboard de Leads
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Button 
              variant="outline" 
              onClick={fetchLeads} 
              disabled={loading}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <div style={{
              background: "rgba(110,231,250,0.08)",
              border: "1px solid rgba(110,231,250,0.25)",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 12,
              color: "#6EE7FA",
              fontFamily: "'DM Mono', monospace",
              maxWidth: 300,
              lineHeight: 1.5,
            }}>
              📡 Status: {loading ? "Sincronizando..." : "Conectado"}<br/>
              <span style={{ opacity: 0.7 }}>Tabela: dados_cliente</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <div className="text-sm">
              <p className="font-bold">Erro de Conexão:</p>
              <p>{errorMsg}</p>
              <p className="mt-2 text-xs opacity-70">Dica: Verifique se as políticas de RLS no Supabase permitem a leitura da tabela 'dados_cliente'.</p>
            </div>
          </div>
        )}

        {/* KPI CARDS */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
          <StatCard label="Total de Leads" value={kpis.total} sub={`com filtros aplicados`} accent="#6EE7FA" />
          <StatCard label="Clientes" value={kpis.clientes} sub="status = cliente/concluido" accent="#00E5A0" />
          <StatCard label="Tx. Conversão" value={`${kpis.txConversao}%`} sub="leads → clientes" accent="#A78BFA" />
          <StatCard label="Abertos" value={kpis.abertos} sub="aguardando atendimento" accent="#FCD34D" />
        </div>

        {/* CHARTS ROW */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 28 }}>

          {/* Timeline */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
              Leads por Período
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={timelineData}>
                <XAxis dataKey="data" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="leads" stroke="#6EE7FA" strokeWidth={2} dot={false} name="Leads" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status bar */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
              Funil de Status
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {statusData.map(s => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#D1D5DB" }}>{s.name}</span>
                    <span style={{ color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 5 }}>
                    <div style={{
                      background: s.color,
                      borderRadius: 99,
                      height: "100%",
                      width: `${filtered.length > 0 ? (s.value / filtered.length * 100).toFixed(0) : 0}%`,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Origem pie */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 24,
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
              Origem
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={origemData} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3}>
                  {origemData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {origemData.map(o => (
                <div key={o.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: o.color, flexShrink: 0 }} />
                  <span style={{ color: "#D1D5DB" }}>{o.name}</span>
                  <span style={{ marginLeft: "auto", color: o.color, fontFamily: "'DM Mono', monospace" }}>{o.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="fade-in" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}>
          <input
            placeholder="Buscar nome, telefone, assunto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: "1 1 220px" }}
          />

          <div style={{ position: "relative" }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
              <option value="todos">Todos os status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div style={{ position: "relative" }}>
            <select value={filterOrigem} onChange={e => setFilterOrigem(e.target.value)} style={selectStyle}>
              <option value="todos">Toda origem</option>
              <option value="google">Google</option>
              <option value="meta">Meta</option>
            </select>
          </div>

          <div style={{ position: "relative" }}>
            <select value={filterAtendimento} onChange={e => setFilterAtendimento(e.target.value)} style={selectStyle}>
              <option value="todos">Atendimento</option>
              <option value="aberto">Aberto</option>
              <option value="fechado">Fechado</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 150 }} />
            <span style={{ color: "#6B7280", fontSize: 12 }}>até</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, width: 150 }} />
          </div>

          {(search || filterStatus !== "todos" || filterOrigem !== "todos" || filterAtendimento !== "todos" || dateFrom || dateTo) && (
            <button onClick={() => { setSearch(""); setFilterStatus("todos"); setFilterOrigem("todos"); setFilterAtendimento("todos"); setDateFrom(""); setDateTo(""); }}
              style={{
                background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 8, color: "#F87171", padding: "9px 16px", fontSize: 12,
                cursor: "pointer", fontFamily: "'DM Mono', monospace",
              }}>
              Limpar filtros
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="fade-in" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Data","Nome","Telefone","Origem","Assunto","Atendimento","Status Funil","Criativo"].map(h => (
                    <th key={h} style={{
                      padding: "14px 16px", textAlign: "left",
                      fontSize: 10, color: "#6B7280", textTransform: "uppercase",
                      letterSpacing: 1.2, fontFamily: "'DM Mono', monospace", fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((lead) => {
                  const statusKey = lead.STATUS || "SEM STATUS";
                  const sc = STATUS_CONFIG[statusKey] || { label: statusKey, color: "#6B7280" };
                  const origemKey = (lead.ORIGEM || "").toLowerCase();
                  const oc = ORIGEM_CONFIG[origemKey] || { color: "#9CA3AF" };
                  return (
                    <tr key={lead.id} className="row-hover" style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "background 0.15s",
                    }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#9CA3AF", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                        {fmtFull(lead.created_at)}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
                        {lead.nomewpp || "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#9CA3AF", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                        {lead.telefone || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          background: `${oc.color}22`,
                          color: oc.color,
                          padding: "3px 10px", borderRadius: 99,
                          fontSize: 11, fontFamily: "'DM Mono', monospace",
                          textTransform: "capitalize",
                        }}>
                          {lead.ORIGEM || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#D1D5DB", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lead.ASSUNTO || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          background: (lead.ATENDIMENTO || "").toLowerCase() === "aberto" ? "rgba(253,211,77,0.12)" : "rgba(55,65,81,0.5)",
                          color: (lead.ATENDIMENTO || "").toLowerCase() === "aberto" ? "#FCD34D" : "#9CA3AF",
                          padding: "3px 10px", borderRadius: 99,
                          fontSize: 11, fontFamily: "'DM Mono', monospace", textTransform: "capitalize",
                        }}>
                          {lead.ATENDIMENTO || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          background: `${sc.color}18`,
                          color: sc.color,
                          padding: "3px 10px", borderRadius: 99,
                          fontSize: 11, fontFamily: "'DM Mono', monospace",
                        }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {lead.eventId
                          ? <a href={lead.eventId} target="_blank" rel="noopener noreferrer"
                              style={{ color: "#818CF8", fontSize: 11, fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>
                              ver criativo ↗
                            </a>
                          : <span style={{ color: "#4B5563", fontSize: 11 }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#4B5563", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                      Nenhum lead encontrado. Verifique se há dados na tabela 'dados_cliente' e se o RLS permite a leitura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "'DM Mono', monospace" }}>
              {filtered.length} leads · página {page} de {totalPages || 1}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: p === page ? "rgba(110,231,250,0.15)" : "rgba(255,255,255,0.04)",
                  border: p === page ? "1px solid rgba(110,231,250,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  color: p === page ? "#6EE7FA" : "#9CA3AF",
                  cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace",
                }}>
                  {p}
                </button>
              ))}
              {totalPages > 7 && page < totalPages && (
                <button onClick={() => setPage(page + 1)} style={{
                  height: 32, padding: "0 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#9CA3AF", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace",
                }}>
                  próxima →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}