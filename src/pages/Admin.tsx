
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
import { JsonDataManager } from "@/components/ui/json-data-manager";
import { createAuthenticatedPath, syncWithNetwork, ensureNetworkFileExists } from "@/lib/networkUtils";

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { servicosDbPath, setServicosDbPath, dbPath, setDbPath, carregarDadosJSON } = useOrdemServico();
  const { sincronizarComRede, exportItems, importItems } = useServiceProduct();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [networkPath, setNetworkPath] = useState("");
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);

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
    
    // Update paths for both data files
    const ordensFilePath = `${path}/Clientes_OS.json`;
    const servicosFilePath = `${path}/Precos_Servicos.json`;
    
    setDbPath(ordensFilePath);
    setServicosDbPath(servicosFilePath);
    
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
      // Create authenticated paths
      const username = localStorage.getItem('networkUsername') || undefined;
      const password = localStorage.getItem('networkPassword') || undefined;
      const authenticatedPath = createAuthenticatedPath(networkPath, username, password);
      
      // Define file paths
      const servicosFilePath = `${authenticatedPath}/Precos_Servicos.json`;
      const ordensFilePath = `${authenticatedPath}/Clientes_OS.json`;
      
      // Ensure both files exist, creating them if they don't
      await ensureNetworkFileExists(servicosFilePath, []);
      await ensureNetworkFileExists(ordensFilePath, { ordens: [], logs: [], dbConfig: {} });
      
      // Sync service products data
      const servicosResult = await syncWithNetwork(servicosFilePath);
      let servicosSuccess = false;
      
      if (servicosResult.success && servicosResult.data) {
        servicosSuccess = importItems(JSON.stringify(servicosResult.data));
      }
      
      // Sync orders data
      const ordensResult = await syncWithNetwork(ordensFilePath);
      let ordensSuccess = false;
      
      if (ordensResult.success && ordensResult.data) {
        ordensSuccess = carregarDadosJSON(JSON.stringify(ordensResult.data));
      }
      
      if (servicosSuccess || ordensSuccess) {
        toast({
          title: "Sincronização Completa",
          description: "Dados sincronizados com sucesso da rede!",
        });
      } else {
        toast({
          title: "Erro na Sincronização",
          description: "Falha ao sincronizar dados da rede. Verifique os arquivos e permissões.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro durante a sincronização:", error);
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao sincronizar os dados: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenFileManager = () => {
    setIsFileManagerOpen(true);
  };

  const handleCloseFileManager = () => {
    setIsFileManagerOpen(false);
  };

  const handleImportData = (jsonString: string): boolean => {
    return carregarDadosJSON(jsonString);
  };

  const handleExportData = () => {
    // This method is handled inside the JsonDataManager component
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
                onOpenFileManager={handleOpenFileManager}
              />
            </TabsContent>
          </Tabs>
        </main>

        <JsonDataManager
          open={isFileManagerOpen}
          onOpenChange={handleCloseFileManager}
          onImport={handleImportData}
          onExport={handleExportData}
          dbPath={dbPath}
          servicosDbPath={servicosDbPath}
        />
      </div>
    </TooltipProvider>
  );
};

export default Admin;
