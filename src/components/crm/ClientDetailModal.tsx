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
import { Loader2, Save, Trash2 } from "lucide-react";

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
        STATUS: client.STATUS || "PENDENTE",
        etapa_atendimento: client.etapa_atendimento || "0",
      });
    }
  }, [client]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('dados_cliente')
        .update(formData)
        .eq('id', client.id);

      if (error) throw error;
      showSuccess("Cliente atualizado com sucesso!");
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
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Detalhes do Lead</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome WhatsApp</Label>
              <Input 
                id="name" 
                value={formData.nomewpp} 
                onChange={(e) => setFormData({...formData, nomewpp: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                value={formData.telefone} 
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.STATUS} 
                onValueChange={(v) => setFormData({...formData, STATUS: v})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM ATENDIMENTO">Em Atendimento</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Etapa do Funil</Label>
              <Input 
                type="number"
                value={formData.etapa_atendimento} 
                onChange={(e) => setFormData({...formData, etapa_atendimento: e.target.value})}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto / Notas</Label>
            <Textarea 
              id="subject" 
              value={formData.ASSUNTO} 
              onChange={(e) => setFormData({...formData, ASSUNTO: e.target.value})}
              className="min-h-[100px] rounded-xl resize-none"
              placeholder="Descreva o interesse do cliente ou notas do atendimento..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};