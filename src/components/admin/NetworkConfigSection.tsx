
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Database, Upload, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NetworkConfigSectionProps {
  networkPath: string;
  isAutoSyncEnabled: boolean;
  isSyncing: boolean;
  onNetworkPathChange: (path: string, username?: string, password?: string) => void;
  onAutoSyncChange: (enabled: boolean) => void;
  onSyncNow: () => Promise<void>;
}

export function NetworkConfigSection({
  networkPath,
  isAutoSyncEnabled,
  isSyncing,
  onNetworkPathChange,
  onAutoSyncChange,
  onSyncNow
}: NetworkConfigSectionProps) {
  const { toast } = useToast();
  const [isNetworkPathDialogOpen, setIsNetworkPathDialogOpen] = useState(false);
  const [newNetworkPath, setNewNetworkPath] = useState(networkPath);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

  return (
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
              onCheckedChange={onAutoSyncChange}
            />
          </div>

          <Button 
            onClick={onSyncNow} 
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
        </div>
      </CardContent>

      <Dialog open={isNetworkPathDialogOpen} onOpenChange={setIsNetworkPathDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Caminho da Rede</DialogTitle>
            <DialogDescription>
              Insira o caminho da pasta na rede e as credenciais de acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="network-path">Caminho da Rede</Label>
              <Input
                id="network-path"
                value={newNetworkPath}
                onChange={(e) => setNewNetworkPath(e.target.value)}
                placeholder="//servidor/pasta ou smb://servidor/pasta"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário de acesso à rede"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de acesso à rede"
              />
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
    </Card>
  );
}
