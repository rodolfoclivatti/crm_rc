import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <LayoutDashboard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Seu Novo <span className="text-blue-600">CRM</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-lg mx-auto">
            Gerencie seus clientes do Supabase com uma interface moderna, rápida e intuitiva.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/crm')}
            className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 group"
          >
            Acessar Dashboard
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-8 text-lg bg-white border-slate-200"
          >
            <Users className="mr-2 h-5 w-5 text-slate-500" />
            Ver Clientes
          </Button>
        </div>

        <div className="pt-12 grid grid-cols-3 gap-8 border-t border-slate-100">
          <div>
            <div className="text-2xl font-bold text-slate-900">Real-time</div>
            <div className="text-sm text-slate-500">Dados atualizados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Supabase</div>
            <div className="text-sm text-slate-500">Integração nativa</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Moderno</div>
            <div className="text-sm text-slate-500">UI/UX otimizada</div>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;