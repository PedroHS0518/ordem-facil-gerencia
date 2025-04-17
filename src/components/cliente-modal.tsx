
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { OrdemServico } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { Calendar } from "lucide-react";

interface ClienteModalProps {
  clienteId: number | null;
  onOpenChange: (open: boolean) => void;
}

export function ClienteModal({ clienteId, onOpenChange }: ClienteModalProps) {
  const { getOrdem, atualizarOrdem } = useOrdemServico();
  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [formData, setFormData] = useState<Partial<OrdemServico>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clienteId) {
      const ordemData = getOrdem(clienteId);
      if (ordemData) {
        setOrdem(ordemData);
        setFormData({...ordemData});
      }
    }
  }, [clienteId, getOrdem]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleSubmit = () => {
    if (!clienteId || !ordem) return;
    
    setLoading(true);
    atualizarOrdem(clienteId, formData);
    setLoading(false);
    onOpenChange(false);
  };

  if (!ordem) return null;

  return (
    <Dialog open={!!clienteId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Detalhes do Cliente</span>
            <StatusBadge status={formData.status as any} />
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                name="cliente"
                value={formData.cliente || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipo">Equipamento</Label>
              <Input
                id="equipo"
                name="equipo"
                value={formData.equipo || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  name="marca"
                  value={formData.marca || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  name="modelo"
                  value={formData.modelo || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="configuracao">Configuração</Label>
              <Textarea
                id="configuracao"
                name="configuracao"
                rows={2}
                value={formData.configuracao || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defeito">Defeito</Label>
              <Textarea
                id="defeito"
                name="defeito"
                rows={2}
                value={formData.defeito || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "EM ABERTO"}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EM ABERTO">EM ABERTO</SelectItem>
                  <SelectItem value="PRONTO PARA RETIRAR">PRONTO PARA RETIRAR</SelectItem>
                  <SelectItem value="ENCERRADO">ENCERRADO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tecnico">Técnico Responsável</Label>
              <Select
                value={formData.tecnico || ""}
                onValueChange={(value) => handleSelectChange("tecnico", value)}
              >
                <SelectTrigger id="tecnico">
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Thomaz">Thomaz</SelectItem>
                  <SelectItem value="Pedro">Pedro</SelectItem>
                  <SelectItem value="Henrique">Henrique</SelectItem>
                  <SelectItem value="Vinicius">Vinicius</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_entrada">Data de Entrada</Label>
                <div className="relative">
                  <Input
                    id="data_entrada"
                    name="data_entrada"
                    type="date"
                    value={formData.data_entrada || ""}
                    onChange={handleInputChange}
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_saida">Data de Saída</Label>
                <div className="relative">
                  <Input
                    id="data_saida"
                    name="data_saida"
                    type="date"
                    value={formData.data_saida || ""}
                    onChange={handleInputChange}
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_list">Check List</Label>
              <Textarea
                id="check_list"
                name="check_list"
                rows={2}
                value={formData.check_list || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solucao">Solução</Label>
              <Textarea
                id="solucao"
                name="solucao"
                rows={2}
                value={formData.solucao || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orcamento">Orçamento (R$)</Label>
                <Input
                  id="orcamento"
                  name="orcamento"
                  type="number"
                  value={formData.orcamento?.toString() || "0"}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custo_final">Custo Final (R$)</Label>
                <Input
                  id="custo_final"
                  name="custo_final"
                  type="number"
                  value={formData.custo_final?.toString() || "0"}
                  onChange={handleNumberChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suporte_m2">Suporte M2</Label>
                <Input
                  id="suporte_m2"
                  name="suporte_m2"
                  value={formData.suporte_m2 || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume_dados">Volume de Dados</Label>
                <Input
                  id="volume_dados"
                  name="volume_dados"
                  value={formData.volume_dados || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="situacao">Situação</Label>
          <Textarea
            id="situacao"
            name="situacao"
            rows={2}
            value={formData.situacao || ""}
            onChange={handleInputChange}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
