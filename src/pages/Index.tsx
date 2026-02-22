import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/components/auth/SessionContextProvider";
import { ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { session } = useSession();

  // Se já estiver logado, redireciona para o CRM ao carregar a home
  useEffect(() => {
    if (session) {
      navigate('/crm');
    }
  }, [session, navigate]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0E1018", 
      fontFamily: "'DM Sans', sans-serif", 
      color: "#F9FAFB",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .hero-gradient {
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 600px;
          background: radial-gradient(circle at center, rgba(110, 231, 250, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
        }
      `}</style>

      <div className="hero-gradient" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center space-y-12">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span style={{ fontSize: 11, color: "#6EE7FA", fontFamily: "'DM Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }}>
              Sistema de Gestão Inteligente
            </span>
          </div>

          <div className="space-y-6">
            <h1 style={{ 
              fontSize: "clamp(2.5rem, 8vw, 4.5rem)", 
              fontWeight: 800, 
              letterSpacing: "-0.04em", 
              lineHeight: 1,
              fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif"
            }}>
              Controle seus <span style={{ color: "#6EE7FA" }}>Leads</span> com<br />
              precisão cirúrgica.
            </h1>
            <p style={{ 
              fontSize: "1.125rem", 
              color: "#9CA3AF", 
              maxWidth: "600px", 
              margin: "0 auto",
              lineHeight: 1.6
            }}>
              Uma interface de alta performance integrada ao Supabase para gerenciar seu funil de vendas em tempo real.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              onClick={() => navigate('/login')}
              style={{
                height: "60px",
                padding: "0 40px",
                fontSize: "16px",
                fontWeight: 700,
                borderRadius: "16px",
                background: "#6EE7FA",
                color: "#0E1018",
                boxShadow: "0 20px 40px -10px rgba(110, 231, 250, 0.3)",
                transition: "all 0.2s ease"
              }}
              className="hover:scale-105 active:scale-95"
            >
              {session ? 'Ir para o Dashboard' : 'Acessar Dashboard'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline"
              style={{
                height: "60px",
                padding: "0 40px",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#F9FAFB"
              }}
              className="hover:bg-white/5"
            >
              Documentação
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="glass-card p-8 text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold">Real-time Sync</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Atualizações instantâneas via Supabase Realtime para sua equipe nunca perder um lead.</p>
            </div>

            <div className="glass-card p-8 text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-400/10 flex items-center justify-center text-purple-400">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-bold">Analytics Avançado</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Visualize taxas de conversão e performance de criativos com gráficos interativos.</p>
            </div>

            <div className="glass-card p-8 text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-400/10 flex items-center justify-center text-green-400">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold">Segurança Nativa</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Proteção de dados robusta com Row Level Security (RLS) direto no banco de dados.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div style={{ fontSize: 12, color: "#4B5563", fontFamily: "'DM Mono', monospace" }}>
            © 2024 CRM SYSTEM · V1.0.4
          </div>
          <MadeWithDyad />
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-500 hover:text-cyan-400 transition-colors">Privacidade</a>
            <a href="#" className="text-xs text-gray-500 hover:text-cyan-400 transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;