import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Database, Upload, Download, RefreshCw, Network } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createAuthenticatedPath } from "@/lib/networkUtils";

interface NetworkConfigSectionProps {
  networkPath: string;
  isAutoSyncEnabled: boolean;
  isSyncing: boolean;
  onNetworkPathChange: (path: string, username?: string, password?: string) => void;
  onAutoSyncChange: (enabled: boolean) => void;
  onSyncNow: () => Promise<void>;
  onOpenFileManager: () => void;
}

export function NetworkConfigSection({
  networkPath,
  isAutoSyncEnabled,
  isSyncing,
  onNetworkPathChange,
  onAutoSyncChange,
  onSyncNow,
  onOpenFileManager
}: NetworkConfigSectionProps) {
  const { toast } = useToast();
  const [isNetworkPathDialogOpen, setIsNetworkPathDialogOpen] = useState(false);
  const [newNetworkPath, setNewNetworkPath] = useState(networkPath);
  const [username, setUsername] = useState(localStorage.getItem('networkUsername') || "");
  const [password, setPassword] = useState(localStorage.getItem('networkPassword') || "");
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSaveNetworkPath = () => {
    if (!newNetworkPath.trim()) {
      toast({
        title: "Erro",
        description: "O caminho da rede não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    onNetworkPathChange(newNetworkPath, username, password);
    setIsNetworkPathDialogOpen(false);
    toast({
      title: "Sucesso",
      description: "Caminho da rede configurado com sucesso!",
    });
  };

  const handleTestConnection = async () => {
    if (!newNetworkPath.trim()) {
      toast({
        title: "Erro",
        description: "O caminho FTP não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(true);
    try {
      const authenticatedPath = createAuthenticatedPath(newNetworkPath, username, password);
      const testUrl = `${authenticatedPath}/connection_test.json`;
      
      const response = await fetch(testUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'connection', timestamp: new Date().toISOString() })
      });
      
      if (response.ok) {
        toast({
          title: "Conexão Bem-Sucedida",
          description: "A conexão com o servidor FTP foi estabelecida com sucesso!",
        });
      } else {
        toast({
          title: "Erro de Conexão",
          description: `Falha na conexão: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de Conexão",
        description: `Não foi possível conectar ao servidor FTP: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Servidor FTP</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertDescription>
            Configure o caminho do servidor FTP onde os arquivos serão salvos e sincronizados automaticamente.
            Exemplo: ftp://servidor/pasta ou ftp://192.168.1.100/pasta
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
              onCheckedChange={onAutoSyncChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={onSyncNow} 
              disabled={isSyncing || !networkPath}
              className="w-full"
            >
              {isSyncing ? (
                <>
                  Sincronizando...
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Sincronizar Agora
                  <Download className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onOpenFileManager}
              className="w-full"
            >
              <Network className="mr-2 h-4 w-4" />
              Gerenciar Arquivos
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={isNetworkPathDialogOpen} onOpenChange={setIsNetworkPathDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Servidor FTP</DialogTitle>
            <DialogDescription>
              Insira o endereço do servidor FTP e as credenciais de acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="network-path">Caminho do Servidor FTP</Label>
              <Input
                id="network-path"
                value={newNetworkPath}
                onChange={(e) => setNewNetworkPath(e.target.value)}
                placeholder="ftp://servidor/pasta ou ftp://192.168.1.100/pasta"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário de acesso ao servidor FTP"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de acesso ao servidor FTP"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button 
              variant="outline"
              onClick={handleTestConnection}
              disabled={testingConnection || !newNetworkPath}
            >
              {testingConnection ? "Testando..." : "Testar Conexão"}
            </Button>
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
    </Card>
  );
}
