import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/components/auth/SessionContextProvider';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && !loading) {
      navigate('/crm');
    }
  }, [session, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#0E1018] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Acesso Restrito</h1>
          <p className="text-gray-400 text-sm">Entre com suas credenciais para acessar o CRM</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                    inputBackground: 'rgba(255,255,255,0.05)',
                    inputText: 'white',
                    inputPlaceholder: '#6b7280',
                    inputBorder: 'rgba(255,255,255,0.1)',
                    inputBorderFocus: '#3b82f6',
                    inputBorderHover: 'rgba(255,255,255,0.2)',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonPadding: '12px',
                    inputPadding: '12px',
                  }
                }
              },
              className: {
                container: 'auth-container',
                label: 'text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block',
                button: 'font-bold text-sm transition-all active:scale-95',
                input: 'bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-500',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Entrar no Sistema',
                  loading_button_label: 'Autenticando...',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha secreta',
                  link_text: 'Já tem uma conta? Entre aqui',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Criar Conta',
                  loading_button_label: 'Criando...',
                  link_text: 'Não tem conta? Cadastre-se',
                }
              }
            }}
            theme="dark"
          />
        </div>
        
        <p className="text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest">
          Secure Connection · AES-256 Encrypted
        </p>
      </div>
    </div>
  );
}