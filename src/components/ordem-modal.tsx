
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OrdemServico } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  cliente: z.string().min(1, "Nome do cliente é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  equipo: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  ns: z.string().optional(),
  defeito: z.string().optional(),
  observacao: z.string().optional(),
  status: z.enum(["EM ABERTO", "PRONTO PARA RETIRAR", "ENCERRADO"]).default("EM ABERTO"),
  data_saida: z.string().optional(),
  valor: z.coerce.number().optional(),
  servicos_produtos: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface OrdemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  ordemId?: number;
}

export function OrdemModal({
  open,
  onOpenChange,
  mode,
  ordemId,
}: OrdemModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { adicionarOrdem, atualizarOrdem, getOrdem } = useOrdemServico();
  
  const defaultValues: FormValues = {
    cliente: "",
    telefone: "",
    email: "",
    equipo: "",
    marca: "",
    modelo: "",
    ns: "",
    defeito: "",
    observacao: "",
    status: "EM ABERTO",
    data_saida: "",
    valor: 0,
    servicos_produtos: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Carregar dados para edição
  useEffect(() => {
    if (mode === "edit" && ordemId) {
      const ordem = getOrdem(ordemId);
      if (ordem) {
        form.reset({
          cliente: ordem.cliente,
          telefone: ordem.telefone || "",
          email: ordem.email || "",
          equipo: ordem.equipo || "",
          marca: ordem.marca || "",
          modelo: ordem.modelo || "",
          ns: ordem.ns || "",
          defeito: ordem.defeito || "",
          observacao: ordem.observacao || "",
          status: ordem.status,
          data_saida: ordem.data_saida || "",
          valor: ordem.valor || 0,
          servicos_produtos: ordem.servicos_produtos || "",
        });
      }
    } else {
      // Reset form for creating a new order
      form.reset(defaultValues);
    }
  }, [mode, ordemId, getOrdem, form, open]);

  const onSubmit = (data: FormValues) => {
    if (mode === "create") {
      // Adiciona campos que não vêm do formulário
      const novaOrdem: Omit<OrdemServico, "id"> = {
        ...data,
        tecnico: user?.nome || "",
        data_entrada: new Date().toISOString(),
        configuracao: "", // Providing default values for required fields
        check_list: "",
        solucao: "",
        orcamento: 0,
        custo_final: 0,
        situacao: "",
        suporte_m2: "",
        volume_dados: ""
      };
      
      adicionarOrdem(novaOrdem);
      toast({
        title: "Sucesso",
        description: "Ordem de serviço criada com sucesso",
      });
    } else if (mode === "edit" && ordemId) {
      atualizarOrdem(ordemId, data as Partial<OrdemServico>);
      toast({
        title: "Sucesso",
        description: "Ordem de serviço atualizada com sucesso",
      });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nova Ordem de Serviço" : "Editar Ordem de Serviço"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone*</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefone do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="equipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Equipamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Marca" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Modelo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de série" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="defeito"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Defeito Relatado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o defeito relatado pelo cliente"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EM ABERTO">Em Aberto</SelectItem>
                        <SelectItem value="PRONTO PARA RETIRAR">
                          Pronto para Retirar
                        </SelectItem>
                        <SelectItem value="ENCERRADO">Encerrado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="servicos_produtos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviços/Produtos Utilizados</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste os serviços e produtos utilizados"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {mode === "create" ? "Criar Ordem" : "Atualizar Ordem"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
