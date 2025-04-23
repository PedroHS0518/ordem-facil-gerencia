
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { useServiceProduct } from "@/contexts/ServiceProductContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { NetworkConfigSection } from "@/components/admin/NetworkConfigSection";
import { UserInfoSection } from "@/components/admin/UserInfoSection";
import { TooltipProvider } from "@/components/ui/tooltip";

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { servicosDbPath, setServicosDbPath } = useOrdemServico();
  const { sincronizarComRede } = useServiceProduct();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [networkPath, setNetworkPath] = useState("");

  useEffect(() => {
    const savedPath = localStorage.getItem('networkBasePath');
    const savedUsername = localStorage.getItem('networkUsername');
    const savedPassword = localStorage.getItem('networkPassword');
    
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

  const handleNetworkPathChange = (path: string, username?: string, password?: string) => {
    if (!path.trim()) {
      toast({
        title: "Erro",
        description: "O caminho da rede não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('networkBasePath', path);
    if (username) localStorage.setItem('networkUsername', username);
    if (password) localStorage.setItem('networkPassword', password);
    
    setNetworkPath(path);
    setServicosDbPath(`${path}/Precos_Servicos.json`);
    
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
              <UserInfoSection user={user} onLogout={handleLogout} />
            </TabsContent>

            <TabsContent value="dados" className="space-y-4">
              <NetworkConfigSection
                networkPath={networkPath}
                isAutoSyncEnabled={isAutoSyncEnabled}
                isSyncing={isSyncing}
                onNetworkPathChange={handleNetworkPathChange}
                onAutoSyncChange={setIsAutoSyncEnabled}
                onSyncNow={handleSync}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Admin;
