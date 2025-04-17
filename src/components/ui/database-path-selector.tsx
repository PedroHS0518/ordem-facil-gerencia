
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DatabasePathSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPathSelect: (path: string) => void;
  currentPath: string | null;
}

export function DatabasePathSelector({
  open,
  onOpenChange,
  onPathSelect,
  currentPath
}: DatabasePathSelectorProps) {
  const [dbPath, setDbPath] = useState(currentPath || "");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!dbPath.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um caminho válido para o banco de dados",
        variant: "destructive",
      });
      return;
    }

    // Validação simples para garantir que o caminho termina com .db, .sqlite, etc.
    if (!dbPath.endsWith('.db') && !dbPath.endsWith('.sqlite') && !dbPath.endsWith('.sqlite3')) {
      toast({
        title: "Aviso",
        description: "O caminho deve terminar com .db, .sqlite ou .sqlite3",
        variant: "destructive",
      });
      return;
    }

    onPathSelect(dbPath);
    toast({
      title: "Sucesso",
      description: "Caminho do banco de dados configurado com sucesso",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Banco de Dados</DialogTitle>
          <DialogDescription>
            Selecione o caminho onde o banco de dados será armazenado
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="db-path">Caminho do Banco de Dados</Label>
            <div className="flex gap-2">
              <Input
                id="db-path"
                value={dbPath}
                onChange={(e) => setDbPath(e.target.value)}
                placeholder="Ex: C:/ordemfacil/database.db"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                title="Selecionar caminho"
                disabled // Em um ambiente Web não é possível selecionar arquivo do sistema sem input file
              >
                <Database className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nota: No ambiente web, não é possível selecionar diretamente arquivos do sistema.
              Insira manualmente o caminho onde deseja que o banco de dados seja salvo.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
