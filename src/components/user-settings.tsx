
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User } from "lucide-react";

interface UserSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSettings({ open, onOpenChange }: UserSettingsProps) {
  const { user, logout, changePassword, changeUsername } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [passwordForUsername, setPasswordForUsername] = useState("");
  
  const handlePasswordChange = () => {
    if (!newPassword || !currentPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "A nova senha e a confirmação não conferem.",
        variant: "destructive",
      });
      return;
    }
    
    const success = changePassword(currentPassword, newPassword);
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Erro",
        description: "Senha atual incorreta.",
        variant: "destructive",
      });
    }
  };
  
  const handleUsernameChange = () => {
    if (!newUsername || !passwordForUsername) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const success = changeUsername(newUsername, passwordForUsername);
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Nome de usuário alterado com sucesso.",
      });
      setNewUsername("");
      setPasswordForUsername("");
    } else {
      toast({
        title: "Erro",
        description: "Senha incorreta ou nome de usuário já existe.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    logout();
    onOpenChange(false);
    navigate("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações do Usuário</DialogTitle>
          <DialogDescription>
            {user && `Logado como: ${user.nome} (${user.tipo})`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="password" className="py-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="password">Alterar Senha</TabsTrigger>
            <TabsTrigger value="username">Alterar Nome</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
              />
            </div>
            <Button type="button" className="w-full" onClick={handlePasswordChange}>
              Alterar Senha
            </Button>
          </TabsContent>

          <TabsContent value="username" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">Novo Nome de Usuário</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Digite seu novo nome de usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-confirm">Confirme sua Senha</Label>
              <Input
                id="password-confirm"
                type="password"
                value={passwordForUsername}
                onChange={(e) => setPasswordForUsername(e.target.value)}
                placeholder="Digite sua senha para confirmar"
              />
            </div>
            <Button type="button" className="w-full" onClick={handleUsernameChange}>
              Alterar Nome de Usuário
            </Button>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <Button 
            variant="destructive" 
            onClick={handleLogout} 
            className="w-full flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
