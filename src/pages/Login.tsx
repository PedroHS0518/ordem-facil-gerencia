
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validação básica
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Erro",
        description: "Usuário e senha são obrigatórios",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Tentativa de login
    const success = login(username, password, remember);
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });
      
      // Verifica se é o usuário Admin para redirecionamento correto
      if (username.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
      <div className="w-full max-w-md">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Ordem Fácil</h1>
          <p className="text-muted-foreground">
            Sistema de Gerenciamento de Ordens de Serviço
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">
              Login
            </h2>
            <p className="text-sm text-muted-foreground">
              Faça login para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer select-none">
                Lembrar de mim neste dispositivo
              </Label>
            </div>

            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-xs">
                A opção "Lembrar de mim" mantém o login apenas neste navegador/dispositivo. Para sincronizar dados entre computadores, você precisará exportar/importar os dados manualmente.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
