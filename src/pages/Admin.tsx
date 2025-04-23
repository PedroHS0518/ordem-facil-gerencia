
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, FileUp, FileDown, Upload, Download, Link, Link2Off } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useServiceProduct } from "@/contexts/ServiceProductContext";
import { isValidUrl } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { servicosDbPath, setServicosDbPath } = useOrdemServico();
  const { sincronizarComRede } = useServiceProduct();
  const { toast } = useToast();
  const [newPath, setNewPath] = useState(servicosDbPath || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);

  useEffect(() => {
    // Load the auto-sync setting from localStorage on component mount
    const savedAutoSync = localStorage.getItem('autoSyncEnabled');
    if (savedAutoSync) {
      setIsAutoSyncEnabled(JSON.parse(savedAutoSync));
    }
  }, []);

  useEffect(() => {
    // Save the auto-sync setting to localStorage whenever it changes
    localStorage.setItem('autoSyncEnabled', JSON.stringify(isAutoSyncEnabled));
  }, [isAutoSyncEnabled]);

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPath(e.target.value);
  };

  const handleSavePath = async () => {
    if (newPath.trim() === "") {
      toast({
        title: "Erro",
        description: "O caminho não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    setServicosDbPath(newPath);
    setIsDialogOpen(false);
    toast({
      title: "Sucesso",
      description: "Caminho atualizado com sucesso!",
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (!servicosDbPath) {
        toast({
          title: "Erro",
          description: "Nenhum caminho de rede configurado.",
          variant: "destructive",
        });
        return;
      }

      const sucesso = await sincronizarComRede(servicosDbPath);
      if (sucesso) {
        toast({
          title: "Sincronização Completa",
          description: "Dados sincronizados com sucesso da rede!",
        });
      } else {
        toast({
          title: "Erro na Sincronização",
          description: "Falha ao sincronizar dados da rede.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro durante a sincronização:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao sincronizar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleToggleAutoSync = () => {
    setIsAutoSyncEnabled(prev => !prev);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-muted/30">
        <main className="flex-1 container py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Painel de Administração</h1>
          </div>

          <Tabs defaultValue="geral" className="space-y-4">
            <TabsList>
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="dados">Dados</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Usuário:</strong> {user?.nome}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button onClick={handleLogout} variant="destructive">
                    Sair
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dados" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sincronização de Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-sync">Sincronização Automática:</Label>
                    <Switch
                      id="auto-sync"
                      checked={isAutoSyncEnabled}
                      onCheckedChange={handleToggleAutoSync}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ative a sincronização automática para manter os dados sempre atualizados.
                  </p>

                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Link className="mr-2 h-4 w-4" />
                    Alterar Caminho da Base de Dados
                  </Button>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleSync} disabled={isSyncing}>
                        {isSyncing ? (
                          <>
                            Sincronizando...
                            <Upload className="ml-2 h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            Sincronizar Agora
                            <Download className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sincronize os dados com o arquivo na rede</p>
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Caminho da Base de Dados</DialogTitle>
              <DialogDescription>
                Insira o novo caminho para a base de dados de serviços e produtos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="path" className="text-right">
                  Caminho
                </Label>
                <Input
                  id="path"
                  value={newPath}
                  onChange={handlePathChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleSavePath}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Admin;
