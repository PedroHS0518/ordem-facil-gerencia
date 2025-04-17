
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { ClienteModal } from "@/components/cliente-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNavigate } from "react-router-dom";
import { Search, User, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { 
    ordens, 
    setFiltroStatus, 
    setFiltroTexto, 
    getOrdensFiltradas,
    carregando 
  } = useOrdemServico();
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("EM ABERTO");
  const navigate = useNavigate();

  useEffect(() => {
    setFiltroStatus(activeTab);
  }, [activeTab, setFiltroStatus]);

  useEffect(() => {
    setFiltroTexto(searchTerm);
  }, [searchTerm, setFiltroTexto]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltroTexto(searchTerm);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const filteredOrdens = getOrdensFiltradas();
  const isAdmin = user?.nome.toLowerCase() === 'admin';

  // Função para formatar data em formato brasileiro
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Ordem Fácil</h1>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar cliente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={handleAdminClick}
              >
                Admin
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.nome || "Usuário"}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        <Tabs 
          defaultValue="EM ABERTO" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="EM ABERTO">Em Aberto</TabsTrigger>
            <TabsTrigger value="PRONTO PARA RETIRAR">Pronto para Retirar</TabsTrigger>
            <TabsTrigger value="ENCERRADO">Encerrado</TabsTrigger>
          </TabsList>

          {["EM ABERTO", "PRONTO PARA RETIRAR", "ENCERRADO"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {status === "EM ABERTO" 
                    ? "Ordens em Aberto" 
                    : status === "PRONTO PARA RETIRAR" 
                    ? "Pronto para Retirar"
                    : "Ordens Encerradas"}
                </h2>
                <StatusBadge status={status as any} />
              </div>

              {carregando ? (
                <div className="text-center py-12">
                  <p>Carregando...</p>
                </div>
              ) : ordens.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-card">
                  <p className="text-muted-foreground">
                    Nenhum dado cadastrado. Acesse o painel administrativo para importar os dados iniciais.
                  </p>
                </div>
              ) : filteredOrdens.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-card">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Nenhum cliente encontrado com esse termo."
                      : status === "EM ABERTO"
                      ? "Não há ordens em aberto."
                      : status === "PRONTO PARA RETIRAR"
                      ? "Não há ordens prontas para retirada."
                      : "Não há ordens encerradas."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrdens.map((ordem) => (
                    <div
                      key={ordem.id}
                      className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setClienteSelecionado(ordem.id)}
                    >
                      <div className="flex flex-col gap-2">
                        <h3 className="font-medium line-clamp-1">{ordem.cliente}</h3>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {ordem.equipo} - {ordem.marca} {ordem.modelo}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">
                            Entrada: {formatarData(ordem.data_entrada)}
                          </div>
                          <div className="text-xs font-medium bg-primary/10 text-primary rounded px-2 py-1">
                            {ordem.tecnico || "Não atribuído"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4">
        <div className="container flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ordem Fácil. Todos os direitos reservados.
          </div>
          <div className="text-sm text-muted-foreground">
            {ordens.length} ordens registradas
          </div>
        </div>
      </footer>

      {/* Cliente Modal */}
      <ClienteModal
        clienteId={clienteSelecionado}
        onOpenChange={(isOpen) => {
          if (!isOpen) setClienteSelecionado(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
