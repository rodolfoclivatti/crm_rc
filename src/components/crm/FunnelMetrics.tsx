import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Minus, DollarSign, Clock, Users, UserCheck, Calendar, Award, ArrowRight } from "lucide-react";

interface FunnelMetricsProps {
  leads: any[];
  filtered: any[];
}

// Ticket médio configurável por tipo de serviço
const TICKET_MEDIO: Record<string, number> = {
  DBA: 3500,
  RCV: 1800,
  DEFAULT: 2500,
};

function getTicketForLead(lead: any): number {
  const assunto = (lead.ASSUNTO || "").toUpperCase();
  if (assunto.includes("DBA")) return TICKET_MEDIO.DBA;
  if (assunto.includes("RCV")) return TICKET_MEDIO.RCV;
  return TICKET_MEDIO.DEFAULT;
}

function MiniTrend({ value, unit = "" }: { value: number; unit?: string }) {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const color = value > 0 ? "#00E5A0" : value < 0 ? "#F87171" : "#6B7280";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color, fontFamily: "'DM Mono', monospace" }}>
      <Icon size={10} />
      {value > 0 ? "+" : ""}{value}{unit}
    </span>
  );
}

function MetricCard({
  label, value, sub, accent, icon: Icon, badge, trend
}: {
  label: string; value: string | number; sub?: string; accent: string;
  icon?: any; badge?: string; trend?: number;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${accent}28`,
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 90, height: 90,
        background: `radial-gradient(circle at top right, ${accent}18, transparent 70%)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {Icon && (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={13} style={{ color: accent }} />
            </div>
          )}
          <span style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" }}>
            {label}
          </span>
        </div>
        {badge && (
          <span style={{ fontSize: 9, color: accent, background: `${accent}18`, padding: "2px 7px", borderRadius: 99, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
            {badge}
          </span>
        )}
      </div>
      <span style={{ fontSize: 32, fontWeight: 800, color: "#F9FAFB", fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif", lineHeight: 1.1 }}>
        {value}
      </span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {sub && <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Mono', monospace" }}>{sub}</span>}
        {trend !== undefined && <MiniTrend value={trend} unit="%" />}
      </div>
    </div>
  );
}

function FunnelStage({
  label, count, total, color, pct, next
}: {
  label: string; count: number; total: number; color: string; pct: string; next?: boolean;
}) {
  const width = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "#D1D5DB" }}>{label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{count}</span>
            <span style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace" }}>({pct}%)</span>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 6 }}>
          <div style={{
            background: color, borderRadius: 99, height: "100%",
            width: `${width.toFixed(1)}%`,
            transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
            boxShadow: `0 0 8px ${color}60`
          }} />
        </div>
      </div>
      {next && <ArrowRight size={12} style={{ color: "#374151", flexShrink: 0 }} />}
    </div>
  );
}

export function FunnelMetrics({ leads, filtered }: FunnelMetricsProps) {
  const [ticketDBA, setTicketDBA] = useState(TICKET_MEDIO.DBA);
  const [ticketRCV, setTicketRCV] = useState(TICKET_MEDIO.RCV);
  const [ticketDefault, setTicketDefault] = useState(TICKET_MEDIO.DEFAULT);
  const [showTicketConfig, setShowTicketConfig] = useState(false);

  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // -- CONTATOS DIÁRIOS (hoje vs ontem) --
    const contatosHoje = leads.filter(l => {
      const d = new Date(l.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;

    const contatosOntem = leads.filter(l => {
      const d = new Date(l.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === yesterday.getTime();
    }).length;

    const contatosDelta = contatosHoje - contatosOntem;

    // -- MÉDIA DIÁRIA (últimos 30 dias) --
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const leads30d = leads.filter(l => new Date(l.created_at) >= thirtyDaysAgo);
    const mediaContatosDiarios = leads30d.length > 0 ? (leads30d.length / 30).toFixed(1) : "0";

    // -- QUALIFICADOS (proposta_enviada + contrato_enviado) --
    const isQualificado = (s: string) => {
      const status = (s || "").toLowerCase();
      return status === "proposta_enviada" || status === "contrato_enviado" || status === "followup";
    };
    const qualificados = filtered.filter(l => isQualificado(l.STATUS)).length;

    // -- AGENDADOS (contrato_enviado = quase fechando) --
    const isAgendado = (s: string) => {
      const status = (s || "").toLowerCase();
      return status === "contrato_enviado";
    };
    const agendados = filtered.filter(l => isAgendado(l.STATUS)).length;

    // -- FECHADOS (cliente / concluido) --
    const isFechado = (s: string) => {
      const status = (s || "").toLowerCase();
      return status === "cliente" || status === "concluido";
    };
    const fechados = filtered.filter(l => isFechado(l.STATUS)).length;

    // -- PERDIDOS (desqualificado + perdido) --
    const isPerdido = (s: string) => {
      const status = (s || "").toLowerCase();
      return status === "desqualificado" || status === "perdido";
    };
    const perdidos = filtered.filter(l => isPerdido(l.STATUS)).length;

    // -- FATURAMENTO PROVISIONADO --
    // Base: leads fechados × ticket por tipo + pipeline (qualificados × 30% probabilidade)
    const receitaFechada = filtered
      .filter(l => isFechado(l.STATUS))
      .reduce((acc, l) => {
        const assunto = (l.ASSUNTO || "").toUpperCase();
        if (assunto.includes("DBA")) return acc + ticketDBA;
        if (assunto.includes("RCV")) return acc + ticketRCV;
        return acc + ticketDefault;
      }, 0);

    const receitaPipeline = filtered
      .filter(l => isAgendado(l.STATUS))
      .reduce((acc, l) => {
        const assunto = (l.ASSUNTO || "").toUpperCase();
        if (assunto.includes("DBA")) return acc + ticketDBA * 0.7;
        if (assunto.includes("RCV")) return acc + ticketRCV * 0.7;
        return acc + ticketDefault * 0.7;
      }, 0);

    const faturamentoTotal = receitaFechada + receitaPipeline;

    // -- TAXAS DE CONVERSÃO POR ETAPA --
    const total = filtered.length;
    const novos = filtered.filter(l => {
      const s = (l.STATUS || "").toLowerCase();
      return s === "novo" || s === "pendente";
    }).length;
    const followups = filtered.filter(l => (l.STATUS || "").toLowerCase() === "followup").length;
    const propostas = filtered.filter(l => (l.STATUS || "").toLowerCase() === "proposta_enviada").length;
    const contratos = filtered.filter(l => (l.STATUS || "").toLowerCase() === "contrato_enviado").length;

    const txContatoParaQualif = total > 0 ? ((qualificados / total) * 100).toFixed(1) : "0";
    const txQualifParaFechado = qualificados > 0 ? ((fechados / qualificados) * 100).toFixed(1) : "0";
    const txGeralFechamento = total > 0 ? ((fechados / total) * 100).toFixed(1) : "0";

    // -- TEMPO MÉDIO DE RESPOSTA (estimado via etapa_atendimento) --
    // Sem campo real no DB, usamos a etapa_atendimento como proxy ordinal
    const leadsComEtapa = filtered.filter(l => l.etapa_atendimento && parseInt(l.etapa_atendimento) > 0);
    const tempoMedioEstimado = leadsComEtapa.length > 0
      ? "~" + (leadsComEtapa.reduce((acc, l) => acc + parseInt(l.etapa_atendimento || "0"), 0) / leadsComEtapa.length).toFixed(0) + " etapas"
      : "N/A";

    return {
      contatosHoje, contatosOntem, contatosDelta, mediaContatosDiarios,
      qualificados, agendados, fechados, perdidos,
      faturamentoTotal, receitaFechada, receitaPipeline,
      txContatoParaQualif, txQualifParaFechado, txGeralFechamento,
      tempoMedioEstimado,
      total, novos, followups, propostas, contratos,
    };
  }, [filtered, leads, ticketDBA, ticketRCV, ticketDefault]);

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── SEÇÃO: ATIVIDADE DIÁRIA ── */}
      <div>
        <div style={{ fontSize: 10, color: "#4B5563", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
          ● Atividade do Dia
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <MetricCard
            label="Contatos Hoje"
            value={metrics.contatosHoje}
            sub={`Ontem: ${metrics.contatosOntem} · Média/dia: ${metrics.mediaContatosDiarios}`}
            accent="#6EE7FA"
            icon={Users}
            trend={metrics.contatosOntem > 0 ? Math.round(((metrics.contatosHoje - metrics.contatosOntem) / metrics.contatosOntem) * 100) : 0}
          />
          <MetricCard
            label="Qualificados"
            value={metrics.qualificados}
            sub={`${metrics.txContatoParaQualif}% do total de leads`}
            accent="#A78BFA"
            icon={UserCheck}
            badge="Follow + Proposta"
          />
          <MetricCard
            label="Agendados"
            value={metrics.agendados}
            sub={`Contrato enviado · Em negociação`}
            accent="#FCD34D"
            icon={Calendar}
          />
          <MetricCard
            label="Fechados"
            value={metrics.fechados}
            sub={`Tx. geral: ${metrics.txGeralFechamento}% · ${metrics.perdidos} perdidos`}
            accent="#00E5A0"
            icon={Award}
          />
        </div>
      </div>

      {/* ── SEÇÃO: FATURAMENTO PROVISIONADO ── */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,229,160,0.15)", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#4B5563", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
            ● Faturamento Provisionado
          </div>
          <button
            onClick={() => setShowTicketConfig(!showTicketConfig)}
            style={{
              fontSize: 9, color: "#6B7280", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "3px 10px",
              cursor: "pointer", fontFamily: "'DM Mono', monospace"
            }}
          >
            {showTicketConfig ? "fechar" : "configurar tickets ▾"}
          </button>
        </div>

        {showTicketConfig && (
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Ticket DBA (R$)", value: ticketDBA, setter: setTicketDBA },
              { label: "Ticket RCV (R$)", value: ticketRCV, setter: setTicketRCV },
              { label: "Ticket Padrão (R$)", value: ticketDefault, setter: setTicketDefault },
            ].map(({ label, value, setter }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 9, color: "#6B7280", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={e => setter(Number(e.target.value))}
                  style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, color: "#F9FAFB", padding: "6px 10px", fontSize: 12,
                    fontFamily: "'DM Mono', monospace", width: 130, outline: "none"
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <DollarSign size={12} style={{ color: "#00E5A0" }} />
              <span style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Receita Confirmada</span>
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#00E5A0", fontFamily: "'DM Sans', sans-serif" }}>
              {fmtCurrency(metrics.receitaFechada)}
            </span>
            <span style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace" }}>{metrics.fechados} clientes fechados</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <DollarSign size={12} style={{ color: "#FCD34D" }} />
              <span style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Pipeline (70%)</span>
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#FCD34D", fontFamily: "'DM Sans', sans-serif" }}>
              {fmtCurrency(metrics.receitaPipeline)}
            </span>
            <span style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace" }}>{metrics.agendados} negociações ativas</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <DollarSign size={12} style={{ color: "#A78BFA" }} />
              <span style={{ fontSize: 10, color: "#6B7280", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Total Provisionado</span>
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#A78BFA", fontFamily: "'DM Sans', sans-serif" }}>
              {fmtCurrency(metrics.faturamentoTotal)}
            </span>
            <span style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace" }}>confirmado + pipeline</span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO: FUNIL DE CONVERSÃO ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 10, color: "#4B5563", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
            ● Funil de Conversão
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FunnelStage label="Contatos" count={metrics.total} total={metrics.total} color="#6EE7FA" pct="100" next />
            <FunnelStage label="Follow-up / Qualificados" count={metrics.qualificados} total={metrics.total} color="#A78BFA" pct={metrics.txContatoParaQualif} next />
            <FunnelStage label="Contrato Enviado" count={metrics.agendados} total={metrics.total} color="#FCD34D" pct={metrics.total > 0 ? ((metrics.agendados / metrics.total) * 100).toFixed(1) : "0"} next />
            <FunnelStage label="Fechados (Clientes)" count={metrics.fechados} total={metrics.total} color="#00E5A0" pct={metrics.txGeralFechamento} />
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 10, color: "#4B5563", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
            ● Taxas de Conversão
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>Contato → Qualificado</span>
                <span style={{ fontSize: 13, color: "#A78BFA", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{metrics.txContatoParaQualif}%</span>
              </div>
              <div style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace" }}>
                {metrics.qualificados} qualificados de {metrics.total} contatos
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>Qualificado → Fechado</span>
                <span style={{ fontSize: 13, color: "#00E5A0", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{metrics.txQualifParaFechado}%</span>
              </div>
              <div style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace" }}>
                {metrics.fechados} fechados de {metrics.qualificados} qualificados
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>Tx. Geral de Fechamento</span>
                <span style={{ fontSize: 13, color: "#6EE7FA", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{metrics.txGeralFechamento}%</span>
              </div>
              <div style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace" }}>
                {metrics.fechados} clientes de {metrics.total} contatos totais
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                  <Clock size={10} style={{ display: "inline", marginRight: 4 }} />
                  Tempo de Resposta
                </span>
                <span style={{ fontSize: 13, color: "#FCD34D", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                  {metrics.tempoMedioEstimado}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace" }}>
                ⚠ Campo first_response_at pendente no banco
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
