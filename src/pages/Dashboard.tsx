
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { ClienteModal } from "@/components/cliente-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrdemModal } from "@/components/ordem-modal";
import { UserSettings } from "@/components/user-settings";
import { useNavigate } from "react-router-dom";
import { Search, User, LogOut, ArrowDownAZ, ArrowUpZA, CalendarArrowUp, CalendarArrowDown, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { 
    ordens, 
    setFiltroTexto, 
    getOrdensFiltradas,
    carregando 
  } = useOrdemServico();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("todos");
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc" | "dateAsc" | "dateDesc">("none");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNovaOrdemOpen, setIsNovaOrdemOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFiltroTexto(searchTerm);
  }, [searchTerm, setFiltroTexto]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleServicesClick = () => {
    navigate("/services-products");
  };

  const filteredOrdens = getOrdensFiltradas()
    .filter(ordem => {
      if (selectedTab === "todos") return true;
      return ordem.status === selectedTab.toUpperCase();
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "asc":
          return a.cliente.localeCompare(b.cliente);
        case "desc":
          return b.cliente.localeCompare(a.cliente);
        case "dateAsc":
          return new Date(a.data_entrada).getTime() - new Date(b.data_entrada).getTime();
        case "dateDesc":
          return new Date(b.data_entrada).getTime() - new Date(a.data_entrada).getTime();
        default:
          return 0;
      }
    });

  const isAdmin = user?.nome.toLowerCase() === 'admin';

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
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Ordem Fácil</h1>
          </div>

          <div className="flex-1 max-w-md mx-8 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar cliente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {sortOrder === "asc" ? <ArrowDownAZ className="h-4 w-4" /> :
                   sortOrder === "desc" ? <ArrowUpZA className="h-4 w-4" /> :
                   sortOrder === "dateAsc" ? <CalendarArrowUp className="h-4 w-4" /> :
                   sortOrder === "dateDesc" ? <CalendarArrowDown className="h-4 w-4" /> :
                   <ArrowDownAZ className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                  <ArrowDownAZ className="mr-2 h-4 w-4" />
                  Nome (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                  <ArrowUpZA className="mr-2 h-4 w-4" />
                  Nome (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("dateAsc")}>
                  <CalendarArrowUp className="mr-2 h-4 w-4" />
                  Data (Mais antiga)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("dateDesc")}>
                  <CalendarArrowDown className="mr-2 h-4 w-4" />
                  Data (Mais recente)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleServicesClick}
            >
              Serviços/Produtos
            </Button>
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={handleAdminClick}
              >
                Admin
              </Button>
            )}
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsNovaOrdemOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nova OS
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setIsSettingsOpen(true)}
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.nome || "Usuário"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
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
        ) : (
          <Tabs defaultValue="todos" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="em aberto">Em Aberto</TabsTrigger>
              <TabsTrigger value="pronto para retirar">Pronto para Retirar</TabsTrigger>
              <TabsTrigger value="encerrado">Encerrado</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              {filteredOrdens.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-card">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Nenhum cliente encontrado com esse termo."
                      : "Não há ordens registradas nesta categoria."}
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
                          <div className="flex items-center gap-2">
                            <StatusBadge status={ordem.status} />
                            <div className="text-xs font-medium bg-primary/10 text-primary rounded px-2 py-1">
                              {ordem.tecnico || "Não atribuído"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

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

      <ClienteModal
        clienteId={clienteSelecionado}
        onOpenChange={(isOpen) => {
          if (!isOpen) setClienteSelecionado(null);
        }}
      />

      <UserSettings 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen}
      />

      <OrdemModal
        open={isNovaOrdemOpen}
        onOpenChange={setIsNovaOrdemOpen}
        mode="create"
      />
    </div>
  );
};

export default Dashboard;
