
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, FileUp, FileDown, Upload, Download, Database } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { servicosDbPath, setServicosDbPath } = useOrdemServico();
  const { sincronizarComRede } = useServiceProduct();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [networkPath, setNetworkPath] = useState("");
  const [isNetworkPathDialogOpen, setIsNetworkPathDialogOpen] = useState(false);

  useEffect(() => {
    const savedPath = localStorage.getItem('networkBasePath');
    if (savedPath) {
      setNetworkPath(savedPath);
    }
    
    const savedAutoSync = localStorage.getItem('autoSyncEnabled');
    if (savedAutoSync) {
      setIsAutoSyncEnabled(JSON.parse(savedAutoSync));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('autoSyncEnabled', JSON.stringify(isAutoSyncEnabled));
  }, [isAutoSyncEnabled]);

  const handleSaveNetworkPath = () => {
    if (!networkPath.trim()) {
      toast({
        title: "Erro",
        description: "O caminho da rede não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('networkBasePath', networkPath);
    setServicosDbPath(`${networkPath}/Precos_Servicos.json`);
    setIsNetworkPathDialogOpen(false);
    toast({
      title: "Sucesso",
      description: "Caminho da rede configurado com sucesso!",
    });
  };

  const handleSync = async () => {
    if (!networkPath) {
      toast({
        title: "Erro",
        description: "Configure primeiro o caminho da pasta na rede.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const osPath = `${networkPath}/Clientes_OS.json`;
      const servicosPath = `${networkPath}/Precos_Servicos.json`;

      const sucessoServicos = await sincronizarComRede(servicosPath);
      if (sucessoServicos) {
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
                  <CardTitle>Configuração da Pasta de Rede</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <AlertDescription>
                      Configure o caminho da pasta na rede onde os arquivos serão salvos.
                      Exemplo: //servidor/pasta ou smb://servidor/pasta
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Caminho Atual:</Label>
                        <p className="text-sm text-muted-foreground break-all">
                          {networkPath || "Nenhum caminho configurado"}
                        </p>
                      </div>
                      <Button onClick={() => setIsNetworkPathDialogOpen(true)}>
                        <Database className="mr-2 h-4 w-4" />
                        Configurar Caminho
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-sync">Sincronização Automática:</Label>
                      <Switch
                        id="auto-sync"
                        checked={isAutoSyncEnabled}
                        onCheckedChange={handleToggleAutoSync}
                      />
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleSync} 
                          disabled={isSyncing || !networkPath}
                          className="w-full"
                        >
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
                        <p>Sincronize os dados com os arquivos na rede</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Dialog open={isNetworkPathDialogOpen} onOpenChange={setIsNetworkPathDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Caminho da Rede</DialogTitle>
              <DialogDescription>
                Insira o caminho da pasta na rede onde os arquivos serão salvos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="network-path">Caminho da Rede</Label>
                <Input
                  id="network-path"
                  value={networkPath}
                  onChange={(e) => setNetworkPath(e.target.value)}
                  placeholder="//servidor/pasta ou smb://servidor/pasta"
                />
                <p className="text-sm text-muted-foreground">
                  Exemplo: //servidor/pasta ou smb://servidor/pasta
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNetworkPathDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNetworkPath}>
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
