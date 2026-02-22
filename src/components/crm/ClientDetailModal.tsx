import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Save, Trash2, User, Phone, MessageSquare, Share2 } from "lucide-react";

interface ClientDetailModalProps {
  client: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ClientDetailModal = ({ client, isOpen, onClose, onUpdate }: ClientDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (client) {
      setFormData({
        nomewpp: client.nomewpp || "",
        telefone: client.telefone || "",
        ASSUNTO: client.ASSUNTO || "",
        STATUS: client.STATUS || "novo",
        etapa_atendimento: client.etapa_atendimento || "0",
        ORIGEM: client.ORIGEM || "Orgânico",
      });
    }
  }, [client]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('dados_cliente')
        .update({
          ...formData,
          STATUS: formData.STATUS.toLowerCase()
        })
        .eq('id', client.id);

      if (error) throw error;
      showSuccess("Lead atualizado com sucesso!");
      onUpdate();
      onClose();
    } catch (error: any) {
      showError("Erro ao atualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">Editar Lead</DialogTitle>
                <p className="text-blue-100 text-sm font-medium">Atualize as informações do funil</p>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-8 space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nome WhatsApp</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={formData.nomewpp} 
                  onChange={(e) => setFormData({...formData, nomewpp: e.target.value})}
                  className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={formData.telefone} 
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fase do Funil</Label>
              <Select 
                value={formData.STATUS} 
                onValueChange={(v) => setFormData({...formData, STATUS: v})}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Selecione a fase" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                  <SelectItem value="contrato_enviado">Contrato Enviado</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="desqualificado">Desqualificado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Origem do Lead</Label>
              <div className="relative">
                <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={formData.ORIGEM} 
                  onChange={(e) => setFormData({...formData, ORIGEM: e.target.value})}
                  className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500"
                  placeholder="Ex: Instagram, Google, Indicação..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Assunto / Notas do Lead</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea 
                value={formData.ASSUNTO} 
                onChange={(e) => setFormData({...formData, ASSUNTO: e.target.value})}
                className="pl-10 min-h-[120px] rounded-2xl border-slate-200 resize-none focus:ring-blue-500"
                placeholder="Descreva o que o cliente busca..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold">
            <Trash2 className="mr-2 h-4 w-4" />
            Arquivar
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl font-bold border-slate-200">Cancelar</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 font-bold shadow-lg shadow-blue-100">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Lead
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};