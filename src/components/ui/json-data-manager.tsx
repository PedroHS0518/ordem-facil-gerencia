
import { useState, useRef } from "react";
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
import { FileJson, Upload, Download, HardDrive, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JsonDataManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (jsonData: string) => boolean;
  onExport: () => void;
  dbPath: string | null;
}

export function JsonDataManager({
  open,
  onOpenChange,
  onImport,
  onExport,
  dbPath
}: JsonDataManagerProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const success = onImport(jsonContent);
        
        if (success) {
          toast({
            title: "Sucesso",
            description: "Dados importados com sucesso",
          });
          onOpenChange(false);
        } else {
          toast({
            title: "Erro",
            description: "Formato de arquivo inválido",
            variant: "destructive",
          });
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

  const handleExport = () => {
    onExport();
    toast({
      title: "Sucesso",
      description: "Dados exportados com sucesso",
    });
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
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              Todas as alterações no sistema são automaticamente salvas no arquivo JSON ao exportar.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Exportar Dados</Label>
              <p className="text-sm text-muted-foreground">
                Salve todos os dados do sistema em um arquivo JSON. 
                Você poderá importá-lo novamente depois.
              </p>
              <Button 
                onClick={handleExport} 
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Importar Dados</Label>
              <p className="text-sm text-muted-foreground">
                Carregue os dados do sistema a partir de um arquivo JSON exportado anteriormente.
                <strong className="block mt-1 text-red-500">
                  Atenção: Isso substituirá todos os dados existentes!
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

          {dbPath && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <Label>Caminho do Banco de Dados</Label>
              </div>
              <p className="text-sm text-muted-foreground break-all">{dbPath}</p>
              <p className="text-xs text-muted-foreground">
                Os dados são mantidos no navegador e podem ser exportados a qualquer momento.
              </p>
            </div>
          )}
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
