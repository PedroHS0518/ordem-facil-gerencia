
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileJson, Upload, Download, HardDrive, AlertCircle, Info, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useServiceProduct } from "@/contexts/ServiceProductContext";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { Switch } from "@/components/ui/switch";

interface JsonDataManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (jsonData: string) => boolean;
  onExport: () => void;
  dbPath: string | null;
  servicosDbPath?: string | null;
}

export function JsonDataManager({
  open,
  onOpenChange,
  onImport,
  onExport,
  dbPath,
  servicosDbPath
}: JsonDataManagerProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportItems, importItems, sincronizarComRede } = useServiceProduct();
  const { sincronizarComRede: sincronizarOrdensComRede, ativarSincronizacaoAutomatica } = useOrdemServico();
  const [sincronizacaoAtiva, setSincronizacaoAtiva] = useState(
    localStorage.getItem('ordemFacilSincroAuto') === 'true'
  );
  
  // Verifica se os caminhos são URLs válidas
  const isValidUrl = (string: string | null): boolean => {
    if (!string) return false;
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  const dbPathEhUrl = isValidUrl(dbPath);
  const servicosPathEhUrl = isValidUrl(servicosDbPath || null);

  // Atualiza o estado de sincronização quando o componente monta
  useEffect(() => {
    setSincronizacaoAtiva(localStorage.getItem('ordemFacilSincroAuto') === 'true');
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        // Determina se é um arquivo de ordens ou de serviços/produtos
        const isOrdemFile = file.name.toLowerCase().includes('cliente') || 
                            file.name.toLowerCase().includes('ordem');
        const isServiceFile = file.name.toLowerCase().includes('preco') || 
                            file.name.toLowerCase().includes('servico') ||
                            file.name.toLowerCase().includes('produto');
        
        let success = false;
        
        if (isServiceFile) {
          success = importItems(jsonContent);
          if (success) {
            toast({
              title: "Sucesso",
              description: "Serviços e produtos importados com sucesso",
            });
          }
        } else {
          // Assume que é um arquivo de ordens por padrão
          success = onImport(jsonContent);
          if (success) {
            toast({
              title: "Sucesso",
              description: "Ordens de serviço importadas com sucesso",
            });
          }
        }
        
        if (!success) {
          toast({
            title: "Erro",
            description: "Formato de arquivo inválido",
            variant: "destructive",
          });
        } else {
          onOpenChange(false);
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao processar o arquivo",
          variant: "destructive",
        });
        console.error('Erro ao importar JSON:', error);
      } finally {
        setUploading(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Erro",
        description: "Falha ao ler o arquivo",
        variant: "destructive",
      });
      setUploading(false);
    };
    
    reader.readAsText(file);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleExportOrders = () => {
    onExport();
    toast({
      title: "Sucesso",
      description: "Ordens de serviço exportadas com sucesso",
    });
  };

  const handleExportServices = () => {
    // Criar um blob com os dados de serviços e produtos
    const jsonData = exportItems();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Criar um elemento <a> para download
    const a = document.createElement('a');
    a.href = url;
    a.download = servicosDbPath || 'Precos_Servicos.json';
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    toast({
      title: "Sucesso",
      description: "Serviços e produtos exportados com sucesso",
    });
  };

  const handleToggleSincronizacao = (checked: boolean) => {
    setSincronizacaoAtiva(checked);
    ativarSincronizacaoAutomatica(checked);
    
    toast({
      title: checked ? "Sincronização Automática Ativada" : "Sincronização Automática Desativada",
      description: checked 
        ? "Os dados serão automaticamente sincronizados com o servidor" 
        : "A sincronização automática foi desativada",
    });
  };

  const handleSincronizarAgora = async () => {
    let sucessoOrdens = false;
    let sucessoServicos = false;
    
    if (dbPath && isValidUrl(dbPath)) {
      sucessoOrdens = await sincronizarOrdensComRede(dbPath);
    }
    
    if (servicosDbPath && isValidUrl(servicosDbPath)) {
      sucessoServicos = await sincronizarComRede(servicosDbPath);
    }
    
    if (sucessoOrdens || sucessoServicos) {
      toast({
        title: "Sincronização Concluída",
        description: "Dados sincronizados com sucesso do servidor",
      });
    } else {
      toast({
        title: "Falha na Sincronização",
        description: "Não foi possível sincronizar com o servidor",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Dados</DialogTitle>
          <DialogDescription>
            Exporte ou importe os dados do sistema
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              <strong>Importante:</strong> Os dados são armazenados apenas neste dispositivo. 
              Para usar em outro computador, você deve exportar os dados aqui e importá-los no outro dispositivo.
            </AlertDescription>
          </Alert>

          {(dbPathEhUrl || servicosPathEhUrl) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sincronização Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Configure a sincronização automática com o servidor de rede
                </p>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Sincronização Automática
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sincronize automaticamente dados com o servidor
                    </p>
                  </div>
                  <Switch
                    checked={sincronizacaoAtiva}
                    onCheckedChange={handleToggleSincronizacao}
                  />
                </div>
                
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleSincronizarAgora}
                >
                  <RefreshCw className="h-4 w-4" />
                  Sincronizar Agora
                </Button>
              </div>
            </div>
          )}
        
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Exportar Dados</Label>
              <p className="text-sm text-muted-foreground">
                Salve todos os dados do sistema em arquivos JSON. 
                Você poderá importá-los novamente depois em qualquer computador.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button 
                  onClick={handleExportOrders} 
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Ordens
                </Button>
                <Button 
                  onClick={handleExportServices} 
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Serviços
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Importar Dados</Label>
              <p className="text-sm text-muted-foreground">
                Carregue os dados do sistema a partir de um arquivo JSON exportado anteriormente.
                <strong className="block mt-1 text-red-500">
                  Atenção: Isso substituirá os dados existentes do tipo correspondente!
                </strong>
              </p>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={handleClickUpload} 
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Importando..." : "Selecionar Arquivo JSON"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dbPath && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <Label>Arquivo de Ordens</Label>
                </div>
                <p className="text-sm text-muted-foreground break-all">{dbPath}</p>
                {dbPathEhUrl && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    URL Remota
                  </span>
                )}
              </div>
            )}
            
            {servicosDbPath && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <Label>Arquivo de Serviços</Label>
                </div>
                <p className="text-sm text-muted-foreground break-all">{servicosDbPath}</p>
                {servicosPathEhUrl && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    URL Remota
                  </span>
                )}
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Os dados são mantidos localmente neste navegador. Para sincronizar entre dispositivos, 
            você deve exportar os dados em um computador e importar no outro.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
